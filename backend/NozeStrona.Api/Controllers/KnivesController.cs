using Microsoft.AspNetCore.Mvc;
using NozeStrona.Api.Services;

namespace NozeStrona.Api.Controllers;

[ApiController]
[Route("api/knives")]
public class KnivesController(IKnifeService knifeService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var knives = await knifeService.GetAllAsync(cancellationToken);
        return Ok(knives);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var knife = await knifeService.GetByIdAsync(id, cancellationToken);
        if (knife is null)
        {
            return NotFound();
        }

        return Ok(knife);
    }
}
