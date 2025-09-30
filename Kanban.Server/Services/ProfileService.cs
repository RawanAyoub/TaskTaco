namespace Kanban.Server.Services
{
    using System.IO;
    using Kanban.Domain.Entities;
    using Kanban.Infrastructure;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Identity;

    /// <summary>
    /// Service for managing user profile pictures and related operations.
    /// </summary>
    public class ProfileService : IProfileService
    {
        private readonly KanbanDbContext context;
        private readonly UserManager<User> userManager;
        private readonly IWebHostEnvironment environment;
        private readonly string uploadsPath = "uploads/profiles";

        /// <summary>
        /// Initializes a new instance of the <see cref="ProfileService"/> class.
        /// </summary>
        /// <param name="context">The database context.</param>
        /// <param name="userManager">The user manager.</param>
        /// <param name="environment">The web host environment.</param>
        public ProfileService(KanbanDbContext context, UserManager<User> userManager, IWebHostEnvironment environment)
        {
            this.context = context;
            this.userManager = userManager;
            this.environment = environment;
        }

    /// <inheritdoc/>
        public async Task<string> UploadProfilePictureAsync(string userId, IFormFile file)
        {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is required", nameof(file));
        }

        // Validate file type
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(fileExtension))
        {
            throw new ArgumentException("Invalid file type. Only JPG, PNG, and GIF files are allowed.", nameof(file));
        }

        // Validate file size (max 5MB)
        const long maxFileSize = 5 * 1024 * 1024; // 5MB
        if (file.Length > maxFileSize)
        {
            throw new ArgumentException("File size exceeds the maximum allowed size of 5MB.", nameof(file));
        }

        var user = await this.userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new ArgumentException("User not found", nameof(userId));
        }

        // Create uploads directory if it doesn't exist
        var uploadsDir = Path.Combine(this.environment.WebRootPath ?? this.environment.ContentRootPath, this.uploadsPath);
        Directory.CreateDirectory(uploadsDir);

        // Generate unique filename
        var fileName = $"{userId}_{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(uploadsDir, fileName);

        // Delete existing profile picture if it exists
        if (!string.IsNullOrEmpty(user.ProfilePicture))
        {
            this.DeleteExistingProfilePictureAsync(user.ProfilePicture);
        }

        // Save the new file
        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        // Update user profile
        var relativePath = Path.Combine(this.uploadsPath, fileName).Replace("\\", "/");
        user.ProfilePicture = relativePath;
        await this.userManager.UpdateAsync(user);

            return relativePath;
        }

    /// <inheritdoc/>
        public async Task<bool> DeleteProfilePictureAsync(string userId)
        {
        var user = await this.userManager.FindByIdAsync(userId);
        if (user == null || string.IsNullOrEmpty(user.ProfilePicture))
        {
            return false;
        }

        // Delete the file
    var deleted = this.DeleteExistingProfilePictureAsync(user.ProfilePicture);

        // Update user profile
        user.ProfilePicture = null;
        await this.userManager.UpdateAsync(user);

            return deleted;
        }

        /// <inheritdoc/>
        public async Task<string?> GetProfilePicturePathAsync(string userId)
        {
            var user = await this.userManager.FindByIdAsync(userId);
            return user?.ProfilePicture;
        }

        private bool DeleteExistingProfilePictureAsync(string profilePicturePath)
        {
            try
            {
                var fullPath = Path.Combine(this.environment.WebRootPath ?? this.environment.ContentRootPath, profilePicturePath);
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    return true;
                }
            }
            catch (Exception)
            {
                // Log error but don't throw - file deletion failure shouldn't break the operation
            }

            return false;
        }
    }
}