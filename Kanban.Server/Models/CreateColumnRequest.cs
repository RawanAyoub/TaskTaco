namespace Kanban.Server.Models;

/// <summary>
/// Request model for creating a column.
/// </summary>
public class CreateColumnRequest
{
    /// <summary>
    /// Gets or sets the column name.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the column order.
    /// </summary>
    public int Order { get; set; }
}
