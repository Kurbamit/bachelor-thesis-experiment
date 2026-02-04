namespace Sharding.Models.Postgres;

public record ProductVariant(
    Guid TenantId,
    Guid VariantId,
    Guid ProductId,
    string VariantName,
    decimal AdditionalPrice,
    DateTime CreatedAt
);
