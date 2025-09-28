namespace Kanban.Domain.Entities;

public class Board
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int UserId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<Column> Columns { get; set; } = new List<Column>();
}