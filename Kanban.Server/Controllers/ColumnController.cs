namespace Kanban.Server.Controllers
{
    using System.Security.Claims;
    using Kanban.Application.Services;
    using Microsoft.AspNetCore.Mvc;
    using Kanban.Server.Models;
    using ColumnEntity = Kanban.Domain.Entities.Column;

    /// <summary>
    /// Controller for managing columns.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class ColumnController : ControllerBase
    {
        private readonly IColumnService columnService;

        /// <summary>
        /// Initializes a new instance of the <see cref="ColumnController"/> class.
        /// </summary>
        /// <param name="columnService">The column service.</param>
        public ColumnController(IColumnService columnService)
        {
            this.columnService = columnService;
        }

        /// <summary>
        /// Gets all columns for a specific board.
        /// </summary>
        /// <param name="boardId">The board ID.</param>
        /// <returns>A list of columns.</returns>
        [HttpGet("board/{boardId}")]
        [ProducesResponseType(typeof(IEnumerable<ColumnEntity>), 200)]
        public async Task<IActionResult> GetColumnsByBoard(int boardId)
        {
            var columns = await this.columnService.GetColumnsByBoardAsync(boardId);
            return this.Ok(columns);
        }

        /// <summary>
        /// Gets a column by its ID.
        /// </summary>
        /// <param name="id">The column ID.</param>
        /// <returns>The column.</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ColumnEntity), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetColumn(int id)
        {
            var column = await this.columnService.GetColumnByIdAsync(id);
            if (column == null)
            {
                return this.NotFound();
            }

            return this.Ok(column);
        }

        /// <summary>
        /// Creates a new column.
        /// </summary>
        /// <param name="boardId">The board ID.</param>
        /// <param name="request">The column creation request.</param>
        /// <returns>The created column.</returns>
        [HttpPost("board/{boardId}")]
        [ProducesResponseType(typeof(ColumnEntity), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> CreateColumn(int boardId, [FromBody] CreateColumnRequest request)
        {
            if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }

            try
            {
                var column = await this.columnService.CreateColumnAsync(boardId, request.Name, request.Order);
                return this.CreatedAtAction(nameof(this.GetColumn), new { id = column.Id }, column);
            }
            catch (InvalidOperationException ex)
            {
                return this.BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Updates a column.
        /// </summary>
        /// <param name="id">The column ID.</param>
        /// <param name="request">The column update request.</param>
        /// <returns>No content.</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> UpdateColumn(int id, [FromBody] UpdateColumnRequest request)
        {
            if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }

            try
            {
                var success = await this.columnService.UpdateColumnAsync(id, request.Name, request.Order);
                if (!success)
                {
                    return this.NotFound();
                }

                return this.NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return this.BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Moves a column to a different position.
        /// </summary>
        /// <param name="id">The column ID.</param>
        /// <param name="request">The move request.</param>
        /// <returns>No content.</returns>
        [HttpPatch("{id}/move")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> MoveColumn(int id, [FromBody] MoveColumnRequest request)
        {
            if (!this.ModelState.IsValid)
            {
                return this.BadRequest(this.ModelState);
            }

            var success = await this.columnService.MoveColumnAsync(id, request.NewOrder);
            if (!success)
            {
                return this.NotFound();
            }

            return this.NoContent();
        }

        /// <summary>
        /// Deletes a column.
        /// </summary>
        /// <param name="id">The column ID.</param>
        /// <returns>No content.</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteColumn(int id)
        {
            var success = await this.columnService.DeleteColumnAsync(id);
            if (!success)
            {
                return this.NotFound();
            }

            return this.NoContent();
        }
    }
}
