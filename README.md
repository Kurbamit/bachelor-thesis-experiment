# Database Sharding Experiment for Multi-Tenant E-Commerce

A bachelor's thesis experiment investigating the performance and behavior of a sharded PostgreSQL database using Citus as a backend for a multi-tenant e-commerce shopping cart system.

## Overview

This experiment evaluates **horizontal sharding strategies** for multi-tenant e-commerce applications, specifically comparing:

1. **Entity-based sharding** - Tables distributed by their own primary keys (e.g., `user_id`, `product_id`)
2. **Tenant-based sharding** - All tenant-scoped data distributed by `tenant_id` for data co-location

## Technology Stack

| Component | Technology |
|-----------|------------|
| Language | C# (.NET 10) |
| Framework | ASP.NET Core Web API |
| Database | PostgreSQL with Citus extension |
| ORM | Dapper (micro-ORM) |
| Monitoring | Prometheus metrics |
| Load Testing | Apache JMeter |
| Containerization | Docker & Docker Compose |

## Project Structure

```
eksperimentas/
├── src/                    # Application source code
│   └── Api/               # ASP.NET Core Web API
├── database/              # Database schema and migrations
│   ├── schema/           # DDL scripts for different sharding strategies
│   ├── queries/           # Analytics and verification queries
│   └── migrations/        # Test data generation
├── infrastructure/        # Infrastructure configuration
│   ├── docker-compose.postgres.yml   # Citus cluster (1 coordinator + 2 workers)
│   ├── docker-compose.redis.yml      # Redis cluster (6 nodes)
│   ├── docker-compose.api.yml        # API container
│   └── prometheus.yml    # Prometheus scrape configuration
├── load-testing/          # JMeter load test configurations
│   ├── test-plans/        # JMeter test plans (.jmx)
│   ├── data/              # CSV test data
│   ├── results/           # Test results (.jtl)
│   └── scripts/           # Groovy scripts
└── docs/                  # Documentation
    ├── architecture.md
    ├── experiment-design.md
    ├── database-schema.md
    ├── api-reference.md
    └── results/           # Experiment results (to be added)
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- .NET 10 SDK (for local development)
- SSH access to remote database server (for remote deployment)

### Local Development

```bash
# Start infrastructure
cd infrastructure
docker-compose -f docker-compose.postgres.yml up -d

# Run the API
cd src/Api
dotnet run
```

The API will be available at `http://localhost:5119` with:
- Swagger UI: `/swagger`
- Prometheus metrics: `/metrics`

### Remote Deployment

The API connects to a remote PostgreSQL server via SSH tunnel. Configure in `src/Api/appsettings.json`:

```json
{
  "SshTunnel": {
    "SshHost": "193.219.91.103",
    "SshPort": 11200,
    "SshUser": "your-user",
    "LocalPort": 5433
  }
}
```

## Database Schema

### Tenant-Based Sharding (Recommended)

All tenant-scoped tables are distributed by `tenant_id` for optimal co-location:

```sql
-- Reference table (replicated to all nodes)
SELECT create_reference_table('public.tenants');

-- Distributed tables (sharded by tenant_id)
SELECT create_distributed_table('public.users', 'tenant_id');
SELECT create_distributed_table('public.products', 'tenant_id');
SELECT create_distributed_table('public.cart', 'tenant_id');
```

See [docs/database-schema.md](docs/database-schema.md) for full schema documentation.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Cart/{cartId}` | Get cart by ID |
| POST | `/api/Cart` | Create new cart |
| PUT | `/api/Cart/{cartId}/discount` | Update cart discount |
| DELETE | `/api/Cart/{cartId}` | Delete cart |
| POST | `/api/Cart/{cartId}/items` | Add item to cart |
| DELETE | `/api/Cart/items/{cartItemId}` | Remove item from cart |
| PUT | `/api/Cart/items/{cartItemId}/quantity` | Update item quantity |
| GET | `/api/tenant/{tenantId}/cart` | Get tenant's cart |
| GET | `/api/products/{productId}` | Get product by ID |

See [docs/api-reference.md](docs/api-reference.md) for full API documentation.

## Load Testing

JMeter test plans are located in `load-testing/test-plans/`. Key test scenarios:

- **TG01**: GET cart (30 threads, read-heavy)
- **TG02**: Add item to cart (10 threads)
- **TG03**: Update item quantity (5 threads)
- **TG04**: Update cart discount (3 threads)
- **TG05**: Remove item from cart (2 threads)

```bash
# Run a test plan
jmeter -n -t load-testing/test-plans/cart_api_load_test.jmx -l load-testing/results/results.jtl
```

## Monitoring

Prometheus metrics are exposed at `/metrics`:

- `cart_repository_requests_total` - Request count by operation
- `cart_repository_operation_duration_seconds` - Latency percentiles (p50, p90, p95, p99)
- `cart_repository_errors_total` - Error count by operation and type
- `cart_repository_active_operations` - Current concurrent operations
- `cart_repository_rows_affected` - Rows affected histogram

## Experiment Documentation

- [Architecture](docs/architecture.md) - System architecture and components
- [Experiment Design](docs/experiment-design.md) - Research questions and methodology
- [Database Schema](docs/database-schema.md) - Citus distribution and table structures
- [API Reference](docs/api-reference.md) - Detailed API endpoint documentation

## License

This project is for academic research purposes as part of a bachelor's thesis.
