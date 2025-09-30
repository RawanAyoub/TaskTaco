namespace Kanban.Server.Models;

/// <summary>
/// Model for user login requests.
/// </summary>
public class LoginModel
{
    public required string Email { get; set; }

    public required string Password { get; set; }
}
