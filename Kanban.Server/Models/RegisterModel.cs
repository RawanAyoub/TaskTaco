namespace Kanban.Server.Models;

/// <summary>
/// Model for user registration requests.
/// </summary>
public class RegisterModel
{
    public required string Name { get; set; }

    public required string Email { get; set; }

    public required string Password { get; set; }
}
