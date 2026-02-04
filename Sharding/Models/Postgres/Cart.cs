namespace Sharding.Models.Postgres;

public record Cart(
    Guid TenantId,
    Guid CartId,
    Guid UserId,
    Guid? DiscountId,
    DateTime CreatedAt,
    DateTime UpdatedAt
)
{
    public List<CartItem> Items { get; init; } = new();
};
