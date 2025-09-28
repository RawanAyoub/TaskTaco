using Kanban.Domain.Entities;
using Xunit;

namespace Kanban.Server.Tests.Domain;

public class ColumnTests
{
    [Fact]
    public void Column_CanBeCreated_WithValidData()
    {
        // Arrange & Act
        var column = new Column
        {
            Id = 1,
            Name = "To Do",
            BoardId = 1,
            Order = 0
        };

        // Assert
        Assert.Equal(1, column.Id);
        Assert.Equal("To Do", column.Name);
        Assert.Equal(1, column.BoardId);
        Assert.Equal(0, column.Order);
    }
}