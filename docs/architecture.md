# System Architecture

## Overview

The system consists of three main layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Load Testing Layer                        │
│                    (Apache JMeter + Prometheus)                  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Layer                               │
│              ASP.NET Core Web API + Prometheus                  │
│                     (Sharding.Api)                              │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
┌───────────────────────────┐   ┌───────────────────────────────┐
│      SSH Tunnel           │   │      Direct Connection        │
│  (Remote Database)       │   │    (Local Docker Cluster)     │
└───────────────────────────┘   └───────────────────────────────┘
                    │                         │
                    └────────────┬────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Database Layer                              │
│              PostgreSQL + Citus Extension                       │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│   │ Coordinator │────│   Worker 1   │────│   Worker 2   │     │
│   │   (Citus)   │    │   (Citus)   │    │   (Citus)   │     │
│   └─────────────┘    └─────────────┘    └─────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### API Layer (`src/Api`)

The ASP.NET Core Web API provides REST endpoints for shopping cart operations.

**Key Components:**
- `Controllers/Postgres/CartController.cs` - Non-tenant cart operations
- `Controllers/Postgres/CartTenantController.cs` - Tenant-scoped cart operations
- `Controllers/Postgres/ProductController.cs` - Product read operations
- `Repositories/Postgres/CartRepository.cs` - Cart data access with Prometheus metrics
- `Services/Postgres/DbConnectionFactory.cs` - Npgsql connection factory
- `Services/SshTunnelService.cs` - SSH tunnel management as BackgroundService

**Configuration:**
- `appsettings.json` - SSH tunnel and database configuration
- `prometheus.yml` - Prometheus scrape configuration

### Database Layer

**Citus Cluster (docker-compose.postgres.yml):**
- 1 Coordinator node (port 55432)
- 2 Worker nodes (ports 55433, 55434)
- tmpfs storage for performance testing
- Optimized PostgreSQL settings (fsync=off, synchronous_commit=off)

**Redis Cluster (docker-compose.redis.yml):**
- 6 Redis nodes (ports 7001-7006)
- Cluster mode enabled
- Used for comparison benchmarking

### Monitoring Layer

**Prometheus Metrics:**
- Exposed at `/metrics` endpoint
- Custom metrics for cart repository operations
- Latency percentiles (p50, p90, p95, p99)
- Error rates by operation type

**Grafana Dashboards:**
- Located in `infrastructure/grafana/`
- JSON dashboard for Citus metrics visualization

## Data Flow

### Non-Tenant Request Flow

```
Client → CartController.Get(cartId)
       → CartRepository.GetByIdAsync(cartId)
       → DbConnectionFactory (via SSH tunnel or direct)
       → Citus Coordinator → Worker(s)
```

### Tenant-Scoped Request Flow

```
Client → CartTenantController.Get(tenantId, cartId)
       → CartTenantRepository.GetByTenantAsync(tenantId, cartId)
       → DbConnectionFactory
       → Citus Coordinator (routes to correct shard by tenant_id)
       → Worker (specific shard containing tenant data)
```

## Sharding Strategies

### 1. Simple Sharding (Entity-Based)

Tables distributed by their own primary keys:

```sql
SELECT create_distributed_table('users', 'user_id');
SELECT create_distributed_table('products', 'product_id');
SELECT create_distributed_table('cart', 'user_id');
```

**Pros:** Simple to implement
**Cons:** Cross-entity queries require scatter-gather, no data co-location

### 2. Tenant-Based Sharding

All tenant-scoped data distributed by `tenant_id`:

```sql
SELECT create_distributed_table('users', 'tenant_id');
SELECT create_distributed_table('products', 'tenant_id');
SELECT create_distributed_table('cart', 'tenant_id');
```

**Pros:** All data for a tenant on same shard, optimal for multi-tenant apps
**Cons:** Requires composite primary keys including tenant_id

## Connection Architecture

### Local Development

```
API → localhost:5433 → Citus Coordinator → Workers
```

### Remote Deployment

```
API → SSH Tunnel (193.219.91.103:11200) → Remote PostgreSQL → Citus Coordinator
```
