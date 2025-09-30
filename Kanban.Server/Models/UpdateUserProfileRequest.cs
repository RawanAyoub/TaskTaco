namespace Kanban.Server.Models;

/// <summary>
/// Request model for updating user profile.
/// </summary>
public class UpdateUserProfileRequest
{
    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
}
