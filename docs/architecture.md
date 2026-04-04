# System Architecture

## Overview

The experiment compares two database systems under identical in-memory conditions:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Load Testing Layer                        │
│              Apache JMeter 5.6.3 + Groovy (JSR223 Sampler)       │
│                   Direct database access (no API)                │
└─────────────────────────────────────────────────────────────────┘
                    │                         │
                    ▼                         ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│   PostgreSQL + Citus 12.1    │   │       Redis 8.6 Cluster        │
│                               │   │                               │
│  ┌─────────────┐              │   │  ┌─────┐ ┌─────┐ ┌─────┐     │
│  │ Coordinator │              │   │  │ P1  │ │ P2  │ │ P3  │     │
│  │   (55432)   │              │   │  └─────┘ └─────┘ └─────┘     │
│  └──────┬──────┘              │   │  ┌─────┐ ┌─────┐ ┌─────┐     │
│         │                     │   │  │ R1  │ │ R2  │ │ R3  │     │
│  ┌──────┴──────┐              │   │  └─────┘ └─────┘ └─────┘     │
│  │   Worker 1  │              │   │    Ports 7001-7006            │
│  │   (55433)   │              │   │                               │
│  └─────────────┘              │   │    Hash-slot sharding         │
│  ┌─────────────┐              │   │    3 primary + 3 replica      │
│  │   Worker 2  │              │   │                               │
│  │   (55434)   │              │   │    In-memory (RAM)             │
│  └─────────────┘              │   │                               │
│         RAM-backed            │   │    In-memory (RAM)             │
└───────────────────────────────┘   └───────────────────────────────┘
```

## Key Architectural Difference

> **Note:** An initial API prototype (ASP.NET Core) was built but abandoned during testing. At loads above 1,000 concurrent threads, the API became a bottleneck, leaving database resources underutilised. Final tests use **direct database access via JMeter Groovy scripts** for both systems, ensuring a fair comparison.

## Components

### Database Layer

#### PostgreSQL + Citus Cluster (`infrastructure/docker-compose.postgres.yml`)

- **1 Coordinator node** (port 55432) - receives queries, distributes to workers
- **2 Worker nodes** (ports 55433, 55434) - store actual data shards
- **Storage:** tmpfs (RAM-backed) for all nodes
- **Configuration:** UNLOGGED tables, fsync=off, synchronous_commit=off

**Tables distributed by `tenant_id`:**
- `tenants` - reference table (replicated to all workers)
- `users` - distributed
- `products` - distributed
- `product_variants` - distributed
- `discounts` - distributed
- `carts` - distributed
- `cart_items` - distributed

#### Redis Cluster (`infrastructure/docker-compose.redis.yml`)

- **6 nodes:** ports 7001-7006
- **3 primary + 3 replica** topology
- **Hash-slot sharding** (16,384 slots distributed across primaries)
- **Storage:** All data in RAM (appendonly disabled for pure RAM operation)

**Data structure:** Each cart stored as a single JSON object per key (e.g., `cart:{cartId}`)

### Load Testing Layer

#### JMeter Configuration

- **Version:** 5.6.3
- **Scripts:** Groovy (JSR223 Sampler) with compilation cache enabled
- **Mode:** Direct database connection (no HTTP/API layer)
- **PostgreSQL:** JDBC connection via Npgsql
- **Redis:** Jedis client library

#### Test Scenario (per virtual user)

1. Create cart
2. Add item
3. Add second item
4. Update item quantity
5. Remove item
6. View cart contents
7. Checkout (delete cart)

## Data Flow

### PostgreSQL Flow

```
JMeter (Groovy) → JDBC/Npgsql → Citus Coordinator → Worker(s)
                 ↓
        All queries include tenant_id for shard routing
```

### Redis Flow

```
JMeter (Groovy) → Jedis → Redis Cluster
                  ↓
         Hash-slot calculation from cart key
                  ↓
         Primary node (auto-failover to replica)
```

## Sharding Comparison

| Aspect | PostgreSQL + Citus | Redis Cluster |
|--------|-------------------|---------------|
| Shard key | `tenant_id` (composite PK) | Cart ID (hash slot) |
| Co-location | All tenant data on same shard | By hash slot |
| Reference tables | Replicated to all workers | N/A |
| Cross-shard queries | Coordinator scatter-gather | Multi-key operations |
| Consistency | ACID (100% guaranteed) | BASE (eventual) |

## Infrastructure

All experiments were run on a single VM provided by **Vilnius University MIF via OpenNebula**:

| Spec | Value |
|------|-------|
| CPU | 2 vCPU |
| RAM | 10 GB |
| Disk | 100 GB |
| OS | Ubuntu 24.04 LTS |

Both database clusters were configured with **RAM-backed storage** to isolate architectural differences from storage medium effects.
