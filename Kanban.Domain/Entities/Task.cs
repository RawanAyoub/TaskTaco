namespace Kanban.Domain.Entities;

public class Task
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public string Tags { get; set; } = string.Empty;
    public string Attachments { get; set; } = string.Empty;
    public int ColumnId { get; set; }
    public int Order { get; set; }

    // Navigation properties
    public Column Column { get; set; } = null!;
}