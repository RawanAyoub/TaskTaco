using Kanban.Domain.Entities;
using Kanban.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Kanban.Application.Services;

public interface IBoardService
{
    Task<IEnumerable<Board>> GetBoardsAsync();
    Task<IEnumerable<Board>> GetBoardsByUserAsync(string userId);
    Task<Board?> GetBoardByIdAsync(int id);
    Task<Board> CreateBoardAsync(string name, string? description, string userId);
    Task<bool> UpdateBoardAsync(int id, string name, string? description);
    Task<bool> DeleteBoardAsync(int id);
}

public class BoardService : IBoardService
{
    private readonly KanbanDbContext context;

    /// <summary>
    /// Initializes a new instance of the <see cref="BoardService"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public BoardService(KanbanDbContext context)
    {
        this.context = context;
    }

    /// <summary>
    /// Gets all boards asynchronously.
    /// </summary>
    /// <returns>A collection of boards.</returns>
    public async Task<IEnumerable<Board>> GetBoardsAsync()
    {
        return await this.context.Boards
            .Include(b => b.Columns)
            .ToListAsync();
    }

    /// <summary>
    /// Gets all boards for a specific user asynchronously.
    /// </summary>
    /// <param name="userId">The user ID to filter boards by.</param>
    /// <returns>A collection of boards for the specified user.</returns>
    public async Task<IEnumerable<Board>> GetBoardsByUserAsync(string userId)
    {
        return await this.context.Boards
            .Where(b => b.UserId == userId)
            .Include(b => b.Columns)
            .ToListAsync();
    }

    /// <summary>
    /// Gets a board by its ID asynchronously.
    /// </summary>
    /// <param name="id">The board ID.</param>
    /// <returns>The board if found, otherwise null.</returns>
    public async Task<Board?> GetBoardByIdAsync(int id)
    {
        return await this.context.Boards
            .Include(b => b.Columns)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    /// <summary>
    /// Creates a new board asynchronously.
    /// </summary>
    /// <param name="name">The name of the board.</param>
    /// <param name="userId">The ID of the user creating the board.</param>
    /// <returns>The created board.</returns>
    public async Task<Board> CreateBoardAsync(string name, string? description, string userId)
    {
        var board = new Board
        {
            Name = name,
            Description = description,
            UserId = userId,
        };
        this.context.Boards.Add(board);
        await this.context.SaveChangesAsync();
        return board;
    }

    /// <summary>
    /// Updates a board asynchronously.
    /// </summary>
    /// <param name="id">The board ID.</param>
    /// <param name="name">The new name of the board.</param>
    /// <returns>True if the update was successful, otherwise false.</returns>
    public async Task<bool> UpdateBoardAsync(int id, string name, string? description)
    {
        var board = await this.context.Boards.FindAsync(id);
        if (board == null)
        {
            return false;
        }
        
        board.Name = name;
        board.Description = description;
        await this.context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Deletes a board asynchronously.
    /// </summary>
    /// <param name="id">The board ID.</param>
    /// <returns>True if the deletion was successful, otherwise false.</returns>
    public async Task<bool> DeleteBoardAsync(int id)
    {
        var board = await this.context.Boards.FindAsync(id);
        if (board == null)
        {
            return false;
        }
        
        this.context.Boards.Remove(board);
        await this.context.SaveChangesAsync();
        return true;
    }
}