using Dapper;
using Sharding.Models.Postgres;
using Sharding.Services;

namespace Sharding.Repositories.Postgres;

public sealed class ProductRepository(DbConnectionFactory db)
{
    public async Task<Product?> GetByIdAsync(
        Guid productId,
        CancellationToken ct)
    {
        const string sql = """
                               SELECT
                                   tenant_id  AS "TenantId",
                                   product_id AS "ProductId",
                                   name       AS "Name",
                                   price      AS "Price",
                                   category   AS "Category",
                                   created_at AS "CreatedAt"
                               FROM public.products
                               WHERE product_id = @ProductId;
                           """;


        using var conn = db.Create();
        return await conn.QuerySingleOrDefaultAsync<Product>(
            new CommandDefinition(
                sql,
                new { ProductId = productId },
                cancellationToken: ct
            ));
    }
}