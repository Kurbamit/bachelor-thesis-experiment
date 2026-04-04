# Experiment Design

## Research Question

**How does horizontal sharding using Citus affect the performance and behavior of a multi-tenant e-commerce shopping cart system?**

## Objectives

1. Evaluate the performance impact of different sharding strategies
2. Compare entity-based vs tenant-based sharding approaches
3. Analyze latency, throughput, and error rates under load
4. Measure the effectiveness of data co-location in multi-tenant scenarios

## Sharding Strategies Compared

### Strategy A: Entity-Based Sharding

Each table distributed by its own primary key:

| Table | Shard Key |
|-------|-----------|
| users | user_id |
| products | product_id |
| cart | user_id |

**Hypothesis:** Simple but may cause cross-shard queries for multi-tenant operations.

### Strategy B: Tenant-Based Sharding

All tables distributed by `tenant_id`:

| Table | Shard Key |
|-------|-----------|
| users | tenant_id |
| products | tenant_id |
| cart | tenant_id |

**Hypothesis:** Better co-location but requires composite keys and may cause hot spots for active tenants.

## Test Scenarios

### Load Test Configuration

| Thread Group | Operation | Threads | Ramp-up | Duration |
|--------------|-----------|---------|---------|----------|
| TG01 | GET cart | 30 | 10s | 300s |
| TG02 | Add item to cart | 10 | 5s | 300s |
| TG03 | Update item quantity | 5 | 5s | 300s |
| TG04 | Update cart discount | 3 | 5s | 300s |
| TG05 | Remove item from cart | 2 | 5s | 300s |

### Metrics Collected

1. **Response Time**
   - Mean, median, p90, p95, p99
   - Min/max response times

2. **Throughput**
   - Requests per second
   - Transactions per second

3. **Error Rate**
   - Failed requests
   - Timeout rate

4. **Database Metrics**
   - Query latency (from Prometheus)
   - Active connections
   - Shard distribution

## Test Data

### Scale

- **Tenants:** 100
- **Users per tenant:** 1000
- **Products per tenant:** 10000
- **Cart items:** Variable (depends on user activity)

### Distribution

- Uniform distribution across tenants
- Zipfian distribution for product popularity
- Random cart sizes (1-20 items)

## Experimental Setup

### Infrastructure

- **Citus Cluster:** 1 coordinator + 2 workers
- **Storage:** tmpfs (in-memory) for controlled performance
- **Network:** localhost for local tests, SSH tunnel for remote

### Configuration Parameters

```yaml
# PostgreSQL/Citus
max_connections: 300
shared_buffers: 1GB (coordinator), 768MB (workers)
work_mem: 2MB
fsync: off
synchronous_commit: off
full_page_writes: off

# Application
Maximum Pool Size: 200
Timeout: 90s
Command Timeout: 90s
```

## Expected Outcomes

1. Tenant-based sharding should show lower latency for tenant-scoped queries
2. Entity-based sharding may show better scalability for single-entity operations
3. Co-location benefits should increase with query complexity
4. Connection pooling effectiveness varies with shard key selection

## Threats to Validity

### Internal Validity

- SSH tunnel introduces additional network latency (controlled for in remote tests)
- tmpfs storage may not reflect production disk I/O characteristics
- Test data distribution may not match real-world patterns

### External Validity

- Single Citus cluster (3 nodes) may not represent larger deployments
- In-memory storage removes I/O as a bottleneck
- Single-region deployment ignores geo-distribution effects

## Future Work

- Test with larger cluster sizes (5+ workers)
- Add geo-distributed multi-region tests
- Compare with other sharding solutions (CockroachDB, TiDB)
- Measure impact of reference table replication
