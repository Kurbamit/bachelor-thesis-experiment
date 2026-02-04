CREATE EXTENSION IF NOT EXISTS citus;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE public.product_category AS ENUM (
  'Electronics',
  'Clothing',
  'HomeGoods',
  'Books',
  'Toys'
);

CREATE TABLE public.tenants (
  tenant_id uuid PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE public.users (
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  username text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL,

  PRIMARY KEY (tenant_id, user_id),

  CONSTRAINT fk_users_tenants
    FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(tenant_id)
);

CREATE TABLE public.products (
  tenant_id uuid NOT NULL,
  product_id uuid NOT NULL,
  name text NOT NULL,
  price numeric(12,2) NOT NULL,
  category product_category NOT NULL,
  created_at timestamptz NOT NULL,

  PRIMARY KEY (tenant_id, product_id),

  CONSTRAINT fk_products_tenants
    FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(tenant_id)
);

CREATE TABLE public.product_variants (
  tenant_id uuid NOT NULL,
  variant_id uuid NOT NULL,
  product_id uuid NOT NULL,
  variant_name text NOT NULL,
  additional_price numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL,

  PRIMARY KEY (tenant_id, variant_id),

  CONSTRAINT fk_variants_tenants
    FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(tenant_id),

  CONSTRAINT fk_variants_products
    FOREIGN KEY (tenant_id, product_id)
    REFERENCES public.products(tenant_id, product_id)
);

CREATE TABLE public.discounts (
  tenant_id uuid NOT NULL,
  discount_id uuid NOT NULL,
  code text NOT NULL,
  percentage numeric(5,2) NOT NULL,
  valid_from timestamptz NOT NULL,
  valid_to timestamptz NOT NULL,

  PRIMARY KEY (tenant_id, discount_id),

  CONSTRAINT fk_discounts_tenants
    FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(tenant_id)
);

CREATE TABLE public.carts (
  tenant_id uuid NOT NULL,
  cart_id uuid NOT NULL,
  user_id uuid NOT NULL,
  discount_id uuid NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,

  PRIMARY KEY (tenant_id, cart_id),

  CONSTRAINT fk_carts_tenants
    FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(tenant_id),

  CONSTRAINT fk_carts_users
    FOREIGN KEY (tenant_id, user_id)
    REFERENCES public.users(tenant_id, user_id),

  CONSTRAINT fk_carts_discounts
    FOREIGN KEY (tenant_id, discount_id)
    REFERENCES public.discounts(tenant_id, discount_id)
);

CREATE TABLE public.cart_items (
  tenant_id uuid NOT NULL,
  cart_item_id uuid NOT NULL,
  cart_id uuid NOT NULL,
  product_id uuid NOT NULL,
  variant_id uuid NULL,
  quantity int NOT NULL,
  created_at timestamptz NOT NULL,

  PRIMARY KEY (tenant_id, cart_item_id),

  CONSTRAINT fk_cart_items_tenants
    FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(tenant_id),

  CONSTRAINT fk_cart_items_carts
    FOREIGN KEY (tenant_id, cart_id)
    REFERENCES public.carts(tenant_id, cart_id),

  CONSTRAINT fk_cart_items_products
    FOREIGN KEY (tenant_id, product_id)
    REFERENCES public.products(tenant_id, product_id),

  CONSTRAINT fk_cart_items_variants
    FOREIGN KEY (tenant_id, variant_id)
    REFERENCES public.product_variants(tenant_id, variant_id)
);


-- ===== Citus distribution =====
SELECT citus_set_coordinator_host('citus_coordinator');
SELECT citus_add_node('citus_worker_1', 5432);
SELECT citus_add_node('citus_worker_2', 5432);


SELECT create_reference_table('public.tenants');
SELECT create_distributed_table('public.users', 'tenant_id');
SELECT create_distributed_table('public.products', 'tenant_id');
SELECT create_distributed_table('public.product_variants', 'tenant_id');
SELECT create_distributed_table('public.discounts', 'tenant_id');
SELECT create_distributed_table('public.carts', 'tenant_id');
SELECT create_distributed_table('public.cart_items', 'tenant_id');