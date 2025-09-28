namespace Kanban.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<Board> Boards { get; set; } = new List<Board>();
}