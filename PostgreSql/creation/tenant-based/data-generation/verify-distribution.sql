-- Verify data is distributed
SELECT * FROM citus_tables;

-- Check shard distribution
SELECT logicalrelid, count(*) 
FROM pg_dist_shard 
GROUP BY logicalrelid;