namespace Kanban.Application.Services;

using Kanban.Domain.Entities;
using Kanban.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Interface for user-related operations including profile and settings management.
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Gets a user's profile information by user ID.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <returns>The user entity if found, null otherwise.</returns>
    Task<User?> GetUserProfileAsync(string userId);

    /// <summary>
    /// Updates a user's profile information.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="name">The new display name.</param>
    /// <param name="email">The new email address.</param>
    /// <returns>True if the update was successful, otherwise false.</returns>
    Task<bool> UpdateUserProfileAsync(string userId, string name, string email);

    /// <summary>
    /// Gets a user's settings, creating default settings if none exist.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <returns>The user settings entity.</returns>
    Task<UserSettings> GetUserSettingsAsync(string userId);

    /// <summary>
    /// Updates a user's settings.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="theme">The new theme.</param>
    /// <param name="defaultEmoji">The new default emoji.</param>
    /// <returns>True if the update was successful, otherwise false.</returns>
    Task<bool> UpdateUserSettingsAsync(string userId, string theme, string defaultEmoji);

    /// <summary>
    /// Gets all available theme options.
    /// </summary>
    /// <returns>Array of available theme names.</returns>
    string[] GetAvailableThemes();
}

/// <summary>
/// Service for user-related operations including profile and settings management.
/// </summary>
public class UserService : IUserService
{
    private readonly KanbanDbContext context;
    private readonly UserManager<User> userManager;

    /// <summary>
    /// Initializes a new instance of the <see cref="UserService"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="userManager">The user manager.</param>
    public UserService(KanbanDbContext context, UserManager<User> userManager)
    {
        this.context = context;
        this.userManager = userManager;
    }

    /// <inheritdoc/>
    public async Task<User?> GetUserProfileAsync(string userId)
    {
        return await this.context.Users
            .Include(u => u.Settings)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    /// <inheritdoc/>
    public async Task<bool> UpdateUserProfileAsync(string userId, string name, string email)
    {
        var user = await this.userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }

        // Update name
        if (!string.IsNullOrWhiteSpace(name) && name != user.Name)
        {
            user.Name = name;
        }

        // Update email if changed
        if (!string.IsNullOrWhiteSpace(email) && email != user.Email)
        {
            var emailResult = await this.userManager.SetEmailAsync(user, email);
            if (!emailResult.Succeeded)
            {
                return false;
            }

            var usernameResult = await this.userManager.SetUserNameAsync(user, email);
            if (!usernameResult.Succeeded)
            {
                return false;
            }
        }

        var result = await this.userManager.UpdateAsync(user);
        return result.Succeeded;
    }

    /// <inheritdoc/>
    public async Task<UserSettings> GetUserSettingsAsync(string userId)
    {
        var settings = await this.context.UserSettings
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (settings == null)
        {
            // Create default settings
            settings = new UserSettings
            {
                UserId = userId,
                Theme = "Classic Taco",
                DefaultEmoji = "🌮",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            this.context.UserSettings.Add(settings);
            await this.context.SaveChangesAsync();
        }

        return settings;
    }

    /// <inheritdoc/>
    public async Task<bool> UpdateUserSettingsAsync(string userId, string theme, string defaultEmoji)
    {
        var settings = await this.GetUserSettingsAsync(userId);

        settings.UpdateSettings(theme, defaultEmoji);

        try
        {
            await this.context.SaveChangesAsync();
            return true;
        }
        catch
        {
            return false;
        }
    }

    /// <inheritdoc/>
    public string[] GetAvailableThemes()
    {
        return UserSettings.AvailableThemes;
    }
}