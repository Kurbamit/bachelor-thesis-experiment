CREATE EXTENSION IF NOT EXISTS citus;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- USERS (reference)
CREATE TABLE public.users (
  user_id        uuid PRIMARY KEY,
  name           text NOT NULL,
  email          text NOT NULL UNIQUE,
  register_date  timestamptz NOT NULL DEFAULT now()
);

-- PRODUCTS (reference)
CREATE TABLE public.products (
  product_id uuid PRIMARY KEY,
  name       text NOT NULL,
  price      numeric(12,2) NOT NULL CHECK (price >= 0),
  category   text NOT NULL
);

-- CART (distributed)
CREATE TABLE public.cart (
  user_id    uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity   int  NOT NULL CHECK (quantity > 0),
  added      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id),
  CONSTRAINT fk_cart_user
    FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_product
    FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE RESTRICT
);

CREATE INDEX ix_cart_user_added ON public.cart (user_id, added DESC);

-- Citus distribution
SELECT create_reference_table('public.users');
SELECT create_reference_table('public.products');
SELECT create_distributed_table('public.cart', 'user_id');
