namespace Kanban.Domain.Entities;

/// <summary>
/// Represents a task within a Kanban board column.
/// </summary>
public class Task
{
    /// <summary>
    /// Gets or sets the unique identifier for the task.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the title of the task.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the description of the task.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the status of the task.
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the priority of the task.
    /// </summary>
    public string Priority { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the due date of the task.
    /// </summary>
    public DateTime? DueDate { get; set; }

    /// <summary>
    /// Gets or sets the tags associated with the task.
    /// </summary>
    public string Tags { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the attachments associated with the task.
    /// </summary>
    public string Attachments { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the ID of the column containing this task.
    /// </summary>
    public int ColumnId { get; set; }

    /// <summary>
    /// Gets or sets the display order of the task within its column.
    /// </summary>
    public int Order { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user assigned to this task.
    /// </summary>
    public string? AssignedUserId { get; set; }

    /// <summary>
    /// Gets or sets the column containing this task.
    /// </summary>
    public Column Column { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user assigned to this task.
    /// </summary>
    public User? AssignedUser { get; set; }
}