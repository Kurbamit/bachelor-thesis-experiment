# Database Schema

## Data Model

The experiment uses a multi-tenant e-commerce shopping cart model with 7 entities:

- **tenants** – top-level entity representing individual stores
- **users** – buyers belonging to a tenant
- **products** – product catalogue scoped to tenant
- **product_variants** – product variants (size, color) scoped to tenant
- **discounts** – tenant-scoped discount codes
- **carts** – active user sessions
- **cart_items** – join table linking carts to products

## PostgreSQL + Citus Schema

### Reference Tables

Reference tables are small, global tables that are replicated to all workers:

```sql
-- Tenants table (reference table - replicated to all workers)
CREATE TABLE public.tenants (
  tenant_id   uuid PRIMARY KEY,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

SELECT create_reference_table('public.tenants');
```

### Distributed Tables

All tenant-scoped tables are distributed by `tenant_id` for optimal co-location:

```sql
-- Users (belongs to tenant)
CREATE TABLE public.users (
  tenant_id      uuid NOT NULL,
  user_id        uuid NOT NULL,
  name           text NOT NULL,
  email          text NOT NULL,
  register_date  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id),
  UNIQUE (tenant_id, email),
  CONSTRAINT fk_users_tenant
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE CASCADE
);

-- Products (belongs to tenant)
CREATE TABLE public.products (
  tenant_id   uuid NOT NULL,
  product_id  uuid NOT NULL,
  name        text NOT NULL,
  price       numeric(12,2) NOT NULL CHECK (price >= 0),
  category    text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, product_id),
  CONSTRAINT fk_products_tenant
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE CASCADE
);

-- Product variants (size, color, etc.)
CREATE TABLE public.product_variants (
  tenant_id       uuid NOT NULL,
  variant_id      uuid NOT NULL,
  product_id      uuid NOT NULL,
  sku             text NOT NULL,
  attributes       jsonb NOT NULL DEFAULT '{}',
  priceModifier    numeric(12,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id, variant_id),
  CONSTRAINT fk_variant_product
    FOREIGN KEY (tenant_id, product_id)
    REFERENCES public.products(tenant_id, product_id) ON DELETE CASCADE
);

-- Discounts (tenant-scoped)
CREATE TABLE public.discounts (
  tenant_id    uuid NOT NULL,
  discount_id  uuid NOT NULL,
  code         text NOT NULL,
  type         text NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value        numeric(12,2) NOT NULL,
  min_quantity int,
  expires_at   timestamptz,
  PRIMARY KEY (tenant_id, discount_id),
  UNIQUE (tenant_id, code),
  CONSTRAINT fk_discounts_tenant
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(tenant_id) ON DELETE CASCADE
);

-- Carts (active user sessions)
CREATE TABLE public.carts (
  tenant_id    uuid NOT NULL,
  cart_id      uuid NOT NULL,
  user_id      uuid NOT NULL,
  discount_id  uuid,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, cart_id),
  CONSTRAINT fk_carts_user
    FOREIGN KEY (tenant_id, user_id)
    REFERENCES public.users(tenant_id, user_id) ON DELETE CASCADE,
  CONSTRAINT fk_carts_discount
    FOREIGN KEY (tenant_id, discount_id)
    REFERENCES public.discounts(tenant_id, discount_id) ON DELETE SET NULL
);

-- Cart items (join table)
CREATE TABLE public.cart_items (
  tenant_id    uuid NOT NULL,
  cart_item_id uuid NOT NULL,
  cart_id      uuid NOT NULL,
  product_id   uuid NOT NULL,
  variant_id   uuid,
  quantity     int NOT NULL CHECK (quantity > 0),
  added_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, cart_item_id),
  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (tenant_id, cart_id)
    REFERENCES public.carts(tenant_id, cart_id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (tenant_id, product_id)
    REFERENCES public.products(tenant_id, product_id) ON DELETE RESTRICT,
  CONSTRAINT fk_cart_items_variant
    FOREIGN KEY (tenant_id, variant_id)
    REFERENCES public.product_variants(tenant_id, variant_id) ON DELETE SET NULL
);

CREATE INDEX idx_cart_items_cart_id ON public.cart_items (tenant_id, cart_id);
CREATE INDEX idx_carts_user_id ON public.carts (tenant_id, user_id);
```

### Distribution

```sql
-- Reference table (replicated to all workers)
SELECT create_reference_table('public.tenants');

-- Distributed tables (hash-sharded by tenant_id)
SELECT create_distributed_table('public.users', 'tenant_id');
SELECT create_distributed_table('public.products', 'tenant_id');
SELECT create_distributed_table('public.product_variants', 'tenant_id');
SELECT create_distributed_table('public.discounts', 'tenant_id');
SELECT create_distributed_table('public.carts', 'tenant_id');
SELECT create_distributed_table('public.cart_items', 'tenant_id');
```

## Redis Data Model

In Redis, the full cart state is stored as a single JSON object per cart key:

```
Key: cart:{cartId}
Value: {
  "tenantId": "uuid",
  "userId": "uuid",
  "discountId": "uuid|null",
  "items": [
    {
      "productId": "uuid",
      "variantId": "uuid|null",
      "productName": "string",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Key patterns:**
- `cart:{cartId}` - Cart data
- `cart:tenant:{tenantId}:user:{userId}` - Index of user's active cart

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  tenants    │       │   users    │       │  products   │
│─────────────│       │─────────────│       │─────────────│
│ tenant_id PK│◄──────│ tenant_id  │       │ tenant_id   │
│ name        │  1:N  │ user_id PK │       │ product_id PK│
│ created_at  │       │ name       │       │ name        │
└─────────────┘       │ email      │       │ price       │
                      │ register_  │       │ category    │
                      │   date     │       │ created_at  │
                      └─────────────┘       └─────────────┘
                             │                     ▲
                             │ 1:N                 │
                             ▼                     │
                      ┌─────────────┐              │
                      │    carts    │──────────────┘
                      │─────────────│              │
                      │ tenant_id  │◄──┐           │
                      │ cart_id PK │   │           │
                      │ user_id    │───┘           │
                      │ discount_id│   │           │
                      └─────────────┘   │           │
                             │          │           │
                             │ 1:N      │           │
                             ▼          │           │
                      ┌─────────────┐   │           │
                      │ cart_items  │───┘           │
                      │─────────────│               │
                      │ cart_item_id│◄───────────────┘
                      │ product_id │ (RESTRICT)
                      │ variant_id │
                      │ quantity   │
                      └─────────────┘

┌─────────────────┐       ┌─────────────┐
│    discounts    │       │product_variants
│─────────────────│       │─────────────│
│ tenant_id PK   │◄──────│ tenant_id  │
│ discount_id PK │  1:N  │ variant_id │
│ code           │       │ product_id │
│ type           │       │ sku        │
│ value          │       │ attributes │
└─────────────────┘       └─────────────┘
```

## Checking Shard Distribution (PostgreSQL/Citus)

```sql
-- Show all shards
SELECT * FROM citus_shards;

-- Show table distribution
SELECT logicalrelname, shardid, shardlength, citus_table_type
FROM citus_shards
WHERE logicalrelname IN ('users', 'products', 'carts', 'cart_items');

-- Find which worker contains a specific tenant's data
SELECT shardid, citus_table_type, nodeid, nodeName
FROM citus_shard_placements
WHERE shardid IN (
  SELECT shardid FROM citus_shards
  WHERE logicalrelname = 'carts'
  AND shardminvalue::uuid <= 'your-tenant-id'::uuid
  AND shardmaxvalue::uuid >= 'your-tenant-id'::uuid
);
```

## Data Generation

See `database/migrations/` for test data generation scripts.

**Scale:**
- 100 tenants
- 1,000 users per tenant
- 10,000 products per tenant
- Variable cart items (1-20 per cart)
