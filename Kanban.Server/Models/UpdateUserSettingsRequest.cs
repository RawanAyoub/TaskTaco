namespace Kanban.Server.Models;

/// <summary>
/// Request model for updating user settings.
/// </summary>
public class UpdateUserSettingsRequest
{
    public string Theme { get; set; } = string.Empty;

    public string DefaultEmoji { get; set; } = string.Empty;
}