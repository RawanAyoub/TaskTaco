namespace Kanban.Server.Models;

/// <summary>
/// Request model for creating a board.
/// </summary>
public class CreateBoardRequest
{
    /// <summary>
    /// Gets or sets the board name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the board description.
    /// </summary>
    public string? Description { get; set; }
}
