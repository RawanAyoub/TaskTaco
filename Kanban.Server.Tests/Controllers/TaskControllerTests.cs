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
    /// Tests moving a task between columns updates its location.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    [Fact]
    public async Task MoveTask_ValidRequest_MovesToAnotherColumn()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Create a board
        var createBoardResponse = await client.PostAsJsonAsync("/api/board", new { name = "Move Board" });
        Assert.Equal(HttpStatusCode.Created, createBoardResponse.StatusCode);
        var board = await createBoardResponse.Content.ReadFromJsonAsync<CreateBoardResponse>();
        Assert.NotNull(board);

        // Create two columns
        var col1Resp = await client.PostAsJsonAsync($"/api/column/board/{board.Id}", new { name = "To Do", order = 0 });
        var col2Resp = await client.PostAsJsonAsync($"/api/column/board/{board.Id}", new { name = "In Progress", order = 1 });
        Assert.Equal(HttpStatusCode.Created, col1Resp.StatusCode);
        Assert.Equal(HttpStatusCode.Created, col2Resp.StatusCode);
        var col1 = await col1Resp.Content.ReadFromJsonAsync<CreateColumnResponse>();
        var col2 = await col2Resp.Content.ReadFromJsonAsync<CreateColumnResponse>();
        Assert.NotNull(col1);
        Assert.NotNull(col2);

        // Create a task in the first column
        var createTaskResp = await client.PostAsJsonAsync("/api/task", new
        {
            columnId = col1!.Id,
            title = "Move Me",
            description = "Test move",
            status = "To Do",
            priority = "Medium"
        });
        Assert.Equal(HttpStatusCode.Created, createTaskResp.StatusCode);
        var task = await createTaskResp.Content.ReadFromJsonAsync<CreateTaskResponse>();
        Assert.NotNull(task);

        // Act: move to second column at order 0
        var moveResp = await client.PutAsJsonAsync($"/api/task/{task!.Id}/move", new { columnId = col2!.Id, order = 0 });
        Assert.Equal(HttpStatusCode.OK, moveResp.StatusCode);

        // Assert: should appear in second column
        var tasksInSecondColResp = await client.GetAsync($"/api/task/column/{col2!.Id}");
        Assert.Equal(HttpStatusCode.OK, tasksInSecondColResp.StatusCode);
        var tasksInSecondCol = await tasksInSecondColResp.Content.ReadFromJsonAsync<List<TaskDto>>();
        Assert.NotNull(tasksInSecondCol);
        Assert.Contains(tasksInSecondCol!, t => t.Id == task.Id);

        // And not in the first column
        var tasksInFirstColResp = await client.GetAsync($"/api/task/column/{col1!.Id}");
        Assert.Equal(HttpStatusCode.OK, tasksInFirstColResp.StatusCode);
        var tasksInFirstCol = await tasksInFirstColResp.Content.ReadFromJsonAsync<List<TaskDto>>();
        Assert.NotNull(tasksInFirstCol);
        Assert.DoesNotContain(tasksInFirstCol!, t => t.Id == task.Id);
    }

    /// <summary>
    /// Tests creating and retrieving a task with enhanced fields (labels, checklist, stickers).
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    [Fact]
    public async Task CreateTask_WithEnhancedFields_ReturnsTaskWithEnhancedFields()
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

        var createTaskRequest = new
        {
            columnId = createColumnResult.Id,
            title = "Enhanced Task",
            description = "Task with labels, checklist, and stickers",
            status = "To Do",
            priority = "High",
            dueDate = DateTime.UtcNow.AddDays(3).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            labels = new[] { "backend", "urgent", "feature" },
            checklist = new[]
            {
                new { id = "item1", text = "Design database schema", done = true },
                new { id = "item2", text = "Implement API endpoints", done = false },
                new { id = "item3", text = "Write unit tests", done = false }
            },
            stickers = new[] { "🔥", "⚡", "🚀" }
        };

        // Act - Create task
        var response = await client.PostAsJsonAsync("/api/task", createTaskRequest);

        // Assert creation
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<TaskResponse>();
        Assert.NotNull(result);
        Assert.True(result.Id > 0);
        Assert.Equal("Enhanced Task", result.Title);
        Assert.Equal("High", result.Priority);
        Assert.Contains("backend", result.Labels);
        Assert.Contains("urgent", result.Labels);
        Assert.Contains("feature", result.Labels);
        Assert.Equal(3, result.Checklist.Count);
        Assert.Contains(result.Checklist, item => item.Text == "Design database schema" && item.Done);
        Assert.Contains(result.Checklist, item => item.Text == "Implement API endpoints" && !item.Done);
        Assert.Contains("🔥", result.Stickers);
        Assert.Contains("⚡", result.Stickers);
        Assert.Contains("🚀", result.Stickers);

        // Act - Retrieve task by ID
        var getResponse = await client.GetAsync($"/api/task/{result.Id}");

        // Assert retrieval
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var retrievedTask = await getResponse.Content.ReadFromJsonAsync<TaskResponse>();
        Assert.NotNull(retrievedTask);
        Assert.Equal(result.Id, retrievedTask.Id);
        Assert.Equal("Enhanced Task", retrievedTask.Title);
        Assert.Equal("High", retrievedTask.Priority);
        Assert.Equal(result.Labels, retrievedTask.Labels);
        Assert.Equal(result.Checklist.Count, retrievedTask.Checklist.Count);
        Assert.Equal(result.Stickers, retrievedTask.Stickers);
    }

    /// <summary>
    /// Tests updating a task with enhanced fields.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    [Fact]
    public async Task UpdateTask_WithEnhancedFields_UpdatesSuccessfully()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Create a task first
        var createRequest = new
        {
            columnId = 1,
            title = "Original Task",
            description = "Original Description",
            status = "To Do",
            priority = "Medium",
            labels = new[] { "original" },
            checklist = new[] { new { id = "orig1", text = "Original item", done = false } },
            stickers = new[] { "📝" }
        };
        var createResponse = await client.PostAsJsonAsync("/api/task", createRequest);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var createResult = await createResponse.Content.ReadFromJsonAsync<CreateTaskResponse>();
        Assert.NotNull(createResult);

        // Now update the task with enhanced fields
        var updateRequest = new
        {
            title = "Updated Enhanced Task",
            description = "Updated with enhanced fields",
            status = "In Progress",
            priority = "High",
            dueDate = DateTime.UtcNow.AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            labels = new[] { "updated", "backend", "urgent" },
            checklist = new[]
            {
                new { id = "new1", text = "New checklist item", done = true },
                new { id = "new2", text = "Another item", done = false }
            },
            stickers = new[] { "🔥", "⚡" }
        };

        // Act
        var response = await client.PutAsJsonAsync($"/api/task/{createResult.Id}", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        // Verify the update by retrieving the task
        var getResponse = await client.GetAsync($"/api/task/{createResult.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var updatedTask = await getResponse.Content.ReadFromJsonAsync<TaskResponse>();
        Assert.NotNull(updatedTask);
        Assert.Equal("Updated Enhanced Task", updatedTask.Title);
        Assert.Equal("High", updatedTask.Priority);
        Assert.Contains("updated", updatedTask.Labels);
        Assert.Contains("backend", updatedTask.Labels);
        Assert.Contains("urgent", updatedTask.Labels);
        Assert.Equal(2, updatedTask.Checklist.Count);
        Assert.Contains(updatedTask.Checklist, item => item.Text == "New checklist item" && item.Done);
        Assert.Contains("🔥", updatedTask.Stickers);
        Assert.Contains("⚡", updatedTask.Stickers);
    }

    /// <summary>
    /// Response model for task operations.
    /// </summary>
    private class TaskResponse
    {
        /// <summary>
        /// Gets or sets the task ID.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the column ID.
        /// </summary>
        public int ColumnId { get; set; }

        /// <summary>
        /// Gets or sets the task title.
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the task description.
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the task priority.
        /// </summary>
        public string Priority { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the task status.
        /// </summary>
        public string Status { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the due date.
        /// </summary>
        public string? DueDate { get; set; }

        /// <summary>
        /// Gets or sets the labels.
        /// </summary>
        public List<string> Labels { get; set; } = new();

        /// <summary>
        /// Gets or sets the checklist items.
        /// </summary>
        public List<ChecklistItemResponse> Checklist { get; set; } = new();

        /// <summary>
        /// Gets or sets the stickers.
        /// </summary>
        public List<string> Stickers { get; set; } = new();

        /// <summary>
        /// Gets or sets the order.
        /// </summary>
        public int Order { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the task is overdue.
        /// </summary>
        public bool IsOverdue { get; set; }
    }

    /// <summary>
    /// Response model for checklist items.
    /// </summary>
    private class ChecklistItemResponse
    {
        /// <summary>
        /// Gets or sets the checklist item ID.
        /// </summary>
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the checklist item text.
        /// </summary>
        public string Text { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets a value indicating whether the item is done.
        /// </summary>
        public bool Done { get; set; }
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