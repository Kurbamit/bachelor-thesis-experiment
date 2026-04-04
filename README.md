# Database Sharding Performance Comparison: Redis Cluster vs PostgreSQL (Citus)

A bachelor's thesis experiment comparing horizontal sharding performance between a key-value Redis Cluster and a relational PostgreSQL database with the Citus extension, in a multi-tenant e-commerce shopping cart scenario.

## Overview

This experiment evaluates **horizontal sharding performance** under high-concurrency workloads, comparing:

1. **Redis Cluster** – 6-node cluster (3 primary + 3 replica), hash-slot based sharding, in-memory storage
2. **PostgreSQL + Citus** – 1 coordinator + 2 worker nodes, hash sharding by `tenant_id`, RAM-backed storage

Both systems were configured to use **RAM storage** to isolate architectural differences from storage medium effects.

## Research Question

> Does Redis Cluster's performance advantage over PostgreSQL persist when both systems operate under identical in-memory conditions, and what are the architectural reasons for any observed differences?

## Key Results

| Metric | Redis Cluster | PostgreSQL (Citus) |
|--------|--------------|-------------------|
| Total requests processed | 6,722,964 | 2,275,603 |
| Average throughput | 2,475.41 req/s | 841.60 req/s |
| Peak throughput | ~3,600 req/s | ~1,000 req/s |
| Saturation point | 2,000 concurrent users | 1,000 concurrent users |
| Latency (low load) | ~30 ms | ~30 ms |
| Latency (2,000 users) | 200 ms | 100 ms |
| Latency (5,000 users) | 625 ms | 400 ms |
| Error rate | 1.53% | 0% |
| Data integrity | BASE (eventual consistency) | ACID (100% guaranteed) |

## Technology Stack

| Component | Technology |
|-----------|------------|
| Language | C# (.NET 10) |
| Framework | ASP.NET Core Web API |
| Relational DB | PostgreSQL 16 + Citus 12.1 |
| Key-Value DB | Redis 8.6 Cluster |
| Load Testing | Apache JMeter 5.6.3 + Groovy (JSR223) |
| Containerization | Docker 29.2.1 + Docker Compose |
| Infrastructure | OpenNebula cloud (Vilnius University MIF) |

> **Note:** A .NET API layer was prototyped initially but abandoned during testing – at loads above 1,000 concurrent threads the API became a bottleneck, leaving database resources underutilised. Final tests use **direct database access via JMeter Groovy scripts** for both systems, ensuring a fair comparison.

## Project Structure

```
eksperimentas/
├── src/                    # Application source code (initial API prototype)
│   └── Api/               # ASP.NET Core Web API
├── database/              # Database schema and migrations
│   ├── schema/            # DDL scripts (PostgreSQL + Citus distribution)
│   ├── queries/           # Analytics and verification queries
│   └── migrations/        # Test data generation scripts
├── infrastructure/        # Infrastructure configuration
│   ├── docker-compose.postgres.yml   # Citus cluster (1 coordinator + 2 workers)
│   ├── docker-compose.redis.yml      # Redis cluster (6 nodes: 3 primary + 3 replica)
│   ├── docker-compose.api.yml        # API container
│   └── prometheus.yml    # Prometheus scrape configuration
├── load-testing/          # JMeter load test configurations
│   ├── test-plans/        # JMeter test plans (.jmx) – direct DB access via Groovy
│   ├── data/              # CSV test data
│   ├── results/           # Test results (.jtl)
│   └── scripts/           # Groovy scripts for Redis and PostgreSQL
└── docs/                  # Documentation
    ├── architecture.md
    ├── experiment-design.md
    ├── database-schema.md
    ├── api-reference.md
    └── results/           # Experiment results
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- .NET 10 SDK (optional – only needed for API prototype)

### Start Infrastructure

```bash
# Start PostgreSQL + Citus cluster
cd infrastructure
docker-compose -f docker-compose.postgres.yml up -d

# Start Redis Cluster
docker-compose -f docker-compose.redis.yml up -d
```

### Initialise PostgreSQL Schema

```bash
# Apply schema with Citus distribution
psql -h localhost -p 55432 -U postgres -f database/schema/tenant_sharding.sql
```

The schema distributes all tenant-scoped tables by `tenant_id`:

```sql
-- Reference table (replicated to all nodes)
SELECT create_reference_table('public.tenants');

-- Distributed tables (hash-sharded by tenant_id)
SELECT create_distributed_table('public.users', 'tenant_id');
SELECT create_distributed_table('public.products', 'tenant_id');
SELECT create_distributed_table('public.product_variants', 'tenant_id');
SELECT create_distributed_table('public.discounts', 'tenant_id');
SELECT create_distributed_table('public.carts', 'tenant_id');
SELECT create_distributed_table('public.cart_items', 'tenant_id');
```

## Data Model

The experiment uses a multi-tenant e-commerce shopping cart model with 7 entities:

- **tenants** – top-level entity representing individual stores
- **users** – buyers belonging to a tenant
- **products** + **product_variants** – product catalogue scoped to tenant
- **discounts** – tenant-scoped discount codes
- **carts** – active user sessions
- **cart_items** – join table linking carts to products

In Redis, the full cart state (items, quantities, product data) is stored as a single JSON object per cart key. In PostgreSQL, the same data is normalised across the relational schema above.

## Load Testing

Tests are run via **Apache JMeter with Groovy (JSR223 Sampler)**, connecting directly to both databases without an intermediary API layer. Groovy scripts are cached using JMeter's Compilation Cache to minimise tool-side overhead.

### Test Scenario

Each virtual user executes a fixed shopping cart sequence (based on average items per session):

1. Create cart
2. Add item
3. Add second item
4. Update item quantity
5. Remove item
6. View cart contents
7. Checkout (delete cart)

### Load Stages

| Stage | Name | Concurrent Users | Duration | Purpose |
|-------|------|-----------------|----------|---------|
| 1 | Low load | 200 | 5 min | Baseline stability |
| 2 | Medium load | 500 | 5 min | Normal operating conditions |
| 3 | High load | 1,000 | 10 min | Throughput growth observation |
| 4 | Very high load | 2,000 | 10 min | Saturation point detection |
| 5 | Extreme (stress) | 5,000 | 10 min | Breaking point identification |
| 6 | Recovery | 500 | 5 min | Post-stress recovery verification |

```bash
# Run PostgreSQL test plan
jmeter -n -t load-testing/test-plans/postgres_cart_test.jmx -l load-testing/results/postgres.jtl

# Run Redis test plan
jmeter -n -t load-testing/test-plans/redis_cart_test.jmx -l load-testing/results/redis.jtl
```

## Infrastructure Details

All experiments were run on a single virtual machine provided by Vilnius University MIF via OpenNebula:

- **VM specs:** 2 CPU, 8 vCPU, 10 GB RAM, 100 GB Disk, Ubuntu 24.04 LTS
- **Redis Cluster:** 6 nodes (ports 7001–7006), all data in RAM
- **PostgreSQL (Citus):** 1 coordinator (port 55432) + 2 workers (ports 55433–55434), UNLOGGED tables in RAM

Both systems were intentionally configured with RAM-backed storage to ensure the comparison reflects **architectural differences only**, not storage medium speed.

## API Endpoints (Prototype)

The initial API prototype (not used in final load tests) exposed the following endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Cart/{cartId}` | Get cart by ID |
| POST | `/api/Cart` | Create new cart |
| PUT | `/api/Cart/{cartId}/discount` | Update cart discount |
| DELETE | `/api/Cart/{cartId}` | Delete cart |
| POST | `/api/Cart/{cartId}/items` | Add item to cart |
| DELETE | `/api/Cart/items/{cartItemId}` | Remove item from cart |
| PUT | `/api/Cart/items/{cartItemId}/quantity` | Update item quantity |
| GET | `/api/tenant/{tenantId}/cart` | Get tenant carts |
| GET | `/api/products/{productId}` | Get product by ID |

## Findings Summary

- Redis Cluster achieved ~3x higher average throughput than PostgreSQL even under identical RAM conditions, confirming the advantage is **architectural**, not storage-related
- PostgreSQL throughput does not merely stagnate at high load – it **actively degrades** past the saturation point due to `fork()` process contention
- At low loads (< 500 concurrent users) both systems show **identical ~30 ms latency** – migration to Redis below this threshold provides no measurable user benefit
- Redis error rate of 1.53% (~38 errors/sec at average throughput) makes it unsuitable as the sole store for checkout operations; ACID-critical paths should remain on PostgreSQL

## License

This project is for academic research purposes as part of a bachelor's thesis at Vilnius University, Faculty of Mathematics and Informatics.