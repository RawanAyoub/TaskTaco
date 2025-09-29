namespace Kanban.Server.Controllers;

using Kanban.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

/// <summary>
/// API controller for user profile and settings management.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService userService;

    /// <summary>
    /// Initializes a new instance of the <see cref="UserController"/> class.
    /// </summary>
    /// <param name="userService">The user service.</param>
    public UserController(IUserService userService)
    {
        this.userService = userService;
    }

    /// <summary>
    /// Gets the current user's profile information.
    /// </summary>
    /// <returns>The user profile data.</returns>
    [HttpGet("profile")]
    public async Task<ActionResult<UserProfileResponse>> GetProfile()
    {
        var userId = this.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return this.Unauthorized();
        }

        var user = await this.userService.GetUserProfileAsync(userId);
        if (user == null)
        {
            return this.NotFound();
        }

        return this.Ok(new UserProfileResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email ?? string.Empty,
            ProfilePicture = user.ProfilePicture,
        });
    }

    /// <summary>
    /// Updates the current user's profile information.
    /// </summary>
    /// <param name="request">The profile update request.</param>
    /// <returns>Success or error response.</returns>
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileRequest request)
    {
        var userId = this.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return this.Unauthorized();
        }

        if (!this.ModelState.IsValid)
        {
            return this.BadRequest(this.ModelState);
        }

        var success = await this.userService.UpdateUserProfileAsync(userId, request.Name, request.Email);
        if (!success)
        {
            return this.BadRequest("Failed to update profile");
        }

        return this.Ok();
    }

    /// <summary>
    /// Gets the current user's settings.
    /// </summary>
    /// <returns>The user settings data.</returns>
    [HttpGet("settings")]
    public async Task<ActionResult<UserSettingsResponse>> GetSettings()
    {
        var userId = this.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return this.Unauthorized();
        }

        var settings = await this.userService.GetUserSettingsAsync(userId);

        return this.Ok(new UserSettingsResponse
        {
            Theme = settings.Theme,
            DefaultEmoji = settings.DefaultEmoji,
            AvailableThemes = this.userService.GetAvailableThemes(),
        });
    }

    /// <summary>
    /// Updates the current user's settings.
    /// </summary>
    /// <param name="request">The settings update request.</param>
    /// <returns>Success or error response.</returns>
    [HttpPut("settings")]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateUserSettingsRequest request)
    {
        var userId = this.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return this.Unauthorized();
        }

        if (!this.ModelState.IsValid)
        {
            return this.BadRequest(this.ModelState);
        }

        var success = await this.userService.UpdateUserSettingsAsync(userId, request.Theme, request.DefaultEmoji);
        if (!success)
        {
            return this.BadRequest("Failed to update settings");
        }

        return this.Ok();
    }
}

/// <summary>
/// Response model for user profile data.
/// </summary>
public class UserProfileResponse
{
    /// <summary>
    /// Gets or sets the user ID.
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user's display name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user's profile picture URL.
    /// </summary>
    public string? ProfilePicture { get; set; }
}

/// <summary>
/// Request model for updating user profile.
/// </summary>
public class UpdateUserProfileRequest
{
    /// <summary>
    /// Gets or sets the new display name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the new email address.
    /// </summary>
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Response model for user settings data.
/// </summary>
public class UserSettingsResponse
{
    /// <summary>
    /// Gets or sets the current theme.
    /// </summary>
    public string Theme { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the default emoji.
    /// </summary>
    public string DefaultEmoji { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the available theme options.
    /// </summary>
    public string[] AvailableThemes { get; set; } = Array.Empty<string>();
}

/// <summary>
/// Request model for updating user settings.
/// </summary>
public class UpdateUserSettingsRequest
{
    /// <summary>
    /// Gets or sets the new theme.
    /// </summary>
    public string Theme { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the new default emoji.
    /// </summary>
    public string DefaultEmoji { get; set; } = string.Empty;
}