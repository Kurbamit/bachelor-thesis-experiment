-- ===== Test Data Generation Script =====
-- This script generates sample data for a multi-tenant e-commerce system

-- Clean up existing data (optional - uncomment if needed)
-- TRUNCATE TABLE public.cart_items, public.carts, public.discounts, 
--   public.product_variants, public.products, public.users, public.tenants CASCADE;

-- ===== Insert Tenants =====
INSERT INTO public.tenants (tenant_id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'TechStore Inc'),
  ('22222222-2222-2222-2222-222222222222', 'FashionHub Ltd'),
  ('33333333-3333-3333-3333-333333333333', 'BookWorld Co'),
  ('a7f3c8e9-4b2d-4a1e-9f6b-3d8c7e5a2f1b', 'GameZone Pro'),
  ('d4e9b6c2-8f3a-4d7e-b2c1-9a5f8e3d7c4b', 'HomeDecor Plus');

-- ===== Insert Users =====
-- Tenant 1: TechStore Inc
INSERT INTO public.users (tenant_id, user_id, username, email, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'john_doe', 'john.doe@techstore.com', NOW() - INTERVAL '30 days'),
  ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'jane_smith', 'jane.smith@techstore.com', NOW() - INTERVAL '25 days'),
  ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'bob_johnson', 'bob.j@techstore.com', NOW() - INTERVAL '20 days'),
  ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'alice_williams', 'alice.w@techstore.com', NOW() - INTERVAL '15 days'),
  ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'charlie_brown', 'charlie.b@techstore.com', NOW() - INTERVAL '10 days');

-- Tenant 2: FashionHub Ltd
INSERT INTO public.users (tenant_id, user_id, username, email, created_at) VALUES
  ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), 'emma_davis', 'emma.d@fashionhub.com', NOW() - INTERVAL '28 days'),
  ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), 'michael_wilson', 'michael.w@fashionhub.com', NOW() - INTERVAL '22 days'),
  ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), 'sophia_taylor', 'sophia.t@fashionhub.com', NOW() - INTERVAL '18 days'),
  ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), 'oliver_anderson', 'oliver.a@fashionhub.com', NOW() - INTERVAL '12 days');

-- Tenant 3: BookWorld Co
INSERT INTO public.users (tenant_id, user_id, username, email, created_at) VALUES
  ('33333333-3333-3333-3333-333333333333', gen_random_uuid(), 'sarah_martinez', 'sarah.m@bookworld.com', NOW() - INTERVAL '26 days'),
  ('33333333-3333-3333-3333-333333333333', gen_random_uuid(), 'david_garcia', 'david.g@bookworld.com', NOW() - INTERVAL '19 days'),
  ('33333333-3333-3333-3333-333333333333', gen_random_uuid(), 'lisa_rodriguez', 'lisa.r@bookworld.com', NOW() - INTERVAL '14 days');

-- Tenant 4: GameZone Pro
INSERT INTO public.users (tenant_id, user_id, username, email, created_at) VALUES
  ('a7f3c8e9-4b2d-4a1e-9f6b-3d8c7e5a2f1b', gen_random_uuid(), 'alex_gamer', 'alex.g@gamezone.com', NOW() - INTERVAL '24 days'),
  ('a7f3c8e9-4b2d-4a1e-9f6b-3d8c7e5a2f1b', gen_random_uuid(), 'nina_player', 'nina.p@gamezone.com', NOW() - INTERVAL '16 days'),
  ('a7f3c8e9-4b2d-4a1e-9f6b-3d8c7e5a2f1b', gen_random_uuid(), 'mark_streamer', 'mark.s@gamezone.com', NOW() - INTERVAL '11 days'),
  ('a7f3c8e9-4b2d-4a1e-9f6b-3d8c7e5a2f1b', gen_random_uuid(), 'crystal_pro', 'crystal.p@gamezone.com', NOW() - INTERVAL '8 days');

-- Tenant 5: HomeDecor Plus
INSERT INTO public.users (tenant_id, user_id, username, email, created_at) VALUES
  ('d4e9b6c2-8f3a-4d7e-b2c1-9a5f8e3d7c4b', gen_random_uuid(), 'rachel_designer', 'rachel.d@homedecor.com', NOW() - INTERVAL '27 days'),
  ('d4e9b6c2-8f3a-4d7e-b2c1-9a5f8e3d7c4b', gen_random_uuid(), 'tom_builder', 'tom.b@homedecor.com', NOW() - INTERVAL '21 days'),
  ('d4e9b6c2-8f3a-4d7e-b2c1-9a5f8e3d7c4b', gen_random_uuid(), 'kelly_interior', 'kelly.i@homedecor.com', NOW() - INTERVAL '13 days');

-- ===== Insert Products =====
-- Tenant 1: TechStore Inc (Electronics)
INSERT INTO public.products (tenant_id, product_id, name, price, category, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'Laptop Pro 15"', 1299.99, 'Electronics', NOW() - INTERVAL '60 days'),
  ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'Wireless Mouse', 29.99, 'Electronics', NOW() - INTERVAL '55 days'),
  ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'Mechanical Keyboard', 89.99, 'Electronics', NOW() - INTERVAL '50 days'),
  ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'USB-C Hub', 49.99, 'Electronics', NOW() - INTERVAL '45 days'),
  ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'External SSD 1TB', 149.99, 'Electronics', NOW() - INTERVAL '40 days'),
  ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'Webcam HD', 79.99, 'Electronics', NOW() - INTERVAL '35 days'),
  ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'Noise-Cancelling Headphones', 199.99, 'Electronics', NOW() - INTERVAL '30 days');

-- Tenant 2: FashionHub Ltd (Clothing)
INSERT INTO public.products (tenant_id, product_id, name, price, category, created_at) VALUES
  ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), 'Classic T-Shirt', 24.99, 'Clothing', NOW() - INTERVAL '60 days'),
  ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), 'Denim Jeans', 59.99, 'Clothing', NOW() - INTERVAL '55 days'),
  ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), 'Summer Dress', 79.99, 'Clothing', NOW() - INTERVAL '50 days'),
  ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), 'Leather Jacket', 199.99, 'Clothing', NOW() - INTERVAL '45 days'),
  ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), 'Running Shoes', 89.99, 'Clothing', NOW() - INTERVAL '40 days'),
  ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), 'Winter Coat', 149.99, 'Clothing', NOW() - INTERVAL '35 days');

-- Tenant 3: BookWorld Co (Books)
INSERT INTO public.products (tenant_id, product_id, name, price, category, created_at) VALUES
  ('33333333-3333-3333-3333-333333333333', gen_random_uuid(), 'The Great Novel', 19.99, 'Books', NOW() - INTERVAL '60 days'),
  ('33333333-3333-3333-3333-333333333333', gen_random_uuid(), 'Learn PostgreSQL', 39.99, 'Books', NOW() - INTERVAL '55 days'),
  ('33333333-3333-3333-3333-333333333333', gen_random_uuid(), 'Science Fiction Collection', 29.99, 'Books', NOW() - INTERVAL '50 days'),
  ('33333333-3333-3333-3333-333333333333', gen_random_uuid(), 'History of Technology', 34.99, 'Books', NOW() - INTERVAL '45 days'),
  ('33333333-3333-3333-3333-333333333333', gen_random_uuid(), 'Cooking Masterclass', 24.99, 'Books', NOW() - INTERVAL '40 days');

-- Tenant 4: GameZone Pro (Toys & Electronics)
INSERT INTO public.products (tenant_id, product_id, name, price, category, created_at) VALUES
  ('a7f3c8e9-4b2d-4a1e-9f6b-3d8c7e5a2f1b', gen_random_uuid(), 'Gaming Console X', 499.99, 'Toys', NOW() - INTERVAL '60 days'),
  ('a7f3c8e9-4b2d-4a1e-9f6b-3d8c7e5a2f1b', gen_random_uuid(), 'VR Headset Pro', 399.99, 'Electronics', NOW() - INTERVAL '55 days'),
  ('a7f3c8e9-4b2d-4a1e-9f6b-3d8c7e5a2f1b', gen_random_uuid(), 'Wireless Controller', 69.99, 'Toys', NOW() - INTERVAL '50 days'),
  ('a7f3c8e9-4b2d-4a1e-9f6b-3d8c7e5a2f1b', gen_random_uuid(), 'Racing Wheel Set', 249.99, 'Toys', NOW() - INTERVAL '45 days'),
  ('a7f3c8e9-4b2d-4a1e-9f6b-3d8c7e5a2f1b', gen_random_uuid(), 'Gaming Headset', 129.99, 'Electronics', NOW() - INTERVAL '40 days'),
  ('a7f3c8e9-4b2d-4a1e-9f6b-3d8c7e5a2f1b', gen_random_uuid(), 'RGB Keyboard', 159.99, 'Electronics', NOW() - INTERVAL '35 days');

-- Tenant 5: HomeDecor Plus (HomeGoods)
INSERT INTO public.products (tenant_id, product_id, name, price, category, created_at) VALUES
  ('d4e9b6c2-8f3a-4d7e-b2c1-9a5f8e3d7c4b', gen_random_uuid(), 'Modern Floor Lamp', 89.99, 'HomeGoods', NOW() - INTERVAL '60 days'),
  ('d4e9b6c2-8f3a-4d7e-b2c1-9a5f8e3d7c4b', gen_random_uuid(), 'Decorative Vase Set', 44.99, 'HomeGoods', NOW() - INTERVAL '55 days'),
  ('d4e9b6c2-8f3a-4d7e-b2c1-9a5f8e3d7c4b', gen_random_uuid(), 'Wall Art Canvas', 79.99, 'HomeGoods', NOW() - INTERVAL '50 days'),
  ('d4e9b6c2-8f3a-4d7e-b2c1-9a5f8e3d7c4b', gen_random_uuid(), 'Throw Pillow Pack', 39.99, 'HomeGoods', NOW() - INTERVAL '45 days'),
  ('d4e9b6c2-8f3a-4d7e-b2c1-9a5f8e3d7c4b', gen_random_uuid(), 'Area Rug 5x7', 199.99, 'HomeGoods', NOW() - INTERVAL '40 days'),
  ('d4e9b6c2-8f3a-4d7e-b2c1-9a5f8e3d7c4b', gen_random_uuid(), 'Curtain Set', 64.99, 'HomeGoods', NOW() - INTERVAL '35 days');

-- ===== Insert Product Variants =====
-- Get product IDs for variants (we'll need to reference actual product_ids)
DO $$
DECLARE
  laptop_id uuid;
  tshirt_id uuid;
  jeans_id uuid;
  book_id uuid;
BEGIN
  -- Get some product IDs to create variants
  SELECT product_id INTO laptop_id FROM public.products 
    WHERE name = 'Laptop Pro 15"' AND tenant_id = '11111111-1111-1111-1111-111111111111' LIMIT 1;
  
  SELECT product_id INTO tshirt_id FROM public.products 
    WHERE name = 'Classic T-Shirt' AND tenant_id = '22222222-2222-2222-2222-222222222222' LIMIT 1;
  
  SELECT product_id INTO jeans_id FROM public.products 
    WHERE name = 'Denim Jeans' AND tenant_id = '22222222-2222-2222-2222-222222222222' LIMIT 1;

  -- Laptop variants
  IF laptop_id IS NOT NULL THEN
    INSERT INTO public.product_variants (tenant_id, variant_id, product_id, variant_name, additional_price, created_at) VALUES
      ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), laptop_id, '16GB RAM', 200.00, NOW() - INTERVAL '60 days'),
      ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), laptop_id, '32GB RAM', 400.00, NOW() - INTERVAL '60 days'),
      ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), laptop_id, '512GB SSD', 0.00, NOW() - INTERVAL '60 days'),
      ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), laptop_id, '1TB SSD', 150.00, NOW() - INTERVAL '60 days');
  END IF;

  -- T-Shirt variants
  IF tshirt_id IS NOT NULL THEN
    INSERT INTO public.product_variants (tenant_id, variant_id, product_id, variant_name, additional_price, created_at) VALUES
      ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), tshirt_id, 'Size S', 0.00, NOW() - INTERVAL '60 days'),
      ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), tshirt_id, 'Size M', 0.00, NOW() - INTERVAL '60 days'),
      ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), tshirt_id, 'Size L', 2.00, NOW() - INTERVAL '60 days'),
      ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), tshirt_id, 'Size XL', 2.00, NOW() - INTERVAL '60 days');
  END IF;

  -- Jeans variants
  IF jeans_id IS NOT NULL THEN
    INSERT INTO public.product_variants (tenant_id, variant_id, product_id, variant_name, additional_price, created_at) VALUES
      ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), jeans_id, 'W30 L32', 0.00, NOW() - INTERVAL '55 days'),
      ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), jeans_id, 'W32 L32', 0.00, NOW() - INTERVAL '55 days'),
      ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), jeans_id, 'W34 L34', 0.00, NOW() - INTERVAL '55 days');
  END IF;
END $$;

-- ===== Insert Discounts =====
-- Tenant 1: TechStore Inc
INSERT INTO public.discounts (tenant_id, discount_id, code, percentage, valid_from, valid_to) VALUES
  ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'TECH10', 10.00, NOW() - INTERVAL '30 days', NOW() + INTERVAL '30 days'),
  ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'SUMMER20', 20.00, NOW() - INTERVAL '15 days', NOW() + INTERVAL '45 days'),
  ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'WELCOME5', 5.00, NOW() - INTERVAL '60 days', NOW() + INTERVAL '60 days');

-- Tenant 2: FashionHub Ltd
INSERT INTO public.discounts (tenant_id, discount_id, code, percentage, valid_from, valid_to) VALUES
  ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), 'FASHION15', 15.00, NOW() - INTERVAL '20 days', NOW() + INTERVAL '40 days'),
  ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), 'NEWCUST10', 10.00, NOW() - INTERVAL '30 days', NOW() + INTERVAL '30 days');

-- Tenant 3: BookWorld Co
INSERT INTO public.discounts (tenant_id, discount_id, code, percentage, valid_from, valid_to) VALUES
  ('33333333-3333-3333-3333-333333333333', gen_random_uuid(), 'READER25', 25.00, NOW() - INTERVAL '10 days', NOW() + INTERVAL '50 days'),
  ('33333333-3333-3333-3333-333333333333', gen_random_uuid(), 'BOOK5', 5.00, NOW() - INTERVAL '40 days', NOW() + INTERVAL '20 days');

-- Tenant 4: GameZone Pro
INSERT INTO public.discounts (tenant_id, discount_id, code, percentage, valid_from, valid_to) VALUES
  ('a7f3c8e9-4b2d-4a1e-9f6b-3d8c7e5a2f1b', gen_random_uuid(), 'GAMER30', 30.00, NOW() - INTERVAL '15 days', NOW() + INTERVAL '45 days'),
  ('a7f3c8e9-4b2d-4a1e-9f6b-3d8c7e5a2f1b', gen_random_uuid(), 'PLAYER10', 10.00, NOW() - INTERVAL '25 days', NOW() + INTERVAL '35 days');

-- Tenant 5: HomeDecor Plus
INSERT INTO public.discounts (tenant_id, discount_id, code, percentage, valid_from, valid_to) VALUES
  ('d4e9b6c2-8f3a-4d7e-b2c1-9a5f8e3d7c4b', gen_random_uuid(), 'HOMEDECOR20', 20.00, NOW() - INTERVAL '12 days', NOW() + INTERVAL '48 days'),
  ('d4e9b6c2-8f3a-4d7e-b2c1-9a5f8e3d7c4b', gen_random_uuid(), 'DECOR15', 15.00, NOW() - INTERVAL '30 days', NOW() + INTERVAL '30 days');

-- ===== Insert Carts and Cart Items =====
DO $$
DECLARE
  user1_id uuid;
  user2_id uuid;
  user3_id uuid;
  user4_id uuid;
  user5_id uuid;
  user6_id uuid;
  cart1_id uuid := gen_random_uuid();
  cart2_id uuid := gen_random_uuid();
  cart3_id uuid := gen_random_uuid();
  cart4_id uuid := gen_random_uuid();
  cart5_id uuid := gen_random_uuid();
  cart6_id uuid := gen_random_uuid();
  discount1_id uuid;
  discount2_id uuid;
  discount3_id uuid;
  discount4_id uuid;
  prod1_id uuid;
  prod2_id uuid;
  prod3_id uuid;
  prod4_id uuid;
  prod5_id uuid;
  prod6_id uuid;
  variant1_id uuid;
BEGIN
  -- Get user IDs
  SELECT user_id INTO user1_id FROM public.users 
    WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND username = 'john_doe' LIMIT 1;
  SELECT user_id INTO user2_id FROM public.users 
    WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND username = 'jane_smith' LIMIT 1;
  SELECT user_id INTO user3_id FROM public.users 
    WHERE tenant_id = '22222222-2222-2222-2222-222222222222' AND username = 'emma_davis' LIMIT 1;
  SELECT user_id INTO user4_id FROM public.users 
    WHERE tenant_id = '33333333-3333-3333-3333-333333333333' AND username = 'sarah_martinez' LIMIT 1;
  SELECT user_id INTO user5_id FROM public.users 
    WHERE tenant_id = 'a7f3c8e9-4b2d-4a1e-9f6b-3d8c7e5a2f1b' AND username = 'alex_gamer' LIMIT 1;
  SELECT user_id INTO user6_id FROM public.users 
    WHERE tenant_id = 'd4e9b6c2-8f3a-4d7e-b2c1-9a5f8e3d7c4b' AND username = 'rachel_designer' LIMIT 1;

  -- Get discount IDs
  SELECT discount_id INTO discount1_id FROM public.discounts 
    WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND code = 'TECH10' LIMIT 1;
  SELECT discount_id INTO discount2_id FROM public.discounts 
    WHERE tenant_id = '22222222-2222-2222-2222-222222222222' AND code = 'FASHION15' LIMIT 1;
  SELECT discount_id INTO discount3_id FROM public.discounts 
    WHERE tenant_id = 'a7f3c8e9-4b2d-4a1e-9f6b-3d8c7e5a2f1b' AND code = 'GAMER30' LIMIT 1;
  SELECT discount_id INTO discount4_id FROM public.discounts 
    WHERE tenant_id = 'd4e9b6c2-8f3a-4d7e-b2c1-9a5f8e3d7c4b' AND code = 'HOMEDECOR20' LIMIT 1;

  -- Get product IDs
  SELECT product_id INTO prod1_id FROM public.products 
    WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND name = 'Laptop Pro 15"' LIMIT 1;
  SELECT product_id INTO prod2_id FROM public.products 
    WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND name = 'Wireless Mouse' LIMIT 1;
  SELECT product_id INTO prod3_id FROM public.products 
    WHERE tenant_id = '22222222-2222-2222-2222-222222222222' AND name = 'Classic T-Shirt' LIMIT 1;
  SELECT product_id INTO prod4_id FROM public.products 
    WHERE tenant_id = '33333333-3333-3333-3333-333333333333' AND name = 'Learn PostgreSQL' LIMIT 1;
  SELECT product_id INTO prod5_id FROM public.products 
    WHERE tenant_id = 'a7f3c8e9-4b2d-4a1e-9f6b-3d8c7e5a2f1b' AND name = 'Gaming Console X' LIMIT 1;
  SELECT product_id INTO prod6_id FROM public.products 
    WHERE tenant_id = 'd4e9b6c2-8f3a-4d7e-b2c1-9a5f8e3d7c4b' AND name = 'Modern Floor Lamp' LIMIT 1;

  -- Get variant ID
  SELECT variant_id INTO variant1_id FROM public.product_variants 
    WHERE tenant_id = '11111111-1111-1111-1111-111111111111' AND variant_name = '16GB RAM' LIMIT 1;

  -- Cart 1: Tenant 1, User 1, with discount
  IF user1_id IS NOT NULL THEN
    INSERT INTO public.carts (tenant_id, cart_id, user_id, discount_id, created_at, updated_at) VALUES
      ('11111111-1111-1111-1111-111111111111', cart1_id, user1_id, discount1_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days');
    
    -- Cart items for cart 1
    IF prod1_id IS NOT NULL THEN
      INSERT INTO public.cart_items (tenant_id, cart_item_id, cart_id, product_id, variant_id, quantity, created_at) VALUES
        ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), cart1_id, prod1_id, variant1_id, 1, NOW() - INTERVAL '5 days');
    END IF;
    IF prod2_id IS NOT NULL THEN
      INSERT INTO public.cart_items (tenant_id, cart_item_id, cart_id, product_id, variant_id, quantity, created_at) VALUES
        ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), cart1_id, prod2_id, NULL, 2, NOW() - INTERVAL '4 days');
    END IF;
  END IF;

  -- Cart 2: Tenant 1, User 2, no discount
  IF user2_id IS NOT NULL THEN
    INSERT INTO public.carts (tenant_id, cart_id, user_id, discount_id, created_at, updated_at) VALUES
      ('11111111-1111-1111-1111-111111111111', cart2_id, user2_id, NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day');
    
    IF prod2_id IS NOT NULL THEN
      INSERT INTO public.cart_items (tenant_id, cart_item_id, cart_id, product_id, variant_id, quantity, created_at) VALUES
        ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), cart2_id, prod2_id, NULL, 1, NOW() - INTERVAL '3 days');
    END IF;
  END IF;

  -- Cart 3: Tenant 2, User 3, with discount
  IF user3_id IS NOT NULL THEN
    INSERT INTO public.carts (tenant_id, cart_id, user_id, discount_id, created_at, updated_at) VALUES
      ('22222222-2222-2222-2222-222222222222', cart3_id, user3_id, discount2_id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 hour');
    
    IF prod3_id IS NOT NULL THEN
      INSERT INTO public.cart_items (tenant_id, cart_item_id, cart_id, product_id, variant_id, quantity, created_at) VALUES
        ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), cart3_id, prod3_id, NULL, 3, NOW() - INTERVAL '2 days');
    END IF;
  END IF;

  -- Cart 4: Tenant 3, User 4, no discount
  IF user4_id IS NOT NULL THEN
    INSERT INTO public.carts (tenant_id, cart_id, user_id, discount_id, created_at, updated_at) VALUES
      ('33333333-3333-3333-3333-333333333333', cart4_id, user4_id, NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '6 hours');
    
    IF prod4_id IS NOT NULL THEN
      INSERT INTO public.cart_items (tenant_id, cart_item_id, cart_id, product_id, variant_id, quantity, created_at) VALUES
        ('33333333-3333-3333-3333-333333333333', gen_random_uuid(), cart4_id, prod4_id, NULL, 2, NOW() - INTERVAL '1 day');
    END IF;
  END IF;

  -- Cart 5: Tenant 4, User 5, with discount
  IF user5_id IS NOT NULL THEN
    INSERT INTO public.carts (tenant_id, cart_id, user_id, discount_id, created_at, updated_at) VALUES
      ('a7f3c8e9-4b2d-4a1e-9f6b-3d8c7e5a2f1b', cart5_id, user5_id, discount3_id, NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 hours');
    
    IF prod5_id IS NOT NULL THEN
      INSERT INTO public.cart_items (tenant_id, cart_item_id, cart_id, product_id, variant_id, quantity, created_at) VALUES
        ('a7f3c8e9-4b2d-4a1e-9f6b-3d8c7e5a2f1b', gen_random_uuid(), cart5_id, prod5_id, NULL, 1, NOW() - INTERVAL '4 days');
    END IF;
  END IF;

  -- Cart 6: Tenant 5, User 6, with discount
  IF user6_id IS NOT NULL THEN
    INSERT INTO public.carts (tenant_id, cart_id, user_id, discount_id, created_at, updated_at) VALUES
      ('d4e9b6c2-8f3a-4d7e-b2c1-9a5f8e3d7c4b', cart6_id, user6_id, discount4_id, NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 hours');
    
    IF prod6_id IS NOT NULL THEN
      INSERT INTO public.cart_items (tenant_id, cart_item_id, cart_id, product_id, variant_id, quantity, created_at) VALUES
        ('d4e9b6c2-8f3a-4d7e-b2c1-9a5f8e3d7c4b', gen_random_uuid(), cart6_id, prod6_id, NULL, 2, NOW() - INTERVAL '3 days');
    END IF;
  END IF;
END $$;

-- ===== Verification Queries =====
-- Uncomment to verify the data was inserted correctly

-- SELECT 'Tenants' as table_name, COUNT(*) as count FROM public.tenants
-- UNION ALL
-- SELECT 'Users', COUNT(*) FROM public.users
-- UNION ALL
-- SELECT 'Products', COUNT(*) FROM public.products
-- UNION ALL
-- SELECT 'Product Variants', COUNT(*) FROM public.product_variants
-- UNION ALL
-- SELECT 'Discounts', COUNT(*) FROM public.discounts
-- UNION ALL
-- SELECT 'Carts', COUNT(*) FROM public.carts
-- UNION ALL
-- SELECT 'Cart Items', COUNT(*) FROM public.cart_items;

-- -- View data by tenant
-- SELECT t.name, 
--   (SELECT COUNT(*) FROM public.users u WHERE u.tenant_id = t.tenant_id) as users,
--   (SELECT COUNT(*) FROM public.products p WHERE p.tenant_id = t.tenant_id) as products,
--   (SELECT COUNT(*) FROM public.carts c WHERE c.tenant_id = t.tenant_id) as carts
-- FROM public.tenants t;
