namespace Sharding.Models.Postgres;

public record Discount(
    Guid TenantId,
    Guid DiscountId,
    string Code,
    decimal Percentage,
    DateTime ValidFrom,
    DateTime ValidTo
);
