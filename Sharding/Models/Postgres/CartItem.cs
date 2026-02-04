namespace Sharding.Models.Postgres;

public record CartItem(
    Guid TenantId,
    Guid CartItemId,
    Guid CartId,
    Guid ProductId,
    Guid? VariantId,
    int Quantity,
    DateTime CreatedAt
);
