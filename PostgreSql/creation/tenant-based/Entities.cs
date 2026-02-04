public record Tenant(Guid tenant_id, string name);
public record User(Guid tenant_id, Guid user_id, string username, string email, DateTime created_at);
public record Product(Guid tenant_id, Guid product_id, string name, decimal price, ProductCategory category, DateTime created_at);
public record Discount(Guid tenant_id, Guid discount_id, string code, decimal percentage, DateTime valid_from, DateTime valid_to);
public record ProductVariant(Guid tenant_id, Guid variant_id, Guid product_id, string variant_name, decimal additional_price, DateTime created_at);
public record CartItem(Guid tenant_id, Guid cart_item_id, Guid cart_id, Guid product_id, Guid? variant_id, int quantity, DateTime created_at);
public record Cart(Guid tenant_id, Guid cart_id, Guid user_id, List<CartItem> items, DateTime created_at, DateTime updated_at);


public enum ProductCategory
{
    Electronics,
    Clothing,
    HomeGoods,
    Books,
    Toys
}