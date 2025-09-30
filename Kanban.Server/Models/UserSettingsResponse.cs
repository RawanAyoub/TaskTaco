namespace Kanban.Server.Models;

/// <summary>
/// Response model for user settings data.
/// </summary>
public class UserSettingsResponse
{
    public string Theme { get; set; } = string.Empty;

    public string DefaultEmoji { get; set; } = string.Empty;

    public string[] AvailableThemes { get; set; } = Array.Empty<string>();
}
