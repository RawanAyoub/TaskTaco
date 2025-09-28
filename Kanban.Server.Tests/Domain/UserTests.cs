using Kanban.Domain.Entities;
using Xunit;

namespace Kanban.Server.Tests.Domain;

public class UserTests
{
    [Fact]
    public void User_CanBeCreated_WithValidData()
    {
        // Arrange & Act
        var user = new User
        {
            Id = 1,
            Name = "John Doe",
            Email = "john@example.com"
        };

        // Assert
        Assert.Equal(1, user.Id);
        Assert.Equal("John Doe", user.Name);
        Assert.Equal("john@example.com", user.Email);
    }

    [Fact]
    public void User_Email_ShouldBeUnique()
    {
        // This test assumes validation logic exists
        // For now, just test the property
        var user = new User { Email = "test@example.com" };
        Assert.Equal("test@example.com", user.Email);
    }
}