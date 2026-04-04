CREATE EXTENSION IF NOT EXISTS citus;

DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS products CASCADE;

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

-- shardinimas
SELECT create_distributed_table('users', 'user_id');
SELECT create_distributed_table('products', 'product_id');
SELECT create_distributed_table('cart', 'user_id');
