namespace Kanban.Server.Models;

/// <summary>
/// Request model for updating a board.
/// </summary>
public class UpdateBoardRequest
{
    /// <summary>
    /// Gets or sets the board name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the optional board description.
    /// </summary>
    public string? Description { get; set; }
}
