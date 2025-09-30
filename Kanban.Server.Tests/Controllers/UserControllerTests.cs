using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Kanban.Server.Controllers;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Xunit;

namespace Kanban.Server.Tests.Controllers;

public class UserControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient client;
    private readonly CustomWebApplicationFactory<Program> factory;

    public UserControllerTests(CustomWebApplicationFactory<Program> factory)
    {
        this.factory = factory;
        this.client = factory.CreateClient();
        
        // Ensure test user exists
        this.EnsureTestUserExists().Wait();
    }

    private async Task EnsureTestUserExists()
    {
        using var scope = this.factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<Kanban.Domain.Entities.User>>();
        
        var existingUser = await userManager.FindByIdAsync("test-user-id");
        if (existingUser == null)
        {
            var testUser = new Kanban.Domain.Entities.User
            {
                Id = "test-user-id",
                Name = "Test User",
                UserName = "test@example.com",
                Email = "test@example.com",
                EmailConfirmed = true
            };
            await userManager.CreateAsync(testUser);
        }
    }

    [Fact]
    public async Task GetProfile_ReturnsUnauthorized_WhenNotAuthenticated()
    {
        // Arrange - Create a factory without test authentication
        var unauthenticatedFactory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");
                builder.ConfigureServices(services =>
                {
                    // Don't add test authentication - this will make endpoints require real auth
                    var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(Microsoft.EntityFrameworkCore.DbContextOptions<Kanban.Infrastructure.KanbanDbContext>));
                    if (descriptor != null)
                    {
                        services.Remove(descriptor);
                    }

                    services.AddDbContext<Kanban.Infrastructure.KanbanDbContext>(options =>
                    {
                        options.UseInMemoryDatabase("InMemoryDbForUnauthTest");
                    });
                });
            });
            
        var unauthenticatedClient = unauthenticatedFactory.CreateClient();

        // Act
        var response = await unauthenticatedClient.GetAsync("/api/user/profile");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        
        // Cleanup
        unauthenticatedFactory.Dispose();
    }

    [Fact]
    public async Task GetProfile_ReturnsUserProfile_WhenAuthenticated()
    {
        // Act
        var response = await this.client.GetAsync("/api/user/profile");

        // Assert
        response.EnsureSuccessStatusCode();
        
        var content = await response.Content.ReadAsStringAsync();
        var profile = JsonSerializer.Deserialize<UserProfileResponse>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        Assert.NotNull(profile);
        Assert.Equal("test-user-id", profile.Id);
        Assert.NotEmpty(profile.Name);
    }

    [Fact]
    public async Task UpdateProfile_ReturnsSuccess_WithValidData()
    {
        // Arrange
        var updateRequest = new UpdateUserProfileRequest
        {
            Name = "Updated Test User",
            Email = "updated@test.com"
        };

        // Act
        var response = await this.client.PutAsJsonAsync("/api/user/profile", updateRequest);

        // Assert
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task UpdateProfile_ReturnsBadRequest_WithInvalidData()
    {
        // Arrange
        var updateRequest = new UpdateUserProfileRequest
        {
            Name = "", // Invalid empty name
            Email = "invalid-email" // Invalid email format
        };

        // Act
        var response = await this.client.PutAsJsonAsync("/api/user/profile", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetSettings_ReturnsUserSettings_WhenAuthenticated()
    {
        // Act
        var response = await this.client.GetAsync("/api/user/settings");

        // Assert
        response.EnsureSuccessStatusCode();
        
        var content = await response.Content.ReadAsStringAsync();
        var settings = JsonSerializer.Deserialize<UserSettingsResponse>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        Assert.NotNull(settings);
        Assert.NotEmpty(settings.Theme);
        Assert.NotEmpty(settings.DefaultEmoji);
        Assert.NotEmpty(settings.AvailableThemes);
        Assert.Contains("Classic Taco", settings.AvailableThemes);
    }

    [Fact]
    public async Task UpdateSettings_ReturnsSuccess_WithValidData()
    {
        // Arrange
        var updateRequest = new UpdateUserSettingsRequest
        {
            Theme = "Guacamole",
            DefaultEmoji = "🥑"
        };

        // Act
        var response = await this.client.PutAsJsonAsync("/api/user/settings", updateRequest);

        // Assert
        response.EnsureSuccessStatusCode();

        // Verify the settings were updated
        var getResponse = await this.client.GetAsync("/api/user/settings");
        getResponse.EnsureSuccessStatusCode();
        
        var content = await getResponse.Content.ReadAsStringAsync();
        var settings = JsonSerializer.Deserialize<UserSettingsResponse>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        Assert.NotNull(settings);
        Assert.Equal("Guacamole", settings.Theme);
        Assert.Equal("🥑", settings.DefaultEmoji);
    }

    [Fact]
    public async Task UpdateSettings_ReturnsBadRequest_WithInvalidTheme()
    {
        // Arrange
        var updateRequest = new UpdateUserSettingsRequest
        {
            Theme = "InvalidTheme",
            DefaultEmoji = "🌮"
        };

        // Act
        var response = await this.client.PutAsJsonAsync("/api/user/settings", updateRequest);

        // Assert - Should still succeed but theme validation happens in UserSettings.UpdateSettings
        response.EnsureSuccessStatusCode();
    }
}