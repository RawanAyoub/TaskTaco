namespace Kanban.Server.Controllers
{
    using System.Security.Claims;
    using Kanban.Application.Services;
    using Microsoft.AspNetCore.Authorization;
    using Kanban.Server.Models;
    using Microsoft.AspNetCore.Mvc;

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BoardController : ControllerBase
    {
        private readonly IBoardService boardService;

        public BoardController(IBoardService boardService)
        {
            this.boardService = boardService;
        }

        [HttpPost]
        [ProducesResponseType(typeof(CreateBoardResponse), StatusCodes.Status201Created)]
        public async Task<IActionResult> CreateBoard([FromBody] CreateBoardRequest request)
        {
            var userId = this.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return this.Unauthorized();
            }

            var board = await this.boardService.CreateBoardAsync(request.Name, request.Description, userId);

            var response = new CreateBoardResponse { Id = board.Id };
            return this.CreatedAtAction(nameof(this.GetBoards), response);
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<BoardDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetBoards()
        {
            var userId = this.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return this.Unauthorized();
            }

            var boards = await this.boardService.GetBoardsByUserAsync(userId);
            var boardDtos = boards.Select(b => new BoardDto
            {
                Id = b.Id,
                Name = b.Name,
                Description = b.Description,
            });

            return this.Ok(boardDtos);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateBoard(int id, [FromBody] UpdateBoardRequest request)
        {
            var success = await this.boardService.UpdateBoardAsync(id, request.Name, request.Description);
            if (!success)
            {
                return this.NotFound();
            }

            return this.Ok();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteBoard(int id)
        {
            var userId = this.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return this.Unauthorized();
            }

            // Ensure the board exists and belongs to the current user for security
            var board = await this.boardService.GetBoardByIdAsync(id);
            if (board == null || board.UserId != userId)
            {
                return this.NotFound();
            }

            var success = await this.boardService.DeleteBoardAsync(id);
            if (!success)
            {
                return this.NotFound();
            }

            return this.NoContent();
        }
    }
}
