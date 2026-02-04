INSERT INTO public.users (user_id, name, email, register_date)
SELECT
  gen_random_uuid(),
  'User_' || i,
  'user_' || i || '@example.com',
  now() - (random() * interval '365 days')
FROM generate_series(1, 10000) AS s(i);

INSERT INTO public.products (product_id, name, price, category)
SELECT
  gen_random_uuid(),
  'Product_' || i,
  round((random() * 200 + 1)::numeric, 2),
  (ARRAY['electronics','food','books','clothing','home','sports'])[1 + (random()*5)::int]
FROM generate_series(1, 1000) AS s(i);

INSERT INTO public.cart (user_id, product_id, quantity, added)
SELECT
  u.user_id,
  p.product_id,
  (random()*4)::int + 1,
  now() - (random() * interval '30 days')
FROM public.users u
JOIN LATERAL (
  SELECT product_id
  FROM public.products
  ORDER BY random()
  LIMIT (random()*25)::int + 5
) p ON true;

SELECT
  (SELECT count(*) FROM public.users)    AS users,
  (SELECT count(*) FROM public.products) AS products,
  (SELECT count(*) FROM public.cart)     AS cart_rows;
