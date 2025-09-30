namespace Kanban.Server.Models;

/// <summary>
/// Response model for profile picture upload.
/// </summary>
public class UploadProfilePictureResponse
{
    public string ProfilePicturePath { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;
}
