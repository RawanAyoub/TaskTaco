namespace Kanban.Server.Services;

using Microsoft.AspNetCore.Http;

/// <summary>
/// Interface for profile-related operations including image upload and management.
/// </summary>
public interface IProfileService
{
    /// <summary>
    /// Uploads a profile picture for a user.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="file">The uploaded file.</param>
    /// <returns>The relative path to the uploaded file.</returns>
    Task<string> UploadProfilePictureAsync(string userId, IFormFile file);

    /// <summary>
    /// Deletes a user's profile picture.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <returns>True if the deletion was successful, otherwise false.</returns>
    Task<bool> DeleteProfilePictureAsync(string userId);

    /// <summary>
    /// Gets the profile picture path for a user.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <returns>The profile picture path if it exists, otherwise null.</returns>
    Task<string?> GetProfilePicturePathAsync(string userId);
}
