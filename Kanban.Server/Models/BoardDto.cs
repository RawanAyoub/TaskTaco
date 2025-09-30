namespace Kanban.Server.Models;

/// <summary>
/// DTO for returning board data.
/// </summary>
public class BoardDto
{
    /// <summary>
    /// Gets or sets the board ID.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the board name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the optional board description.
    /// </summary>
    public string? Description { get; set; }
}
