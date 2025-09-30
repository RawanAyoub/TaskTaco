namespace Kanban.Server.Models;

/// <summary>
/// Request model for checklist item data.
/// </summary>
public class ChecklistItemRequest
{
    public string Id { get; set; } = string.Empty;

    public string Text { get; set; } = string.Empty;

    public bool Done { get; set; }
}
