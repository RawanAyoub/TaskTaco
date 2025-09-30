// <copyright file="AuthController.cs" company="TaskTaco">
//   MIT License. See LICENSE in the project root for license information.
// </copyright>
// <summary>
//   Authentication controller for registration, login, and current user endpoints.
// </summary>
namespace Kanban.Server.Controllers
{
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;
    using Kanban.Domain.Entities;
    using Microsoft.AspNetCore.Authorization;
    using Kanban.Server.Models;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.IdentityModel.Tokens;

/// <summary>
/// Controller for user authentication operations including registration, login, and token refresh.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> userManager;
    private readonly IConfiguration configuration;

    /// <summary>
    /// Initializes a new instance of the <see cref="AuthController"/> class.
    /// </summary>
    /// <param name="userManager">The user manager for Identity operations.</param>
    /// <param name="configuration">The application configuration.</param>
    public AuthController(UserManager<User> userManager, IConfiguration configuration)
    {
        this.userManager = userManager;
        this.configuration = configuration;
    }

    /// <summary>
    /// Registers a new user account.
    /// </summary>
    /// <param name="model">The registration model.</param>
    /// <returns>Registration result with user information.</returns>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterModel model)
    {
        var user = new User
        {
            UserName = model.Email,
            Email = model.Email,
            Name = model.Name,
            EmailConfirmed = true,
        };

    var result = await this.userManager.CreateAsync(user, model.Password);

        if (result.Succeeded)
        {
            var token = this.GenerateJwtToken(user);
            return this.Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Name,
                    user.Email,
                },
            });
        }

        return this.BadRequest(result.Errors);
    }

    /// <summary>
    /// Authenticates a user and returns a JWT token.
    /// </summary>
    /// <param name="model">The login model.</param>
    /// <returns>Authentication result with JWT token.</returns>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        var user = await this.userManager.FindByEmailAsync(model.Email);
        if (user != null && await this.userManager.CheckPasswordAsync(user, model.Password))
        {
            var token = this.GenerateJwtToken(user);
            return this.Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Name,
                    user.Email,
                },
            });
        }

        return this.Unauthorized(new { message = "Invalid email or password" });
    }

    /// <summary>
    /// Gets the current user's information.
    /// </summary>
    /// <returns>Current user information.</returns>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = this.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return this.Unauthorized();
        }

        var user = await this.userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return this.NotFound();
        }

        return this.Ok(new
        {
            user.Id,
            user.Name,
            user.Email,
            user.ProfilePicture,
        });
    }

    /// <summary>
    /// Generates a JWT token for the specified user.
    /// </summary>
    /// <param name="user">The user to generate the token for.</param>
    /// <returns>A JWT token string.</returns>
    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
            new Claim("Name", user.Name),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            this.configuration["Jwt:Key"] ?? "your-super-secure-key-that-is-at-least-256-bits"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: this.configuration["Jwt:Issuer"] ?? "TaskTaco",
            audience: this.configuration["Jwt:Audience"] ?? "TaskTaco",
            claims: claims,
            expires: DateTime.Now.AddDays(7),
            signingCredentials: creds);

    return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
}
