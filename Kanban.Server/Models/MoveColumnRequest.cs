namespace Kanban.Server.Models;

/// <summary>
/// Request model for moving a column.
/// </summary>
public class MoveColumnRequest
{
    /// <summary>
    /// Gets or sets the new order position.
    /// </summary>
    public int NewOrder { get; set; }
}
