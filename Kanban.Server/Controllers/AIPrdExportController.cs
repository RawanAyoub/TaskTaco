namespace Kanban.Server.Controllers;

using System.Text.Json;
using Kanban.Infrastructure;
using Kanban.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class AIPrdExportController : ControllerBase
{
    private readonly KanbanDbContext context;

    /// <summary>
    /// Initializes a new instance of the <see cref="AIPrdExportController"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public AIPrdExportController(KanbanDbContext context)
    {
        this.context = context;
    }

    /// <summary>
    /// Exports the specified board as JSON and generates an AI PRD prompt.
    /// </summary>
    /// <param name="boardId">The board identifier.</param>
    /// <returns>The export payload containing JSON and prompt.</returns>
    [HttpGet("{boardId}/export")]
    public async Task<IActionResult> ExportBoard(int boardId)
    {
        var board = await this.context.Boards
            .Include(b => b.Columns)
                .ThenInclude(c => c.Tasks)
            .FirstOrDefaultAsync(b => b.Id == boardId);

        if (board == null)
        {
            return this.NotFound();
        }

        var boardData = new
        {
            board.Id,
            board.Name,
            board.Description,
            Columns = board.Columns.Select(c => new
            {
                c.Id,
                c.Name,
                c.Order,
                Tasks = c.Tasks.Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Description,
                    t.Order,
                    t.DueDate,
                    t.Priority,
                    t.Status,
                    t.Labels
                }).OrderBy(t => t.Order)
            }).OrderBy(c => c.Order)
        };

        var jsonData = JsonSerializer.Serialize(boardData, new JsonSerializerOptions
        {
            WriteIndented = true,
        });

        var prompt = this.GenerateAIPrdPrompt(board.Name, board.Description ?? string.Empty, jsonData);

        return this.Ok(new { json = jsonData, prompt });
    }

    /// <summary>
    /// Builds the AI prompt to generate a PRD document based on board data.
    /// </summary>
    /// <param name="boardName">The board name.</param>
    /// <param name="boardDescription">The board description.</param>
    /// <param name="jsonData">Formatted JSON representing the board.</param>
    /// <returns>A detailed prompt for AI PRD generation.</returns>
    private string GenerateAIPrdPrompt(string boardName, string boardDescription, string jsonData)
    {
        return $@"# AI PRD Generation Request

## Context
I'm working on a Kanban project management tool called TaskTaco. I need you to analyze the current board state and generate a comprehensive Product Requirements Document (PRD).

## Current Board Data
Board Name: {boardName}
Board Description: {(string.IsNullOrWhiteSpace(boardDescription) ? "(none provided)" : boardDescription)}

```json
{jsonData}
```

## Instructions
Based on the board structure and tasks above, please generate a PRD that includes:

1. **Executive Summary** - Overview of the project scope
2. **User Stories** - Derived from the task titles and descriptions
3. **Feature Requirements** - Functional requirements based on column organization
4. **Technical Specifications** - Architecture recommendations
5. **Success Metrics** - KPIs and acceptance criteria
6. **Implementation Timeline** - Suggested development phases

## Output Format
Please structure your response as a professional PRD document with clear sections, bullet points, and actionable requirements that a development team could implement. The output should be formatted so it can be easily copied and saved as a PDF by the user.

## Additional Context
- This is for a privacy-first, offline-capable Kanban tool
- Built with ASP.NET Core 8 backend and React 18 frontend
- Uses SQLite for local storage
- Packaged as Windows .exe via Electron
- Focus on individual productivity, not team collaboration";
    }
}