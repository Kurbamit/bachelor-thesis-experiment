# Database Schema

## Citus Distribution

Citus extends PostgreSQL to support horizontal sharding. Tables can be distributed across worker nodes using a shard key.

## Schema: Tenant-Based Sharding

This is the recommended sharding strategy for multi-tenant applications. All tenant-scoped data is distributed by `tenant_id` for optimal co-location.

### Reference Tables

Reference tables are small, global tables that are replicated to all workers:

```sql
-- Tenants table (reference table)
CREATE TABLE public.tenants (
  tenant_id   uuid PRIMARY KEY,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

SELECT create_reference_table('public.tenants');
```

### Distributed Tables

Distributed tables are sharded across workers by their shard key:

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

-- Cart (belongs to user in tenant)
CREATE TABLE public.cart (
  tenant_id   uuid NOT NULL,
  user_id     uuid NOT NULL,
  product_id  uuid NOT NULL,
  quantity    int NOT NULL CHECK (quantity > 0),
  added       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id, product_id),

  CONSTRAINT fk_cart_user
    FOREIGN KEY (tenant_id, user_id)
    REFERENCES public.users(tenant_id, user_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_cart_product
    FOREIGN KEY (tenant_id, product_id)
    REFERENCES public.products(tenant_id, product_id)
    ON DELETE RESTRICT
);

CREATE INDEX ix_cart_tenant_user_added
  ON public.cart (tenant_id, user_id, added DESC);

-- Distribution
SELECT create_distributed_table('public.users', 'tenant_id');
SELECT create_distributed_table('public.products', 'tenant_id');
SELECT create_distributed_table('public.cart', 'tenant_id');
```

## Schema: Simple Sharding (Entity-Based)

Alternative strategy where each table is distributed by its own primary key:

```sql
CREATE EXTENSION IF NOT EXISTS citus;

CREATE TABLE users (
  user_id uuid PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  register_date timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE products (
  product_id uuid PRIMARY KEY,
  name text NOT NULL,
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  category text NOT NULL
);

CREATE TABLE cart (
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity int NOT NULL CHECK (quantity > 0),
  added timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

-- Distribution by entity ID
SELECT create_distributed_table('users', 'user_id');
SELECT create_distributed_table('products', 'product_id');
SELECT create_distributed_table('cart', 'user_id');
```

## Checking Shard Distribution

Query to see how data is distributed across shards:

```sql
-- Show shard information
SELECT * FROM citus_shards;

-- Show table distribution
SELECT logicalrelname, shardid, shardlength, citus_table_type
FROM citus_shards
WHERE logicalrelname IN ('users', 'products', 'cart');

-- Check which worker contains a specific tenant's data
SELECT * FROM citus_shard_placements
WHERE shardid IN (
  SELECT shardid FROM citus_shards
  WHERE logicalrelname = 'cart'
  AND shardminvalue::uuid <= 'your-tenant-id'::uuid
  AND shardmaxvalue::uuid >= 'your-tenant-id'::uuid
);
```

## Data Generation

See `database/migrations/` for test data generation scripts.

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
                             │                    ▲
                             │ 1:N                │
                             ▼                    │
                      ┌─────────────┐              │
                      │    cart     │──────────────┘
                      │─────────────│
                      │ tenant_id  │◄──────────┐
                      │ user_id    │           │
                      │ product_id │           │
                      │ quantity   │           │
                      │ added      │           │
                      └─────────────┘           │
                                               │
                     ┌──────────────────────────┘
                     │ FK: tenant_id, product_id
                     │ RESTRICT (can't delete product with cart items)
```
