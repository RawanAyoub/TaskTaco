namespace Kanban.Domain.Entities;

using Microsoft.AspNetCore.Identity;

/// <summary>
/// Represents a user in the Kanban application with authentication and board ownership capabilities.
/// </summary>
public class User : IdentityUser
{
    /// <summary>
    /// Gets or sets the display name of the user.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the collection of boards owned by this user.
    /// </summary>
    public ICollection<Board> Boards { get; set; } = new List<Board>();
}