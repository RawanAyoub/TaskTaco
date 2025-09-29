namespace Kanban.Domain.Entities;

/// <summary>
/// Represents user settings and preferences for the TaskTaco application.
/// </summary>
public class UserSettings
{
    /// <summary>
    /// Gets or sets the unique identifier for the user settings.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user these settings belong to.
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the selected theme name.
    /// Valid values: "Classic Taco", "Guacamole", "Salsa"
    /// </summary>
    public string Theme { get; set; } = "Classic Taco";

    /// <summary>
    /// Gets or sets the default emoji for new tasks.
    /// </summary>
    public string DefaultEmoji { get; set; } = "🌮";

    /// <summary>
    /// Gets or sets when the settings were created.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets when the settings were last updated.
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets the user these settings belong to.
    /// </summary>
    public User User { get; set; } = null!;

    /// <summary>
    /// Gets the available theme options.
    /// </summary>
    public static readonly string[] AvailableThemes = { "Classic Taco", "Guacamole", "Salsa" };

    /// <summary>
    /// Validates if the theme is a valid option.
    /// </summary>
    /// <param name="theme">The theme to validate.</param>
    /// <returns>True if the theme is valid, false otherwise.</returns>
    public static bool IsValidTheme(string theme)
    {
        return AvailableThemes.Contains(theme);
    }

    /// <summary>
    /// Updates the settings and sets the UpdatedAt timestamp.
    /// </summary>
    /// <param name="theme">The new theme.</param>
    /// <param name="defaultEmoji">The new default emoji.</param>
    public void UpdateSettings(string theme, string defaultEmoji)
    {
        if (IsValidTheme(theme))
        {
            Theme = theme;
        }

        if (!string.IsNullOrWhiteSpace(defaultEmoji))
        {
            DefaultEmoji = defaultEmoji;
        }

        UpdatedAt = DateTime.UtcNow;
    }
}