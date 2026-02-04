-- AR LENTELĖS PASKIRSTYTOS
SELECT logicalrelid::regclass AS table, partmethod, partkey
FROM pg_dist_partition
ORDER BY 1;

-- Ar užklausa eina į vieną shard (single-tenant)
EXPLAIN
SELECT *
FROM public.carts
WHERE tenant_id = gen_random_uuid(); -- tenant_id