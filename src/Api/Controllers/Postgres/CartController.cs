using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sharding.Models.Postgres;
using Sharding.Repositories.Postgres;

namespace Sharding.Controllers.Postgres
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController(CartRepository repo) : ControllerBase
    {
        [HttpGet("{cartId:guid}")]
        [ProducesResponseType(typeof(Cart), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<IActionResult> Get(Guid cartId, CancellationToken ct)
        {
            return repo.GetByIdAsync(cartId, ct)
                .ContinueWith<IActionResult>(t =>
                {
                    var cart = t.Result;
                    return cart is null ? NotFound() : Ok(cart);
                }, ct);
        }

        [HttpPost]
        [ProducesResponseType(typeof(CreateCartResponse), StatusCodes.Status201Created)]
        public async Task<IActionResult> Create(
            [FromBody] CreateCartRequest request,
            CancellationToken ct)
        {
            var cartId = await repo.CreateCartAsync(request.TenantId, request.UserId, ct);
            return CreatedAtAction(nameof(Get), new { cartId }, new CreateCartResponse(cartId));
        }

        [HttpPut("{cartId:guid}/discount")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateDiscount(
            Guid cartId,
            [FromBody] UpdateCartDiscountRequest request,
            CancellationToken ct)
        {
            var updated = await repo.UpdateCartDiscountAsync(cartId, request.DiscountId, ct);
            return updated ? NoContent() : NotFound();
        }

        [HttpDelete("{cartId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid cartId, CancellationToken ct)
        {
            var deleted = await repo.DeleteCartAsync(cartId, ct);
            return deleted ? NoContent() : NotFound();
        }

        [HttpPost("{cartId:guid}/items")]
        [ProducesResponseType(typeof(AddCartItemResponse), StatusCodes.Status201Created)]
        public async Task<IActionResult> AddItem(
            Guid cartId,
            [FromBody] AddCartItemRequest request,
            CancellationToken ct)
        {
            var cartItemId = await repo.AddItemToCartAsync(
                request.TenantId,
                cartId,
                request.ProductId,
                request.VariantId,
                request.Quantity,
                ct);

            return CreatedAtAction(nameof(Get), new { cartId }, new AddCartItemResponse(cartItemId));
        }

        [HttpDelete("items/{cartItemId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RemoveItem(Guid cartItemId, CancellationToken ct)
        {
            var removed = await repo.RemoveItemFromCartAsync(cartItemId, ct);
            return removed ? NoContent() : NotFound();
        }

        [HttpPut("items/{cartItemId:guid}/quantity")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateItemQuantity(
            Guid cartItemId,
            [FromBody] UpdateCartItemQuantityRequest request,
            CancellationToken ct)
        {
            var updated = await repo.UpdateCartItemQuantityAsync(cartItemId, request.Quantity, ct);
            return updated ? NoContent() : NotFound();
        }
    }

    // Request/Response DTOs
    public record CreateCartRequest(Guid TenantId, Guid UserId);
    public record CreateCartResponse(Guid CartId);
    public record UpdateCartDiscountRequest(Guid? DiscountId);
    public record AddCartItemRequest(Guid TenantId, Guid ProductId, Guid? VariantId, int Quantity);
    public record AddCartItemResponse(Guid CartItemId);
    public record UpdateCartItemQuantityRequest(int Quantity);
}
