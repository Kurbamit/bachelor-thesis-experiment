namespace Sharding.Models.Postgres;

public sealed record Product(
    Guid TenantId,
    Guid ProductId,
    string Name,
    decimal Price,
    string Category,
    DateTime CreatedAt
);