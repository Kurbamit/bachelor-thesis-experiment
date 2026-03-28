using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sharding.Models.Postgres;
using Sharding.Repositories.Postgres;

namespace Sharding.Controllers.Postgres
{
    [Route("api/tenant/{tenantId:guid}/cart")]
    [ApiController]
    public class CartTenantController(CartTenantRepository repo) : ControllerBase
    {
        [HttpGet("{cartId:guid}")]
        [ProducesResponseType(typeof(Cart), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public Task<IActionResult> Get(Guid tenantId, Guid cartId, CancellationToken ct)
        {
            return repo.GetByIdAsync(tenantId, cartId, ct)
                .ContinueWith<IActionResult>(t =>
                {
                    var cart = t.Result;
                    return cart is null ? NotFound() : Ok(cart);
                }, ct);
        }

        [HttpPost]
        [ProducesResponseType(typeof(CreateCartResponse), StatusCodes.Status201Created)]
        public async Task<IActionResult> Create(
            Guid tenantId,
            [FromBody] CreateCartTenantRequest request,
            CancellationToken ct)
        {
            var cartId = await repo.CreateCartAsync(tenantId, request.UserId, ct);
            return CreatedAtAction(nameof(Get), new { tenantId, cartId }, new CreateCartResponse(cartId));
        }

        [HttpPut("{cartId:guid}/discount")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateDiscount(
            Guid tenantId,
            Guid cartId,
            [FromBody] UpdateCartDiscountRequest request,
            CancellationToken ct)
        {
            var updated = await repo.UpdateCartDiscountAsync(tenantId, cartId, request.DiscountId, ct);
            return updated ? NoContent() : NotFound();
        }

        [HttpDelete("{cartId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid tenantId, Guid cartId, CancellationToken ct)
        {
            var deleted = await repo.DeleteCartAsync(tenantId, cartId, ct);
            return deleted ? NoContent() : NotFound();
        }

        [HttpPost("{cartId:guid}/items")]
        [ProducesResponseType(typeof(AddCartItemResponse), StatusCodes.Status201Created)]
        public async Task<IActionResult> AddItem(
            Guid tenantId,
            Guid cartId,
            [FromBody] AddCartItemTenantRequest request,
            CancellationToken ct)
        {
            var cartItemId = await repo.AddItemToCartAsync(
                tenantId,
                cartId,
                request.ProductId,
                request.VariantId,
                request.Quantity,
                ct);

            return CreatedAtAction(nameof(Get), new { tenantId, cartId }, new AddCartItemResponse(cartItemId));
        }

        [HttpDelete("items/{cartItemId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RemoveItem(Guid tenantId, Guid cartItemId, CancellationToken ct)
        {
            var removed = await repo.RemoveItemFromCartAsync(tenantId, cartItemId, ct);
            return removed ? NoContent() : NotFound();
        }

        [HttpPut("items/{cartItemId:guid}/quantity")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateItemQuantity(
            Guid tenantId,
            Guid cartItemId,
            [FromBody] UpdateCartItemQuantityRequest request,
            CancellationToken ct)
        {
            var updated = await repo.UpdateCartItemQuantityAsync(tenantId, cartItemId, request.Quantity, ct);
            return updated ? NoContent() : NotFound();
        }
    }

    public record CreateCartTenantRequest(Guid UserId);
    public record AddCartItemTenantRequest(Guid ProductId, Guid? VariantId, int Quantity);
}
