using Microsoft.AspNetCore.Mvc;
using Kanban.Domain.Entities;
using Kanban.Application.Services;

namespace Kanban.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BoardController : ControllerBase
{
    private readonly IBoardService _boardService;

    public BoardController(IBoardService boardService)
    {
        _boardService = boardService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreateBoardResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateBoard([FromBody] CreateBoardRequest request)
    {
        var board = await _boardService.CreateBoardAsync(request.Name);
        Console.WriteLine($"Created board {board.Id}: {board.Name}");

        var response = new CreateBoardResponse { Id = board.Id };
        return CreatedAtAction(nameof(GetBoards), response);
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<BoardDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBoards()
    {
        var boards = await _boardService.GetBoardsAsync();
        var boardDtos = boards.Select(b => new BoardDto
        {
            Id = b.Id,
            Name = b.Name
        });

        return Ok(boardDtos);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBoard(int id, [FromBody] UpdateBoardRequest request)
    {
        var success = await _boardService.UpdateBoardAsync(id, request.Name);
        if (!success)
        {
            return NotFound();
        }

        return Ok();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteBoard(int id)
    {
        var success = await _boardService.DeleteBoardAsync(id);
        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }
}

public class CreateBoardRequest
{
    public string Name { get; set; } = string.Empty;
}

public class CreateBoardResponse
{
    public int Id { get; set; }
}

public class BoardDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class UpdateBoardRequest
{
    public string Name { get; set; } = string.Empty;
}