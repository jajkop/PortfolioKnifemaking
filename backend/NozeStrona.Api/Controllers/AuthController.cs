using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NozeStrona.Api.DTOs;
using NozeStrona.Api.Services;

namespace NozeStrona.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(request, cancellationToken);
        if (result is null)
        {
            return Unauthorized(new { message = "Nieprawidłowy login lub hasło." });
        }

        return Ok(result);
    }
}
