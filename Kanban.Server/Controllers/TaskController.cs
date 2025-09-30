using Kanban.Application.Services;
using Kanban.Domain.Entities;
using Kanban.Domain.Enums;
using Kanban.Domain.ValueObjects;
using Microsoft.AspNetCore.Mvc;

namespace Kanban.Server.Controllers;

/// <summary>
/// Request model for checklist item data.
/// </summary>
public class ChecklistItemRequest
{
    /// <summary>
    /// Gets or sets the unique identifier for the checklist item.
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the text content of the checklist item.
    /// </summary>
    public string Text { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether the checklist item is completed.
    /// </summary>
    public bool Done { get; set; }
}

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
        var taskResponses = tasks.Select(this.MapTaskToResponse);
        return this.Ok(taskResponses);
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

        var taskResponse = this.MapTaskToResponse(task);
        return this.Ok(taskResponse);
    }

    /// <summary>
    /// Creates a new task.
    /// </summary>
    /// <param name="request">The create task request.</param>
    /// <returns>The created task.</returns>
    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequest request)
    {
        // Parse priority from string to enum
        if (!Enum.TryParse<Priority>(request.Priority, true, out var priority))
        {
            priority = Priority.Medium; // Default to Medium if parsing fails
        }

        // Convert checklist items from request to domain objects
        var checklist = request.Checklist?.Select(item =>
            new ChecklistItem(item.Id, item.Text, item.Done)).ToList();

        var task = await this.taskService.CreateTaskAsync(
            request.ColumnId,
            request.Title,
            request.Description,
            request.Status,
            priority,
            request.DueDate,
            request.Labels,
            checklist,
            request.Stickers);

        var taskResponse = this.MapTaskToResponse(task);
        return this.CreatedAtAction(nameof(this.GetTask), new { id = task.Id }, taskResponse);
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
        // Parse priority from string to enum
        if (!Enum.TryParse<Priority>(request.Priority, true, out var priority))
        {
            priority = Priority.Medium; // Default to Medium if parsing fails
        }

        // Convert checklist items from request to domain objects
        var checklist = request.Checklist?.Select(item =>
            new ChecklistItem(item.Id, item.Text, item.Done)).ToList();

        var success = await this.taskService.UpdateTaskAsync(
            id,
            request.Title,
            request.Description,
            request.Status,
            priority,
            request.DueDate,
            request.Labels,
            checklist,
            request.Stickers);

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

    /// <summary>
    /// Maps a Task entity to a response object with properly deserialized enhanced fields.
    /// </summary>
    /// <param name="task">The task entity.</param>
    /// <returns>A task response object.</returns>
    private object MapTaskToResponse(Kanban.Domain.Entities.Task task)
    {
        return new
        {
            id = task.Id,
            columnId = task.ColumnId,
            title = task.Title,
            description = task.Description,
            priority = task.Priority.ToString(),
            status = task.Status,
            dueDate = task.DueDate?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            labels = task.GetLabels(),
            checklist = task.GetChecklist(),
            stickers = task.GetStickers(),
            createdAt = task.CreatedAt?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            updatedAt = task.UpdatedAt?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            order = task.Order,
            isOverdue = task.DueDate.HasValue && task.DueDate.Value < DateTime.UtcNow
        };
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

    /// <summary>
    /// Gets or sets the due date of the task.
    /// </summary>
    public DateTime? DueDate { get; set; }

    /// <summary>
    /// Gets or sets the labels associated with the task.
    /// </summary>
    public List<string>? Labels { get; set; }

    /// <summary>
    /// Gets or sets the checklist items for the task.
    /// </summary>
    public List<ChecklistItemRequest>? Checklist { get; set; }

    /// <summary>
    /// Gets or sets the sticker emojis for the task.
    /// </summary>
    public List<string>? Stickers { get; set; }
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

    /// <summary>
    /// Gets or sets the due date of the task.
    /// </summary>
    public DateTime? DueDate { get; set; }

    /// <summary>
    /// Gets or sets the labels associated with the task.
    /// </summary>
    public List<string>? Labels { get; set; }

    /// <summary>
    /// Gets or sets the checklist items for the task.
    /// </summary>
    public List<ChecklistItemRequest>? Checklist { get; set; }

    /// <summary>
    /// Gets or sets the sticker emojis for the task.
    /// </summary>
    public List<string>? Stickers { get; set; }
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