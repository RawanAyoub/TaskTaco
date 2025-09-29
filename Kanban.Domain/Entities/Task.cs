using System.Text.Json;

namespace Kanban.Domain.Entities;

/// <summary>
/// Represents a task within a Kanban board column with enhanced TaskTaco features.
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
    /// Gets or sets the priority level of the task.
    /// </summary>
    public Enums.Priority Priority { get; set; } = Enums.Priority.Medium;

    /// <summary>
    /// Gets or sets the status of the task (column reference).
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the due date of the task.
    /// </summary>
    public DateTime? DueDate { get; set; }

    /// <summary>
    /// Gets or sets the labels associated with the task as a JSON array.
    /// </summary>
    public string Labels { get; set; } = "[]";

    /// <summary>
    /// Gets or sets the checklist items as a JSON array.
    /// </summary>
    public string Checklist { get; set; } = "[]";

    /// <summary>
    /// Gets or sets the sticker emojis as a JSON array.
    /// </summary>
    public string Stickers { get; set; } = "[]";

    /// <summary>
    /// Gets or sets when the task was created.
    /// </summary>
    public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets when the task was last updated.
    /// </summary>
    public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets the ID of the column containing this task.
    /// </summary>
    public int ColumnId { get; set; }

    /// <summary>
    /// Gets or sets the display order of the task within its column.
    /// </summary>
    public int Order { get; set; }

    /// <summary>
    /// Gets or sets the column containing this task.
    /// </summary>
    public Column Column { get; set; } = null!;

    // Helper methods for working with JSON fields

    /// <summary>
    /// Gets the labels as a list of strings.
    /// </summary>
    public List<string> GetLabels()
    {
        try
        {
            return JsonSerializer.Deserialize<List<string>>(Labels) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }

    /// <summary>
    /// Sets the labels from a list of strings.
    /// </summary>
    public void SetLabels(List<string> labels)
    {
        Labels = JsonSerializer.Serialize(labels);
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Gets the checklist items as a list of ChecklistItem objects.
    /// </summary>
    public List<ValueObjects.ChecklistItem> GetChecklist()
    {
        try
        {
            var items = JsonSerializer.Deserialize<List<dynamic>>(Checklist) ?? new List<dynamic>();
            return items.Select(item => new ValueObjects.ChecklistItem(
                item.GetProperty("id").GetString() ?? Guid.NewGuid().ToString(),
                item.GetProperty("text").GetString() ?? "",
                item.GetProperty("done").GetBoolean()
            )).ToList();
        }
        catch
        {
            return new List<ValueObjects.ChecklistItem>();
        }
    }

    /// <summary>
    /// Sets the checklist from a list of ChecklistItem objects.
    /// </summary>
    public void SetChecklist(List<ValueObjects.ChecklistItem> items)
    {
        var serializable = items.Select(item => new { id = item.Id, text = item.Text, done = item.Done }).ToList();
        Checklist = JsonSerializer.Serialize(serializable);
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Gets the stickers as a list of emoji strings.
    /// </summary>
    public List<string> GetStickers()
    {
        try
        {
            return JsonSerializer.Deserialize<List<string>>(Stickers) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }

    /// <summary>
    /// Sets the stickers from a list of emoji strings.
    /// </summary>
    public void SetStickers(List<string> stickers)
    {
        Stickers = JsonSerializer.Serialize(stickers);
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Determines if the task is overdue.
    /// </summary>
    public bool IsOverdue => DueDate.HasValue && DueDate.Value < DateTime.UtcNow;
}