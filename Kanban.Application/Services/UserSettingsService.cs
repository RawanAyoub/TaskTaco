using Kanban.Domain.Entities;
using Kanban.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Kanban.Application.Services;

/// <summary>
/// Interface for user settings-related operations.
/// </summary>
public interface IUserSettingsService
{
    /// <summary>
    /// Gets the user settings for a specific user asynchronously.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <returns>The user settings if found, otherwise null.</returns>
    Task<UserSettings?> GetUserSettingsAsync(string userId);

    /// <summary>
    /// Creates or updates user settings asynchronously.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="theme">The theme name.</param>
    /// <param name="defaultEmoji">The default emoji.</param>
    /// <returns>The updated user settings.</returns>
    Task<UserSettings> CreateOrUpdateUserSettingsAsync(string userId, string theme, string defaultEmoji);

    /// <summary>
    /// Updates user settings asynchronously.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="theme">The new theme (optional).</param>
    /// <param name="defaultEmoji">The new default emoji (optional).</param>
    /// <returns>True if the update was successful, otherwise false.</returns>
    Task<bool> UpdateUserSettingsAsync(string userId, string? theme = null, string? defaultEmoji = null);
}

/// <summary>
/// Service for managing user settings.
/// </summary>
public class UserSettingsService : IUserSettingsService
{
    private readonly KanbanDbContext context;

    /// <summary>
    /// Initializes a new instance of the <see cref="UserSettingsService"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public UserSettingsService(KanbanDbContext context)
    {
        this.context = context;
    }

    /// <summary>
    /// Gets the user settings for a specific user asynchronously.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <returns>The user settings if found, otherwise null.</returns>
    public async Task<UserSettings?> GetUserSettingsAsync(string userId)
    {
        return await this.context.UserSettings
            .FirstOrDefaultAsync(us => us.UserId == userId);
    }

    /// <summary>
    /// Creates or updates user settings asynchronously.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="theme">The theme name.</param>
    /// <param name="defaultEmoji">The default emoji.</param>
    /// <returns>The updated user settings.</returns>
    public async Task<UserSettings> CreateOrUpdateUserSettingsAsync(string userId, string theme, string defaultEmoji)
    {
        var existingSettings = await GetUserSettingsAsync(userId);

        if (existingSettings != null)
        {
            existingSettings.UpdateSettings(theme, defaultEmoji);
            await this.context.SaveChangesAsync();
            return existingSettings;
        }
        else
        {
            var newSettings = new UserSettings
            {
                UserId = userId,
                Theme = theme,
                DefaultEmoji = defaultEmoji
            };

            this.context.UserSettings.Add(newSettings);
            await this.context.SaveChangesAsync();
            return newSettings;
        }
    }

    /// <summary>
    /// Updates user settings asynchronously.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="theme">The new theme (optional).</param>
    /// <param name="defaultEmoji">The new default emoji (optional).</param>
    /// <returns>True if the update was successful, otherwise false.</returns>
    public async Task<bool> UpdateUserSettingsAsync(string userId, string? theme = null, string? defaultEmoji = null)
    {
        var settings = await GetUserSettingsAsync(userId);
        if (settings == null)
        {
            return false;
        }

        settings.UpdateSettings(theme ?? settings.Theme, defaultEmoji ?? settings.DefaultEmoji);
        await this.context.SaveChangesAsync();
        return true;
    }
}