using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Kanban.Server.Tests.Controllers;

/// <summary>
/// Integration tests for TaskController.
/// </summary>
public class TaskControllerTests : IClassFixture<CustomWebApplicationFactory<Kanban.Server.Program>>
{
    private readonly CustomWebApplicationFactory<Kanban.Server.Program> _factory;

    /// <summary>
    /// Initializes a new instance of the <see cref="TaskControllerTests"/> class.
    /// </summary>
    /// <param name="factory">The web application factory.</param>
    public TaskControllerTests(CustomWebApplicationFactory<Kanban.Server.Program> factory)
    {
        _factory = factory;
    }

    /// <summary>
    /// Tests creating a task.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    [Fact]
    public async Task CreateTask_ValidRequest_ReturnsCreatedWithId()
    {
        // Arrange
        var client = _factory.CreateClient();

        // First create a board and column
        var createBoardRequest = new { name = "Test Board" };
        var createBoardResponse = await client.PostAsJsonAsync("/api/board", createBoardRequest);
        Assert.Equal(HttpStatusCode.Created, createBoardResponse.StatusCode);
        var createBoardResult = await createBoardResponse.Content.ReadFromJsonAsync<CreateBoardResponse>();
        Assert.NotNull(createBoardResult);

        // Create a column
        var createColumnRequest = new { name = "To Do", order = 0 };
        var createColumnResponse = await client.PostAsJsonAsync($"/api/column/board/{createBoardResult.Id}", createColumnRequest);
        Assert.Equal(HttpStatusCode.Created, createColumnResponse.StatusCode);
        var createColumnResult = await createColumnResponse.Content.ReadFromJsonAsync<CreateColumnResponse>();
        Assert.NotNull(createColumnResult);

        var createTaskRequest = new
        {
            columnId = createColumnResult.Id,
            title = "Test Task",
            description = "Test Description",
            status = "To Do",
            priority = "High"
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/task", createTaskRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<CreateTaskResponse>();
        Assert.NotNull(result);
        Assert.True(result.Id > 0);
    }

    /// <summary>
    /// Tests getting tasks by column.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    [Fact]
    public async Task GetTasksByColumn_ReturnsOkWithTasksList()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Create a board and column
        var createBoardRequest = new { name = "Test Board" };
        var createBoardResponse = await client.PostAsJsonAsync("/api/board", createBoardRequest);
        Assert.Equal(HttpStatusCode.Created, createBoardResponse.StatusCode);
        var createBoardResult = await createBoardResponse.Content.ReadFromJsonAsync<CreateBoardResponse>();
        Assert.NotNull(createBoardResult);

        var createColumnRequest = new { name = "To Do", order = 0 };
        var createColumnResponse = await client.PostAsJsonAsync($"/api/column/board/{createBoardResult.Id}", createColumnRequest);
        Assert.Equal(HttpStatusCode.Created, createColumnResponse.StatusCode);
        var createColumnResult = await createColumnResponse.Content.ReadFromJsonAsync<CreateColumnResponse>();
        Assert.NotNull(createColumnResult);

        // Act
        var response = await client.GetAsync($"/api/task/column/{createColumnResult.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<List<TaskDto>>();
        Assert.NotNull(result);
    }

    /// <summary>
    /// Tests updating a task.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    [Fact]
    public async Task UpdateTask_ValidRequest_ReturnsOk()
    {
        // Arrange
        var client = _factory.CreateClient();

        // First create a task
        var createRequest = new
        {
            columnId = 1,
            title = "Original Task",
            description = "Original Description",
            status = "To Do",
            priority = "Medium"
        };
        var createResponse = await client.PostAsJsonAsync("/api/task", createRequest);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var createResult = await createResponse.Content.ReadFromJsonAsync<CreateTaskResponse>();
        Assert.NotNull(createResult);

        // Now update the task
        var updateRequest = new
        {
            title = "Updated Task",
            description = "Updated Description",
            status = "In Progress",
            priority = "High"
        };
        var response = await client.PutAsJsonAsync($"/api/task/{createResult.Id}", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    /// <summary>
    /// Tests deleting a task.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    [Fact]
    public async Task DeleteTask_ValidRequest_ReturnsNoContent()
    {
        // Arrange
        var client = _factory.CreateClient();

        // First create a task
        var createRequest = new
        {
            columnId = 1,
            title = "Task to Delete",
            description = "Will be deleted",
            status = "To Do",
            priority = "Low"
        };
        var createResponse = await client.PostAsJsonAsync("/api/task", createRequest);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var createResult = await createResponse.Content.ReadFromJsonAsync<CreateTaskResponse>();
        Assert.NotNull(createResult);

        // Now delete the task
        var response = await client.DeleteAsync($"/api/task/{createResult.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    /// <summary>
    /// Response model for creating a board.
    /// </summary>
    private class CreateBoardResponse
    {
        /// <summary>
        /// Gets or sets the board ID.
        /// </summary>
        public int Id { get; set; }
    }

    /// <summary>
    /// Response model for creating a column.
    /// </summary>
    private class CreateColumnResponse
    {
        /// <summary>
        /// Gets or sets the column ID.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the board ID.
        /// </summary>
        public int BoardId { get; set; }

        /// <summary>
        /// Gets or sets the column name.
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the column order.
        /// </summary>
        public int Order { get; set; }
    }

    /// <summary>
    /// Response model for creating a task.
    /// </summary>
    private class CreateTaskResponse
    {
        /// <summary>
        /// Gets or sets the task ID.
        /// </summary>
        public int Id { get; set; }
    }

    /// <summary>
    /// DTO for task.
    /// </summary>
    private class TaskDto
    {
        /// <summary>
        /// Gets or sets the task ID.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the task title.
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the task description.
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the task status.
        /// </summary>
        public string Status { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the task priority.
        /// </summary>
        public string Priority { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the column ID.
        /// </summary>
        public int ColumnId { get; set; }

        /// <summary>
        /// Gets or sets the order.
        /// </summary>
        public int Order { get; set; }
    }
}