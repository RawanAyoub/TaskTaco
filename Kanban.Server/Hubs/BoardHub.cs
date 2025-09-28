using Microsoft.AspNetCore.SignalR;

namespace Kanban.Server.Hubs;

/// <summary>
/// SignalR hub for real-time board updates.
/// </summary>
public class BoardHub : Hub
{
    /// <summary>
    /// Joins a board group for receiving updates.
    /// </summary>
    /// <param name="boardId">The board ID to join.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task JoinBoard(string boardId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Board_{boardId}");
    }

    /// <summary>
    /// Leaves a board group.
    /// </summary>
    /// <param name="boardId">The board ID to leave.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task LeaveBoard(string boardId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Board_{boardId}");
    }

    /// <summary>
    /// Called when a client disconnects.
    /// </summary>
    /// <param name="exception">The exception that caused the disconnect, if any.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}

/// <summary>
/// Interface for sending real-time updates to clients.
/// </summary>
public interface IBoardHubClient
{
    /// <summary>
    /// Notifies clients that a task has been moved.
    /// </summary>
    /// <param name="taskId">The ID of the moved task.</param>
    /// <param name="fromColumnId">The source column ID.</param>
    /// <param name="toColumnId">The destination column ID.</param>
    /// <param name="newOrder">The new order position.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task TaskMoved(int taskId, int fromColumnId, int toColumnId, int newOrder);

    /// <summary>
    /// Notifies clients that a task has been created.
    /// </summary>
    /// <param name="task">The created task.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task TaskCreated(object task);

    /// <summary>
    /// Notifies clients that a task has been updated.
    /// </summary>
    /// <param name="task">The updated task.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task TaskUpdated(object task);

    /// <summary>
    /// Notifies clients that a task has been deleted.
    /// </summary>
    /// <param name="taskId">The ID of the deleted task.</param>
    /// <param name="columnId">The column ID the task was in.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task TaskDeleted(int taskId, int columnId);

    /// <summary>
    /// Notifies clients that a column has been created.
    /// </summary>
    /// <param name="column">The created column.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ColumnCreated(object column);

    /// <summary>
    /// Notifies clients that a column has been updated.
    /// </summary>
    /// <param name="column">The updated column.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ColumnUpdated(object column);

    /// <summary>
    /// Notifies clients that a column has been deleted.
    /// </summary>
    /// <param name="columnId">The ID of the deleted column.</param>
    /// <param name="boardId">The board ID the column was in.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ColumnDeleted(int columnId, int boardId);
}