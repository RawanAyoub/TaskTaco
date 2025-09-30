namespace Kanban.Server.Models;

/// <summary>
/// Request model for updating a task.
/// </summary>
public class UpdateTaskRequest
{
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string Priority { get; set; } = string.Empty;

    public DateTime? DueDate { get; set; }

    public List<string>? Labels { get; set; }

    public List<ChecklistItemRequest>? Checklist { get; set; }

    public List<string>? Stickers { get; set; }
}
