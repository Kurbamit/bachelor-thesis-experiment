using Microsoft.AspNetCore.Mvc;
using Sharding.Models.Postgres;
using Sharding.Repositories.Postgres;

namespace Sharding.Controllers.Postgres;

[ApiController]
[Route("api/products")]
public sealed class ProductsController(ProductRepository repo) : ControllerBase
{
    [HttpGet("{productId:guid}")]
    [ProducesResponseType(typeof(Product), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(
        Guid productId,
        CancellationToken ct)
    {
        var product = await repo.GetByIdAsync(productId, ct);
        return product is null ? NotFound() : Ok(product);
    }
}