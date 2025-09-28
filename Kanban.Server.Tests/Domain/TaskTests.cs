using Kanban.Domain.Entities;
using Xunit;

namespace Kanban.Server.Tests.Domain;

public class TaskTests
{
    [Fact]
    public void Task_CanBeCreated_WithValidData()
    {
        // Arrange & Act
        var task = new Task
        {
            Id = 1,
            Title = "Implement login",
            Description = "Add user authentication",
            Status = "To Do",
            Priority = "High",
            DueDate = DateTime.Now.AddDays(7),
            Tags = "backend,auth",
            Attachments = "",
            ColumnId = 1,
            Order = 0
        };

        // Assert
        Assert.Equal(1, task.Id);
        Assert.Equal("Implement login", task.Title);
        Assert.Equal("Add user authentication", task.Description);
        Assert.Equal("To Do", task.Status);
        Assert.Equal("High", task.Priority);
        Assert.Equal(1, task.ColumnId);
        Assert.Equal(0, task.Order);
    }

    [Fact]
    public void Task_DueDate_CanBeNull()
    {
        // Arrange & Act
        var task = new Task
        {
            Title = "Test Task",
            DueDate = null
        };

        // Assert
        Assert.Null(task.DueDate);
    }
}