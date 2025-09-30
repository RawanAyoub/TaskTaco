using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Kanban.Domain.Entities;
using Kanban.Application.Services;
using System.Security.Claims;

namespace Kanban.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        var board = await _boardService.CreateBoardAsync(request.Name, request.Description, userId);
        Console.WriteLine($"Created board {board.Id}: {board.Name} for user {userId}");

        var response = new CreateBoardResponse { Id = board.Id };
        return CreatedAtAction(nameof(GetBoards), response);
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<BoardDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBoards()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        var boards = await _boardService.GetBoardsByUserAsync(userId);
        var boardDtos = boards.Select(b => new BoardDto
        {
            Id = b.Id,
            Name = b.Name,
            Description = b.Description
        });

        return Ok(boardDtos);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBoard(int id, [FromBody] UpdateBoardRequest request)
    {
        var success = await _boardService.UpdateBoardAsync(id, request.Name, request.Description);
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
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        // Ensure the board exists and belongs to the current user for security
        var board = await _boardService.GetBoardByIdAsync(id);
        if (board == null || board.UserId != userId)
        {
            return NotFound();
        }

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
    public string? Description { get; set; }
}

public class CreateBoardResponse
{
    public int Id { get; set; }
}

public class BoardDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdateBoardRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}