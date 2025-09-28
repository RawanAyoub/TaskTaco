using Kanban.Application.Services;
using Kanban.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Kanban.Server.Controllers;

using ColumnEntity = Kanban.Domain.Entities.Column;

/// <summary>
/// Controller for managing columns.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ColumnController : ControllerBase
{
    private readonly IColumnService _columnService;

    /// <summary>
    /// Initializes a new instance of the <see cref="ColumnController"/> class.
    /// </summary>
    /// <param name="columnService">The column service.</param>
    public ColumnController(IColumnService columnService)
    {
        _columnService = columnService;
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
        var columns = await _columnService.GetColumnsByBoardAsync(boardId);
        return Ok(columns);
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
        var column = await _columnService.GetColumnByIdAsync(id);
        if (column == null)
        {
            return NotFound();
        }

        return Ok(column);
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
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var column = await _columnService.CreateColumnAsync(boardId, request.Name, request.Order);
        return CreatedAtAction(nameof(GetColumn), new { id = column.Id }, column);
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
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var success = await _columnService.UpdateColumnAsync(id, request.Name, request.Order);
        if (!success)
        {
            return NotFound();
        }

        return NoContent();
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
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var success = await _columnService.MoveColumnAsync(id, request.NewOrder);
        if (!success)
        {
            return NotFound();
        }

        return NoContent();
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
        var success = await _columnService.DeleteColumnAsync(id);
        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }
}

/// <summary>
/// Request model for creating a column.
/// </summary>
public class CreateColumnRequest
{
    /// <summary>
    /// Gets or sets the column name.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the column order.
    /// </summary>
    public int Order { get; set; }
}

/// <summary>
/// Request model for updating a column.
/// </summary>
public class UpdateColumnRequest
{
    /// <summary>
    /// Gets or sets the column name.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the column order.
    /// </summary>
    public int Order { get; set; }
}

/// <summary>
/// Request model for moving a column.
/// </summary>
public class MoveColumnRequest
{
    /// <summary>
    /// Gets or sets the new order position.
    /// </summary>
    public int NewOrder { get; set; }
}