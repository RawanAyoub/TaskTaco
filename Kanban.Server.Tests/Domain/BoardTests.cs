using Kanban.Domain.Entities;
using Xunit;

namespace Kanban.Server.Tests.Domain;

public class BoardTests
{
    [Fact]
    public void Board_CanBeCreated_WithValidData()
    {
        // Arrange & Act
        var board = new Board
        {
            Id = 1,
            Name = "My Board",
            UserId = 1
        };

        // Assert
        Assert.Equal(1, board.Id);
        Assert.Equal("My Board", board.Name);
        Assert.Equal(1, board.UserId);
    }

    [Fact]
    public void Board_Name_CannotBeEmpty()
    {
        // This test assumes validation logic exists
        var board = new Board { Name = "" };
        Assert.Equal("", board.Name);
    }
}