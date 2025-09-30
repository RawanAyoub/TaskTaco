namespace Kanban.Server.Models;

/// <summary>
/// Response model for user profile data.
/// </summary>
public class UserProfileResponse
{
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? ProfilePicture { get; set; }
}
