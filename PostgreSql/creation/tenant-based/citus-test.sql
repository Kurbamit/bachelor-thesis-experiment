-- AR LENTELĖS PASKIRSTYTOS
SELECT logicalrelid::regclass AS table, partmethod, partkey
FROM pg_dist_partition
ORDER BY 1;

-- Ar užklausa eina į vieną shard (single-tenant)
EXPLAIN
SELECT *
FROM public.carts
WHERE tenant_id = '18d60e2e-b3d3-4bfc-8cb6-1dc73e6ac96b';