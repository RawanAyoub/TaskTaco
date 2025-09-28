namespace Kanban.Domain.Entities;

/// <summary>
/// Represents a Kanban board containing columns and tasks.
/// </summary>
public class Board
{
    /// <summary>
    /// Gets or sets the unique identifier for the board.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the board.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the ID of the user who owns this board.
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user who owns this board.
    /// </summary>
    public User User { get; set; } = null!;

    /// <summary>
    /// Gets or sets the collection of columns in this board.
    /// </summary>
    public ICollection<Column> Columns { get; set; } = new List<Column>();
}