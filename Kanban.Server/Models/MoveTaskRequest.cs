namespace Kanban.Server.Models;

/// <summary>
/// Request model for moving a task.
/// </summary>
public class MoveTaskRequest
{
    public int ColumnId { get; set; }

    public int Order { get; set; }
}
