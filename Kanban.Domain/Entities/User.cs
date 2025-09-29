namespace Kanban.Domain.Entities;

using Microsoft.AspNetCore.Identity;

/// <summary>
/// Represents a user in the TaskTaco application with authentication, board ownership, and profile capabilities.
/// </summary>
public class User : IdentityUser
{
    /// <summary>
    /// Gets or sets the display name of the user.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the profile picture file path or URL for the user.
    /// </summary>
    public string? ProfilePicture { get; set; }

    /// <summary>
    /// Gets or sets the collection of boards owned by this user.
    /// </summary>
    public ICollection<Board> Boards { get; set; } = new List<Board>();

    /// <summary>
    /// Gets or sets the user's settings and preferences.
    /// </summary>
    public UserSettings? Settings { get; set; }
}