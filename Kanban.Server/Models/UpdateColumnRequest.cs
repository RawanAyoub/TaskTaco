namespace Kanban.Server.Models;

/// <summary>
/// Request model for updating a column.
/// </summary>
public class UpdateColumnRequest
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
