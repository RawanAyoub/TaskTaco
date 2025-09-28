using Kanban.Application.Services;
using Kanban.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Kanban.Server.Controllers;

/// <summary>
/// Controller for managing tasks.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class TaskController : ControllerBase
{
    private readonly ITaskService taskService;

    /// <summary>
    /// Initializes a new instance of the <see cref="TaskController"/> class.
    /// </summary>
    /// <param name="taskService">The task service.</param>
    public TaskController(ITaskService taskService)
    {
        this.taskService = taskService;
    }

    /// <summary>
    /// Gets all tasks for a specific column.
    /// </summary>
    /// <param name="columnId">The column ID.</param>
    /// <returns>A list of tasks.</returns>
    [HttpGet("column/{columnId}")]
    public async Task<IActionResult> GetTasksByColumn(int columnId)
    {
        var tasks = await this.taskService.GetTasksByColumnAsync(columnId);
        return this.Ok(tasks);
    }

    /// <summary>
    /// Gets a task by ID.
    /// </summary>
    /// <param name="id">The task ID.</param>
    /// <returns>The task.</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetTask(int id)
    {
        var task = await this.taskService.GetTaskByIdAsync(id);
        if (task == null)
        {
            return this.NotFound();
        }

        return this.Ok(task);
    }

    /// <summary>
    /// Creates a new task.
    /// </summary>
    /// <param name="request">The create task request.</param>
    /// <returns>The created task.</returns>
    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequest request)
    {
        var task = await this.taskService.CreateTaskAsync(
            request.ColumnId,
            request.Title,
            request.Description,
            request.Status,
            request.Priority);

        return this.CreatedAtAction(nameof(this.GetTask), new { id = task.Id }, task);
    }

    /// <summary>
    /// Updates a task.
    /// </summary>
    /// <param name="id">The task ID.</param>
    /// <param name="request">The update task request.</param>
    /// <returns>OK if successful.</returns>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskRequest request)
    {
        var success = await this.taskService.UpdateTaskAsync(
            id,
            request.Title,
            request.Description,
            request.Status,
            request.Priority);

        if (!success)
        {
            return this.NotFound();
        }

        return this.Ok();
    }

    /// <summary>
    /// Moves a task to a different column and position.
    /// </summary>
    /// <param name="id">The task ID.</param>
    /// <param name="request">The move task request.</param>
    /// <returns>OK if successful.</returns>
    [HttpPut("{id}/move")]
    public async Task<IActionResult> MoveTask(int id, [FromBody] MoveTaskRequest request)
    {
        var success = await this.taskService.MoveTaskAsync(id, request.ColumnId, request.Order);
        if (!success)
        {
            return this.NotFound();
        }

        return this.Ok();
    }

    /// <summary>
    /// Deletes a task.
    /// </summary>
    /// <param name="id">The task ID.</param>
    /// <returns>No content if successful.</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var success = await this.taskService.DeleteTaskAsync(id);
        if (!success)
        {
            return this.NotFound();
        }

        return this.NoContent();
    }
}

/// <summary>
/// Request model for creating a task.
/// </summary>
public class CreateTaskRequest
{
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
    /// Gets or sets the task status.
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the task priority.
    /// </summary>
    public string Priority { get; set; } = string.Empty;
}

/// <summary>
    /// Request model for updating a task.
/// </summary>
public class UpdateTaskRequest
{
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
}

/// <summary>
    /// Request model for moving a task.
/// </summary>
public class MoveTaskRequest
{
    /// <summary>
    /// Gets or sets the column ID.
    /// </summary>
    public int ColumnId { get; set; }

    /// <summary>
    /// Gets or sets the order position.
    /// </summary>
    public int Order { get; set; }
}