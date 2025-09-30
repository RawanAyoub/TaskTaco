namespace Kanban.Server.Controllers
{
    using Kanban.Server.Services;
    using Microsoft.AspNetCore.Authorization;
    using Kanban.Server.Models;
    using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Controller for managing user profile operations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService profileService;

    /// <summary>
    /// Initializes a new instance of the <see cref="ProfileController"/> class.
    /// </summary>
    /// <param name="profileService">The profile service.</param>
    public ProfileController(IProfileService profileService)
    {
        this.profileService = profileService;
    }

    /// <summary>
    /// Uploads a profile picture for the current user.
    /// </summary>
    /// <param name="file">The profile picture file to upload.</param>
    /// <returns>The path to the uploaded profile picture.</returns>
    /// <response code="200">Profile picture uploaded successfully.</response>
    /// <response code="400">Invalid file or request.</response>
    /// <response code="401">User is not authorized.</response>
    [HttpPost("upload-picture")]
    [ProducesResponseType(typeof(UploadProfilePictureResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> UploadProfilePicture(IFormFile file)
    {
        try
        {
            var userId = this.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return this.Unauthorized();
            }

            var profilePicturePath = await this.profileService.UploadProfilePictureAsync(userId, file);

            return this.Ok(new UploadProfilePictureResponse
            {
                ProfilePicturePath = profilePicturePath,
                Message = "Profile picture uploaded successfully",
            });
        }
        catch (ArgumentException ex)
        {
            return this.BadRequest(new { message = ex.Message });
        }
        catch (Exception)
        {
            return this.StatusCode(500, new { message = "An error occurred while uploading the profile picture." });
        }
    }

    /// <summary>
    /// Deletes the profile picture for the current user.
    /// </summary>
    /// <returns>A success message.</returns>
    /// <response code="200">Profile picture deleted successfully.</response>
    /// <response code="401">User is not authorized.</response>
    /// <response code="404">Profile picture not found.</response>
    [HttpDelete("delete-picture")]
    [ProducesResponseType(typeof(DeleteProfilePictureResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteProfilePicture()
    {
        try
        {
            var userId = this.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return this.Unauthorized();
            }

            var deleted = await this.profileService.DeleteProfilePictureAsync(userId);

            if (!deleted)
            {
                return this.NotFound(new { message = "Profile picture not found." });
            }

            return this.Ok(new DeleteProfilePictureResponse
            {
                Message = "Profile picture deleted successfully",
            });
        }
        catch (Exception)
        {
            return this.StatusCode(500, new { message = "An error occurred while deleting the profile picture." });
        }
    }

    /// <summary>
    /// Gets the profile picture path for the current user.
    /// </summary>
    /// <returns>The profile picture path.</returns>
    /// <response code="200">Profile picture path retrieved successfully.</response>
    /// <response code="401">User is not authorized.</response>
    [HttpGet("picture-path")]
    [ProducesResponseType(typeof(GetProfilePicturePathResponse), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetProfilePicturePath()
    {
        try
        {
            var userId = this.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return this.Unauthorized();
            }

            var profilePicturePath = await this.profileService.GetProfilePicturePathAsync(userId);

            return this.Ok(new GetProfilePicturePathResponse
            {
                ProfilePicturePath = profilePicturePath,
            });
        }
        catch (Exception)
        {
            return this.StatusCode(500, new { message = "An error occurred while retrieving the profile picture path." });
        }
    }
}

}