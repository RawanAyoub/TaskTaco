using Kanban.Domain.Entities;

namespace Kanban.Application.Services;

public interface IBoardService
{
    Task<IEnumerable<Board>> GetBoardsAsync();
    Task<Board?> GetBoardByIdAsync(int id);
    Task<Board> CreateBoardAsync(string name);
    Task<bool> UpdateBoardAsync(int id, string name);
    Task<bool> DeleteBoardAsync(int id);
}

public class BoardService : IBoardService
{
    private readonly List<Board> _boards = new();
    private int _nextId = 1;

    public System.Threading.Tasks.Task<IEnumerable<Board>> GetBoardsAsync()
    {
        return System.Threading.Tasks.Task.FromResult<IEnumerable<Board>>(_boards);
    }

    public System.Threading.Tasks.Task<Board?> GetBoardByIdAsync(int id)
    {
        return System.Threading.Tasks.Task.FromResult(_boards.FirstOrDefault(b => b.Id == id));
    }

    public System.Threading.Tasks.Task<Board> CreateBoardAsync(string name)
    {
        var board = new Board
        {
            Id = _nextId++,
            Name = name,
            UserId = 1 // TODO: Get from authenticated user
        };
        _boards.Add(board);
        return System.Threading.Tasks.Task.FromResult(board);
    }

    public System.Threading.Tasks.Task<bool> UpdateBoardAsync(int id, string name)
    {
        var board = _boards.FirstOrDefault(b => b.Id == id);
        if (board == null) return System.Threading.Tasks.Task.FromResult(false);
        
        board.Name = name;
        return System.Threading.Tasks.Task.FromResult(true);
    }

    public System.Threading.Tasks.Task<bool> DeleteBoardAsync(int id)
    {
        var board = _boards.FirstOrDefault(b => b.Id == id);
        if (board == null) return System.Threading.Tasks.Task.FromResult(false);
        
        _boards.Remove(board);
        return System.Threading.Tasks.Task.FromResult(true);
    }
}