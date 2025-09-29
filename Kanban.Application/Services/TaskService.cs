using Kanban.Domain.Entities;
using Kanban.Domain.Enums;
using Kanban.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Kanban.Application.Services
{
    using TaskEntity = Kanban.Domain.Entities.Task;

    /// <summary>
    /// Interface for task-related operations.
    /// </summary>
    public interface ITaskService
    {
        /// <summary>
        /// Gets all tasks for a specific column asynchronously.
        /// </summary>
        /// <param name="columnId">The column ID.</param>
        /// <returns>A collection of tasks.</returns>
        Task<IEnumerable<TaskEntity>> GetTasksByColumnAsync(int columnId);

        /// <summary>
        /// Gets a task by its ID asynchronously.
        /// </summary>
        /// <param name="id">The task ID.</param>
        /// <returns>The task if found, otherwise null.</returns>
        Task<TaskEntity?> GetTaskByIdAsync(int id);

        /// <summary>
        /// Creates a new task asynchronously.
        /// </summary>
        /// <param name="columnId">The column ID to add the task to.</param>
        /// <param name="title">The task title.</param>
        /// <param name="description">The task description.</param>
        /// <param name="status">The task status.</param>
        /// <param name="priority">The task priority.</param>
        /// <returns>The created task.</returns>
        Task<TaskEntity> CreateTaskAsync(int columnId, string title, string description, string status, Priority priority);

    /// <summary>
        /// <summary>
        /// Updates a task asynchronously.
        /// </summary>
        /// <param name="id">The task ID.</param>
        /// <param name="title">The new title.</param>
        /// <param name="description">The new description.</param>
        /// <param name="status">The new status.</param>
        /// <param name="priority">The new priority.</param>
        /// <returns>True if the update was successful, otherwise false.</returns>
        Task<bool> UpdateTaskAsync(int id, string title, string description, string status, Priority priority);

        /// <summary>
        /// Moves a task to a different column and position asynchronously.
        /// </summary>
        /// <param name="id">The task ID.</param>
        /// <param name="newColumnId">The new column ID.</param>
        /// <param name="newOrder">The new order position.</param>
        /// <returns>True if the move was successful, otherwise false.</returns>
        Task<bool> MoveTaskAsync(int id, int newColumnId, int newOrder);

        /// <summary>
        /// Deletes a task asynchronously.
        /// </summary>
        /// <param name="id">The task ID.</param>
        /// <returns>True if the deletion was successful, otherwise false.</returns>
        Task<bool> DeleteTaskAsync(int id);
    }

/// <summary>
/// Service for managing tasks.
/// </summary>
public class TaskService : ITaskService
{
    private readonly KanbanDbContext context;

    /// <summary>
    /// Initializes a new instance of the <see cref="TaskService"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public TaskService(KanbanDbContext context)
    {
        this.context = context;
    }

    /// <summary>
    /// Gets all tasks for a specific column asynchronously.
    /// </summary>
    /// <param name="columnId">The column ID.</param>
    /// <returns>A collection of tasks.</returns>
    public async Task<IEnumerable<TaskEntity>> GetTasksByColumnAsync(int columnId)
    {
        var tasks = await this.context.Tasks
            .Where(t => t.ColumnId == columnId)
            .OrderBy(t => t.Order)
            .ToListAsync();
        
        // Fix any tasks with null DateTime values
        bool hasUpdates = false;
        foreach (var task in tasks)
        {
            if (!task.CreatedAt.HasValue)
            {
                task.CreatedAt = DateTime.UtcNow;
                hasUpdates = true;
            }
            if (!task.UpdatedAt.HasValue)
            {
                task.UpdatedAt = DateTime.UtcNow;
                hasUpdates = true;
            }
        }
        
        if (hasUpdates)
        {
            await this.context.SaveChangesAsync();
        }
        
        return tasks;
    }

    /// <summary>
    /// Gets a task by its ID asynchronously.
    /// </summary>
    /// <param name="id">The task ID.</param>
    /// <returns>The task if found, otherwise null.</returns>
    public async Task<TaskEntity?> GetTaskByIdAsync(int id)
    {
        return await this.context.Tasks
            .Include(t => t.Column)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    /// <summary>
    /// Creates a new task asynchronously.
    /// </summary>
    /// <param name="columnId">The column ID to add the task to.</param>
    /// <param name="title">The task title.</param>
    /// <param name="description">The task description.</param>
    /// <param name="status">The task status.</param>
    /// <param name="priority">The task priority.</param>
    /// <returns>The created task.</returns>
    public async Task<TaskEntity> CreateTaskAsync(int columnId, string title, string description, string status, Priority priority)
    {
        // Get the next order position for the column
        var maxOrder = await this.context.Tasks
            .Where(t => t.ColumnId == columnId)
            .MaxAsync(t => (int?)t.Order) ?? -1;

        var task = new TaskEntity
        {
            Title = title,
            Description = description,
            Status = status,
            Priority = priority,
            ColumnId = columnId,
            Order = maxOrder + 1,
        };

        this.context.Tasks.Add(task);
        await this.context.SaveChangesAsync();
        return task;
    }

    /// <summary>
    /// Updates a task asynchronously.
    /// </summary>
    /// <param name="id">The task ID.</param>
    /// <param name="title">The new title.</param>
    /// <param name="description">The new description.</param>
    /// <param name="status">The new status.</param>
    /// <param name="priority">The new priority.</param>
    /// <returns>True if the update was successful, otherwise false.</returns>
    public async Task<bool> UpdateTaskAsync(int id, string title, string description, string status, Priority priority)
    {
        var task = await this.context.Tasks.FindAsync(id);
        if (task == null)
        {
            return false;
        }

        task.Title = title;
        task.Description = description;
        task.Status = status;
        task.Priority = priority;

        await this.context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Moves a task to a different column and position asynchronously.
    /// </summary>
    /// <param name="id">The task ID.</param>
    /// <param name="newColumnId">The new column ID.</param>
    /// <param name="newOrder">The new order position.</param>
    /// <returns>True if the move was successful, otherwise false.</returns>
    public async Task<bool> MoveTaskAsync(int id, int newColumnId, int newOrder)
    {
        var task = await this.context.Tasks.FindAsync(id);
        if (task == null)
        {
            return false;
        }

        // If moving to same column, just reorder
        if (task.ColumnId == newColumnId)
        {
            // Reorder tasks in the same column
            var tasksInColumn = await this.context.Tasks
                .Where(t => t.ColumnId == newColumnId && t.Id != id)
                .OrderBy(t => t.Order)
                .ToListAsync();

            tasksInColumn.Insert(newOrder, task);

            for (int i = 0; i < tasksInColumn.Count; i++)
            {
                tasksInColumn[i].Order = i;
            }
        }
        else
        {
            // Moving to different column
            task.ColumnId = newColumnId;
            task.Order = newOrder;

            // Reorder tasks in the new column
            var tasksInNewColumn = await this.context.Tasks
                .Where(t => t.ColumnId == newColumnId && t.Id != id)
                .OrderBy(t => t.Order)
                .ToListAsync();

            tasksInNewColumn.Insert(newOrder, task);

            for (int i = 0; i < tasksInNewColumn.Count; i++)
            {
                tasksInNewColumn[i].Order = i;
            }

            // Reorder tasks in the old column
            var tasksInOldColumn = await this.context.Tasks
                .Where(t => t.ColumnId == task.ColumnId && t.Id != id)
                .OrderBy(t => t.Order)
                .ToListAsync();

            for (int i = 0; i < tasksInOldColumn.Count; i++)
            {
                tasksInOldColumn[i].Order = i;
            }
        }

        await this.context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Deletes a task asynchronously.
    /// </summary>
    /// <param name="id">The task ID.</param>
    /// <returns>True if the deletion was successful, otherwise false.</returns>
    public async Task<bool> DeleteTaskAsync(int id)
    {
        var task = await this.context.Tasks.FindAsync(id);
        if (task == null)
        {
            return false;
        }

        this.context.Tasks.Remove(task);

        // Reorder remaining tasks in the column
        var tasksInColumn = await this.context.Tasks
            .Where(t => t.ColumnId == task.ColumnId && t.Id != id)
            .OrderBy(t => t.Order)
            .ToListAsync();

        for (int i = 0; i < tasksInColumn.Count; i++)
        {
            tasksInColumn[i].Order = i;
        }

        await this.context.SaveChangesAsync();
        return true;
    }
}
}