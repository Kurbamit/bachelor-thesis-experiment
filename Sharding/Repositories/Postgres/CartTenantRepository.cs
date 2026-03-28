using Dapper;
using Sharding.Models.Postgres;
using Sharding.Services;

namespace Sharding.Repositories.Postgres;

public sealed class CartTenantRepository(DbConnectionFactory db)
{
    public async Task<Cart?> GetByIdAsync(
        Guid tenantId,
        Guid cartId,
        CancellationToken ct)
    {
        const string operationName = "get_by_id_tenant";
        CartRepositoryMetrics.RequestsTotal.WithLabels(operationName).Inc();
        CartRepositoryMetrics.ActiveOperations.WithLabels(operationName).Inc();

        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        try
        {
            const string sql = """
                                   SELECT
                                       c.tenant_id     AS "TenantId",
                                       c.cart_id       AS "CartId",
                                       c.user_id       AS "UserId",
                                       c.discount_id   AS "DiscountId",
                                       c.created_at    AS "CreatedAt",
                                       c.updated_at    AS "UpdatedAt",
                                       ci.tenant_id    AS "TenantId",
                                       ci.cart_item_id AS "CartItemId",
                                       ci.cart_id      AS "CartId",
                                       ci.product_id   AS "ProductId",
                                       ci.variant_id   AS "VariantId",
                                       ci.quantity     AS "Quantity",
                                       ci.created_at   AS "CreatedAt"
                                   FROM public.carts c
                                   LEFT JOIN public.cart_items ci
                                     ON c.cart_id = ci.cart_id
                                    AND c.tenant_id = ci.tenant_id
                                   WHERE c.tenant_id = @TenantId
                                     AND c.cart_id = @CartId;
                               """;

            using var conn = db.Create();
            var cartDictionary = new Dictionary<Guid, Cart>();

            await conn.QueryAsync<Cart, CartItem?, Cart>(
                new CommandDefinition(
                    sql,
                    new { TenantId = tenantId, CartId = cartId },
                    cancellationToken: ct
                ),
                (cart, cartItem) =>
                {
                    if (!cartDictionary.TryGetValue(cart.CartId, out var existingCart))
                    {
                        existingCart = cart with { Items = new List<CartItem>() };
                        cartDictionary[cart.CartId] = existingCart;
                    }

                    if (cartItem is not null)
                    {
                        existingCart.Items.Add(cartItem);
                    }

                    return existingCart;
                },
                splitOn: "TenantId"
            );

            return cartDictionary.Values.FirstOrDefault();
        }
        catch (Exception ex)
        {
            CartRepositoryMetrics.ErrorsTotal.WithLabels(operationName, ex.GetType().Name).Inc();
            throw;
        }
        finally
        {
            stopwatch.Stop();
            CartRepositoryMetrics.OperationDuration.WithLabels(operationName).Observe(stopwatch.Elapsed.TotalSeconds);
            CartRepositoryMetrics.ActiveOperations.WithLabels(operationName).Dec();
        }
    }

    public async Task<Guid> CreateCartAsync(
        Guid tenantId,
        Guid userId,
        CancellationToken ct)
    {
        const string operationName = "create_cart_tenant";
        CartRepositoryMetrics.RequestsTotal.WithLabels(operationName).Inc();
        CartRepositoryMetrics.ActiveOperations.WithLabels(operationName).Inc();

        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        try
        {
            const string sql = """
                                   INSERT INTO public.carts (tenant_id, cart_id, user_id, discount_id, created_at, updated_at)
                                   VALUES (@TenantId, @CartId, @UserId, NULL, @Now, @Now)
                                   RETURNING cart_id AS "CartId";
                               """;

            var cartId = Guid.NewGuid();
            using var conn = db.Create();

            await conn.ExecuteAsync(
                new CommandDefinition(
                    sql,
                    new { TenantId = tenantId, CartId = cartId, UserId = userId, Now = DateTime.UtcNow },
                    cancellationToken: ct
                ));

            CartRepositoryMetrics.RowsAffected.WithLabels(operationName).Observe(1);
            return cartId;
        }
        catch (Exception ex)
        {
            CartRepositoryMetrics.ErrorsTotal.WithLabels(operationName, ex.GetType().Name).Inc();
            throw;
        }
        finally
        {
            stopwatch.Stop();
            CartRepositoryMetrics.OperationDuration.WithLabels(operationName).Observe(stopwatch.Elapsed.TotalSeconds);
            CartRepositoryMetrics.ActiveOperations.WithLabels(operationName).Dec();
        }
    }

    public async Task<bool> UpdateCartDiscountAsync(
        Guid tenantId,
        Guid cartId,
        Guid? discountId,
        CancellationToken ct)
    {
        const string operationName = "update_cart_discount_tenant";
        CartRepositoryMetrics.RequestsTotal.WithLabels(operationName).Inc();
        CartRepositoryMetrics.ActiveOperations.WithLabels(operationName).Inc();

        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        try
        {
            const string sql = """
                                   UPDATE public.carts
                                   SET discount_id = @DiscountId, updated_at = @Now
                                   WHERE tenant_id = @TenantId
                                     AND cart_id = @CartId;
                               """;

            using var conn = db.Create();
            var rowsAffected = await conn.ExecuteAsync(
                new CommandDefinition(
                    sql,
                    new { TenantId = tenantId, CartId = cartId, DiscountId = discountId, Now = DateTime.UtcNow },
                    cancellationToken: ct
                ));

            CartRepositoryMetrics.RowsAffected.WithLabels(operationName).Observe(rowsAffected);
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            CartRepositoryMetrics.ErrorsTotal.WithLabels(operationName, ex.GetType().Name).Inc();
            throw;
        }
        finally
        {
            stopwatch.Stop();
            CartRepositoryMetrics.OperationDuration.WithLabels(operationName).Observe(stopwatch.Elapsed.TotalSeconds);
            CartRepositoryMetrics.ActiveOperations.WithLabels(operationName).Dec();
        }
    }

    public async Task<bool> DeleteCartAsync(
        Guid tenantId,
        Guid cartId,
        CancellationToken ct)
    {
        const string operationName = "delete_cart_tenant";
        CartRepositoryMetrics.RequestsTotal.WithLabels(operationName).Inc();
        CartRepositoryMetrics.ActiveOperations.WithLabels(operationName).Inc();

        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        try
        {
            const string sql = """
                                   DELETE FROM public.cart_items
                                   WHERE tenant_id = @TenantId
                                     AND cart_id = @CartId;

                                   DELETE FROM public.carts
                                   WHERE tenant_id = @TenantId
                                     AND cart_id = @CartId;
                               """;

            using var conn = db.Create();
            var rowsAffected = await conn.ExecuteAsync(
                new CommandDefinition(
                    sql,
                    new { TenantId = tenantId, CartId = cartId },
                    cancellationToken: ct
                ));

            CartRepositoryMetrics.RowsAffected.WithLabels(operationName).Observe(rowsAffected);
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            CartRepositoryMetrics.ErrorsTotal.WithLabels(operationName, ex.GetType().Name).Inc();
            throw;
        }
        finally
        {
            stopwatch.Stop();
            CartRepositoryMetrics.OperationDuration.WithLabels(operationName).Observe(stopwatch.Elapsed.TotalSeconds);
            CartRepositoryMetrics.ActiveOperations.WithLabels(operationName).Dec();
        }
    }

    public async Task<Guid> AddItemToCartAsync(
        Guid tenantId,
        Guid cartId,
        Guid productId,
        Guid? variantId,
        int quantity,
        CancellationToken ct)
    {
        const string operationName = "add_item_to_cart_tenant";
        CartRepositoryMetrics.RequestsTotal.WithLabels(operationName).Inc();
        CartRepositoryMetrics.ActiveOperations.WithLabels(operationName).Inc();

        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        try
        {
            const string sql = """
                                   INSERT INTO public.cart_items (tenant_id, cart_item_id, cart_id, product_id, variant_id, quantity, created_at)
                                   VALUES (@TenantId, @CartItemId, @CartId, @ProductId, @VariantId, @Quantity, @Now);

                                   UPDATE public.carts
                                   SET updated_at = @Now
                                   WHERE tenant_id = @TenantId
                                     AND cart_id = @CartId;
                               """;

            var cartItemId = Guid.NewGuid();
            using var conn = db.Create();

            await conn.ExecuteAsync(
                new CommandDefinition(
                    sql,
                    new
                    {
                        TenantId = tenantId,
                        CartItemId = cartItemId,
                        CartId = cartId,
                        ProductId = productId,
                        VariantId = variantId,
                        Quantity = quantity,
                        Now = DateTime.UtcNow
                    },
                    cancellationToken: ct
                ));

            CartRepositoryMetrics.RowsAffected.WithLabels(operationName).Observe(2);
            return cartItemId;
        }
        catch (Exception ex)
        {
            CartRepositoryMetrics.ErrorsTotal.WithLabels(operationName, ex.GetType().Name).Inc();
            throw;
        }
        finally
        {
            stopwatch.Stop();
            CartRepositoryMetrics.OperationDuration.WithLabels(operationName).Observe(stopwatch.Elapsed.TotalSeconds);
            CartRepositoryMetrics.ActiveOperations.WithLabels(operationName).Dec();
        }
    }

    public async Task<bool> RemoveItemFromCartAsync(
        Guid tenantId,
        Guid cartItemId,
        CancellationToken ct)
    {
        const string operationName = "remove_item_from_cart_tenant";
        CartRepositoryMetrics.RequestsTotal.WithLabels(operationName).Inc();
        CartRepositoryMetrics.ActiveOperations.WithLabels(operationName).Inc();

        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        try
        {
            const string sql = """
                                   WITH deleted AS (
                                       DELETE FROM public.cart_items
                                       WHERE tenant_id = @TenantId
                                         AND cart_item_id = @CartItemId
                                       RETURNING cart_id
                                   )
                                   UPDATE public.carts
                                   SET updated_at = @Now
                                   WHERE tenant_id = @TenantId
                                     AND cart_id IN (SELECT cart_id FROM deleted);
                               """;

            using var conn = db.Create();
            var rowsAffected = await conn.ExecuteAsync(
                new CommandDefinition(
                    sql,
                    new { TenantId = tenantId, CartItemId = cartItemId, Now = DateTime.UtcNow },
                    cancellationToken: ct
                ));

            CartRepositoryMetrics.RowsAffected.WithLabels(operationName).Observe(rowsAffected);
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            CartRepositoryMetrics.ErrorsTotal.WithLabels(operationName, ex.GetType().Name).Inc();
            throw;
        }
        finally
        {
            stopwatch.Stop();
            CartRepositoryMetrics.OperationDuration.WithLabels(operationName).Observe(stopwatch.Elapsed.TotalSeconds);
            CartRepositoryMetrics.ActiveOperations.WithLabels(operationName).Dec();
        }
    }

    public async Task<bool> UpdateCartItemQuantityAsync(
        Guid tenantId,
        Guid cartItemId,
        int quantity,
        CancellationToken ct)
    {
        const string operationName = "update_cart_item_quantity_tenant";
        CartRepositoryMetrics.RequestsTotal.WithLabels(operationName).Inc();
        CartRepositoryMetrics.ActiveOperations.WithLabels(operationName).Inc();

        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        try
        {
            const string sql = """
                                   WITH updated AS (
                                       UPDATE public.cart_items
                                       SET quantity = @Quantity
                                       WHERE tenant_id = @TenantId
                                         AND cart_item_id = @CartItemId
                                       RETURNING cart_id
                                   )
                                   UPDATE public.carts
                                   SET updated_at = @Now
                                   WHERE tenant_id = @TenantId
                                     AND cart_id IN (SELECT cart_id FROM updated);
                               """;

            using var conn = db.Create();
            var rowsAffected = await conn.ExecuteAsync(
                new CommandDefinition(
                    sql,
                    new { TenantId = tenantId, CartItemId = cartItemId, Quantity = quantity, Now = DateTime.UtcNow },
                    cancellationToken: ct
                ));

            CartRepositoryMetrics.RowsAffected.WithLabels(operationName).Observe(rowsAffected);
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            CartRepositoryMetrics.ErrorsTotal.WithLabels(operationName, ex.GetType().Name).Inc();
            throw;
        }
        finally
        {
            stopwatch.Stop();
            CartRepositoryMetrics.OperationDuration.WithLabels(operationName).Observe(stopwatch.Elapsed.TotalSeconds);
            CartRepositoryMetrics.ActiveOperations.WithLabels(operationName).Dec();
        }
    }
}
