BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS citus;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- (Pasirinktinai) jei nori mažiau shard'ų lab aplinkoje (2 worker'iai):
-- SET citus.shard_count = 16;

-- Išvalymas (jei testuoji iš naujo)
DROP TABLE IF EXISTS public.cart CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

-- 1) TENANTS (reference) – globalus sąrašas, mažas, patogu kopijuoti į visus node'us
CREATE TABLE public.tenants (
  tenant_id   uuid PRIMARY KEY,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 2) USERS – priklauso tenant'ui
-- PK ir UNIQUE privalo turėti tenant_id, jei lentelė distributed pagal tenant_id
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

-- 3) PRODUCTS – priklauso tenant'ui (dažniausias multi-tenant e-shop variantas)
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

-- 4) CART – ryšys tarp users ir products, priklauso tenant'ui
CREATE TABLE public.cart (
  tenant_id   uuid NOT NULL,
  user_id     uuid NOT NULL,
  product_id  uuid NOT NULL,
  quantity    int NOT NULL CHECK (quantity > 0),
  added       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id, product_id),

  -- FK su tenant_id, kad būtų co-located ir logiškai korektiška
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

-- ===== Citus distribution =====

-- Tenants kaip reference
SELECT create_reference_table('public.tenants');

-- Visi „tenantiniai“ duomenys distributed pagal tenant_id (co-location!)
SELECT create_distributed_table('public.users', 'tenant_id');
SELECT create_distributed_table('public.products', 'tenant_id');
SELECT create_distributed_table('public.cart', 'tenant_id');

COMMIT;
