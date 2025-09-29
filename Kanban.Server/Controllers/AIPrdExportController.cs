using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kanban.Infrastructure;
using System.Text.Json;

namespace Kanban.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AIPrdExportController : ControllerBase
{
    private readonly KanbanDbContext _context;

    public AIPrdExportController(KanbanDbContext context)
    {
        _context = context;
    }

    [HttpGet("{boardId}/export")]
    public async Task<IActionResult> ExportBoard(int boardId)
    {
        var board = await _context.Boards
            .Include(b => b.Columns)
                .ThenInclude(c => c.Tasks)
            .FirstOrDefaultAsync(b => b.Id == boardId);

        if (board == null)
        {
            return NotFound();
        }

        var boardData = new
        {
            board.Id,
            board.Name,
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
            WriteIndented = true 
        });

        var prompt = GenerateAIPrdPrompt(board.Name, jsonData);

        return Ok(new { json = jsonData, prompt });
    }

    private string GenerateAIPrdPrompt(string boardName, string jsonData)
    {
        return $@"# AI PRD Generation Request

## Context
I'm working on a Kanban project management tool called LocalFreeKanban. I need you to analyze the current board state and generate a comprehensive Product Requirements Document (PRD).

## Current Board Data
Board Name: {boardName}

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
Please structure your response as a professional PRD document with clear sections, bullet points, and actionable requirements that a development team could implement.

## Additional Context
- This is for a privacy-first, offline-capable Kanban tool
- Built with ASP.NET Core 8 backend and React 18 frontend
- Uses SQLite for local storage
- Packaged as Windows .exe via Electron
- Focus on individual productivity, not team collaboration";
    }
}