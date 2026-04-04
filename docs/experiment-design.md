# Experiment Design

## Research Question

> **Does Redis Cluster's performance advantage over PostgreSQL persist when both systems operate under identical in-memory conditions, and what are the architectural reasons for any observed differences?**

## Objectives

1. Compare horizontal sharding performance between Redis Cluster and PostgreSQL + Citus
2. Measure throughput, latency, and error rates under controlled load
3. Identify the saturation point and breaking point for each system
4. Analyze architectural reasons for performance differences

## Hypothesis

- Redis Cluster will outperform PostgreSQL even under identical RAM conditions
- The advantage is **architectural**, not storage-related
- PostgreSQL will show more predictable behavior but lower peak throughput
- Both systems will show similar latency at low loads

## Test Environment

Both systems were configured with **identical RAM-backed storage** to isolate architectural differences from storage medium effects.

## Load Testing Configuration

### Test Scenario (per virtual user)

Each virtual user executes a fixed shopping cart sequence:

1. **Create cart** - Initialise a new shopping cart
2. **Add item** - Add first product to cart
3. **Add second item** - Add another product
4. **Update item quantity** - Modify quantity of first item
5. **Remove item** - Delete second item from cart
6. **View cart** - Retrieve full cart contents with product details
7. **Checkout (delete cart)** - Complete the session

### Load Stages

| Stage | Concurrent Users | Duration | Purpose |
|-------|-----------------|----------|---------|
| 1 | 200 | 5 min | Baseline stability |
| 2 | 500 | 5 min | Normal operating conditions |
| 3 | 1,000 | 10 min | Throughput growth observation |
| 4 | 2,000 | 10 min | Saturation point detection |
| 5 | 5,000 | 10 min | Breaking point identification |
| 6 | 500 | 5 min | Post-stress recovery verification |

### Metrics Collected

| Metric | Description |
|--------|-------------|
| Total requests processed | Cumulative request count |
| Average throughput | Requests per second (req/s) |
| Peak throughput | Maximum observed req/s |
| Latency (p50, p90, p95, p99) | Response time percentiles |
| Saturation point | Concurrency level where throughput peaks |
| Error rate | Failed requests as percentage |
| Data integrity | ACID (PostgreSQL) vs BASE (Redis) |

## Infrastructure

| Component | Specification |
|-----------|---------------|
| VM | OpenNebula (Vilnius University MIF) |
| CPU | 2 vCPU |
| RAM | 10 GB |
| Disk | 100 GB |
| OS | Ubuntu 24.04 LTS |

### PostgreSQL + Citus Configuration

- **Coordinator:** 1 node (port 55432)
- **Workers:** 2 nodes (ports 55433-55434)
- **Storage:** tmpfs (RAM-backed)
- **Tables:** UNLOGGED for additional performance
- **Settings:** `fsync=off`, `synchronous_commit=off`, `full_page_writes=off`

### Redis Cluster Configuration

- **Nodes:** 6 (ports 7001-7006)
- **Topology:** 3 primary + 3 replica
- **Sharding:** Hash-slot based (16,384 slots)
- **Storage:** RAM only (appendonly disabled)

## Key Findings

1. **Redis achieved ~3x higher throughput** than PostgreSQL even under identical RAM conditions
2. **PostgreSQL throughput actively degrades** past saturation due to `fork()` process contention
3. **At low loads (<500 users)** both systems show identical ~30ms latency
4. **Redis error rate of 1.53%** makes it unsuitable as sole store for checkout operations

## Threats to Validity

### Internal Validity

- Single VM environment may not reflect production distributed infrastructure
- RAM-backed storage removes I/O as a realistic bottleneck
- Test data distribution (uniform/Zipfian) may not match all real-world patterns

### External Validity

- Single-region deployment (Lithuania) ignores geo-distribution effects
- Two-worker Citus cluster may behave differently at larger scales
- Six-node Redis cluster vs production deployments with more nodes

## Future Work

- Test with larger cluster sizes (5+ Citus workers, 9+ Redis nodes)
- Add geo-distributed multi-region tests
- Compare with other sharding solutions (CockroachDB, TiDB)
- Measure impact of different sharding keys
