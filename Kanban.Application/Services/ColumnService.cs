using Kanban.Domain.Entities;
using Kanban.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Kanban.Application.Services;

using ColumnEntity = Kanban.Domain.Entities.Column;

/// <summary>
/// Interface for column-related operations.
/// </summary>
public interface IColumnService
{
    /// <summary>
    /// Gets all columns for a specific board asynchronously.
    /// </summary>
    /// <param name="boardId">The board ID.</param>
    /// <returns>A collection of columns.</returns>
    Task<IEnumerable<ColumnEntity>> GetColumnsByBoardAsync(int boardId);

    /// <summary>
    /// Gets a column by its ID asynchronously.
    /// </summary>
    /// <param name="id">The column ID.</param>
    /// <returns>The column if found, otherwise null.</returns>
    Task<ColumnEntity?> GetColumnByIdAsync(int id);

    /// <summary>
    /// Creates a new column asynchronously.
    /// </summary>
    /// <param name="boardId">The board ID to add the column to.</param>
    /// <param name="name">The column name.</param>
    /// <param name="order">The column order position.</param>
    /// <returns>The created column.</returns>
    Task<ColumnEntity> CreateColumnAsync(int boardId, string name, int order);

    /// <summary>
    /// Updates a column asynchronously.
    /// </summary>
    /// <param name="id">The column ID.</param>
    /// <param name="name">The new name.</param>
    /// <param name="order">The new order position.</param>
    /// <returns>True if the update was successful, otherwise false.</returns>
    Task<bool> UpdateColumnAsync(int id, string name, int order);

    /// <summary>
    /// Moves a column to a different position asynchronously.
    /// </summary>
    /// <param name="id">The column ID.</param>
    /// <param name="newOrder">The new order position.</param>
    /// <returns>True if the move was successful, otherwise false.</returns>
    Task<bool> MoveColumnAsync(int id, int newOrder);

    /// <summary>
    /// Deletes a column asynchronously.
    /// </summary>
    /// <param name="id">The column ID.</param>
    /// <returns>True if the deletion was successful, otherwise false.</returns>
    Task<bool> DeleteColumnAsync(int id);
}

/// <summary>
/// Service for managing columns.
/// </summary>
public class ColumnService : IColumnService
{
    private readonly KanbanDbContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="ColumnService"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public ColumnService(KanbanDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets all columns for a specific board asynchronously.
    /// </summary>
    /// <param name="boardId">The board ID.</param>
    /// <returns>A collection of columns.</returns>
    public async Task<IEnumerable<ColumnEntity>> GetColumnsByBoardAsync(int boardId)
    {
        return await _context.Columns
            .Where(c => c.BoardId == boardId)
            .OrderBy(c => c.Order)
            .ToListAsync();
    }

    /// <summary>
    /// Gets a column by its ID asynchronously.
    /// </summary>
    /// <param name="id">The column ID.</param>
    /// <returns>The column if found, otherwise null.</returns>
    public async Task<ColumnEntity?> GetColumnByIdAsync(int id)
    {
        return await _context.Columns.FindAsync(id);
    }

    /// <summary>
    /// Creates a new column asynchronously.
    /// </summary>
    /// <param name="boardId">The board ID to add the column to.</param>
    /// <param name="name">The column name.</param>
    /// <param name="order">The column order position.</param>
    /// <returns>The created column.</returns>
    public async Task<ColumnEntity> CreateColumnAsync(int boardId, string name, int order)
    {
        // Check if a column with the same name already exists in this board
        var existingColumn = await _context.Columns
            .FirstOrDefaultAsync(c => c.BoardId == boardId && c.Name == name);

        if (existingColumn != null)
        {
            throw new InvalidOperationException($"A column with the name '{name}' already exists in this board.");
        }

        // Shift existing columns to make room for the new one
        var columnsToShift = await _context.Columns
            .Where(c => c.BoardId == boardId && c.Order >= order)
            .ToListAsync();

        foreach (var column in columnsToShift)
        {
            column.Order++;
        }

        var newColumn = new ColumnEntity
        {
            BoardId = boardId,
            Name = name,
            Order = order,
        };

        _context.Columns.Add(newColumn);
        await _context.SaveChangesAsync();

        return newColumn;
    }

    /// <summary>
    /// Updates a column asynchronously.
    /// </summary>
    /// <param name="id">The column ID.</param>
    /// <param name="name">The new name.</param>
    /// <param name="order">The new order position.</param>
    /// <returns>True if the update was successful, otherwise false.</returns>
    public async Task<bool> UpdateColumnAsync(int id, string name, int order)
    {
        var column = await _context.Columns.FindAsync(id);
        if (column == null)
        {
            return false;
        }

        // Check if another column with the same name already exists in this board
        if (column.Name != name)
        {
            var existingColumn = await _context.Columns
                .FirstOrDefaultAsync(c => c.BoardId == column.BoardId && c.Name == name && c.Id != id);

            if (existingColumn != null)
            {
                throw new InvalidOperationException($"A column with the name '{name}' already exists in this board.");
            }
        }

        // If order changed, we need to reorder columns
        if (column.Order != order)
        {
            await MoveColumnAsync(id, order);
            column.Name = name;
        }
        else
        {
            column.Name = name;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Moves a column to a different position asynchronously.
    /// </summary>
    /// <param name="id">The column ID.</param>
    /// <param name="newOrder">The new order position.</param>
    /// <returns>True if the move was successful, otherwise false.</returns>
    public async Task<bool> MoveColumnAsync(int id, int newOrder)
    {
        var columnToMove = await _context.Columns.FindAsync(id);
        if (columnToMove == null)
        {
            return false;
        }

        var oldOrder = columnToMove.Order;

        if (oldOrder == newOrder)
        {
            return true;
        }

        // Get all columns for this board
        var columnsInBoard = await _context.Columns
            .Where(c => c.BoardId == columnToMove.BoardId)
            .OrderBy(c => c.Order)
            .ToListAsync();

        // Remove the column from its current position
        columnsInBoard.Remove(columnToMove);

        // Insert at new position
        if (newOrder >= columnsInBoard.Count)
        {
            columnsInBoard.Add(columnToMove);
        }
        else
        {
            columnsInBoard.Insert(newOrder, columnToMove);
        }

        // Update orders
        for (int i = 0; i < columnsInBoard.Count; i++)
        {
            columnsInBoard[i].Order = i;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Deletes a column asynchronously.
    /// </summary>
    /// <param name="id">The column ID.</param>
    /// <returns>True if the deletion was successful, otherwise false.</returns>
    public async Task<bool> DeleteColumnAsync(int id)
    {
        var column = await _context.Columns.FindAsync(id);
        if (column == null)
        {
            return false;
        }

        // Get all tasks in this column and delete them
        var tasksInColumn = await _context.Tasks
            .Where(t => t.ColumnId == id)
            .ToListAsync();

        _context.Tasks.RemoveRange(tasksInColumn);

        // Remove the column
        _context.Columns.Remove(column);

        // Reorder remaining columns
        var remainingColumns = await _context.Columns
            .Where(c => c.BoardId == column.BoardId && c.Order > column.Order)
            .ToListAsync();

        foreach (var remainingColumn in remainingColumns)
        {
            remainingColumn.Order--;
        }

        await _context.SaveChangesAsync();
        return true;
    }
}