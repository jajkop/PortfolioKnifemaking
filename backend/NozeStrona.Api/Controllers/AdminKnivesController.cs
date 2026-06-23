using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NozeStrona.Api.DTOs;
using NozeStrona.Api.Services;

namespace NozeStrona.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/knives")]
public class AdminKnivesController(IKnifeService knifeService) : ControllerBase
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

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] KnifeCreateUpdateDto dto, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var knife = await knifeService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = knife.Id }, knife);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] KnifeCreateUpdateDto dto, CancellationToken cancellationToken)
    {
        var knife = await knifeService.UpdateAsync(id, dto, cancellationToken);
        if (knife is null)
        {
            return NotFound();
        }

        return Ok(knife);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await knifeService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpPost("{id:int}/images")]
    [DisableRequestSizeLimit]
    [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue, ValueLengthLimit = int.MaxValue)]
    public async Task<IActionResult> UploadImage(int id, IFormFile file, CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(new { message = "Plik jest wymagany." });
        }

        try
        {
            var image = await knifeService.AddImageAsync(id, file, cancellationToken);
            if (image is null)
            {
                return NotFound();
            }

            return Ok(image);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{knifeId:int}/images/{imageId:int}")]
    public async Task<IActionResult> DeleteImage(int knifeId, int imageId, CancellationToken cancellationToken)
    {
        var deleted = await knifeService.DeleteImageAsync(knifeId, imageId, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpPut("{knifeId:int}/images/{imageId:int}/main")]
    public async Task<IActionResult> SetMainImage(int knifeId, int imageId, CancellationToken cancellationToken)
    {
        var image = await knifeService.SetMainImageAsync(knifeId, imageId, cancellationToken);
        if (image is null)
        {
            return NotFound();
        }

        return Ok(image);
    }
}
