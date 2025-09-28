namespace Kanban.Domain.Entities;

/// <summary>
/// Represents a column in a Kanban board.
/// </summary>
public class Column
{
    /// <summary>
    /// Gets or sets the unique identifier for the column.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the column.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the identifier of the board this column belongs to.
    /// </summary>
    public int BoardId { get; set; }

    /// <summary>
    /// Gets or sets the order of the column within the board.
    /// </summary>
    public int Order { get; set; }

    /// <summary>
    /// Gets or sets the board this column belongs to.
    /// </summary>
    public Board Board { get; set; } = null!;

    /// <summary>
    /// Gets or sets the collection of tasks in this column.
    /// </summary>
    public ICollection<Task> Tasks { get; set; } = new List<Task>();
}