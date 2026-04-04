SELECT logicalrelid::regclass AS table, partmethod, partkey
FROM pg_dist_partition
ORDER BY 1;
