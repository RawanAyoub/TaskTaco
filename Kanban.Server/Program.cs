using Microsoft.EntityFrameworkCore;

namespace Kanban.Server;

public class Program
{
    private static void SeedDatabase(Kanban.Infrastructure.KanbanDbContext context)
    {
        // Ensure database is created
        context.Database.EnsureCreated();

        // Create default user if none exists
        if (!context.Users.Any())
        {
            var defaultUser = new Kanban.Domain.Entities.User
            {
                Name = "Default User",
                Email = "default@example.com"
            };
            context.Users.Add(defaultUser);
            context.SaveChanges();
        }

        // Create default board with columns and tasks if none exist
        if (!context.Boards.Any())
        {
            var board = new Kanban.Domain.Entities.Board
            {
                Name = "My Kanban Board",
                UserId = 1
            };
            context.Boards.Add(board);
            context.SaveChanges();

            // Create columns
            var plannedColumn = new Kanban.Domain.Entities.Column
            {
                Name = "Planned",
                Order = 0,
                BoardId = board.Id
            };
            var inProgressColumn = new Kanban.Domain.Entities.Column
            {
                Name = "In Progress",
                Order = 1,
                BoardId = board.Id
            };
            var doneColumn = new Kanban.Domain.Entities.Column
            {
                Name = "Done",
                Order = 2,
                BoardId = board.Id
            };

            context.Columns.AddRange(plannedColumn, inProgressColumn, doneColumn);
            context.SaveChanges();

            // Create tasks
            var tasks = new[]
            {
                new Kanban.Domain.Entities.Task { Title = "AI Scene Analysis", Description = "AI Integration", Status = "To Do", Priority = "Medium", Order = 0, ColumnId = plannedColumn.Id },
                new Kanban.Domain.Entities.Task { Title = "Real-time Video Chat", Description = "Real-time Collaboration", Status = "To Do", Priority = "High", Order = 1, ColumnId = plannedColumn.Id },
                new Kanban.Domain.Entities.Task { Title = "AI-Assisted Video Transitions", Description = "AI Integration", Status = "To Do", Priority = "Low", Order = 2, ColumnId = plannedColumn.Id },
                new Kanban.Domain.Entities.Task { Title = "Multi-User Permissions", Description = "Real-time Collaboration", Status = "To Do", Priority = "Medium", Order = 3, ColumnId = plannedColumn.Id },
                new Kanban.Domain.Entities.Task { Title = "AI Scene Recommendations", Description = "AI Integration", Status = "To Do", Priority = "High", Order = 4, ColumnId = plannedColumn.Id },
                new Kanban.Domain.Entities.Task { Title = "Global CDN Integration", Description = "Cloud Migration", Status = "To Do", Priority = "Medium", Order = 5, ColumnId = plannedColumn.Id },
                new Kanban.Domain.Entities.Task { Title = "AI-Powered Video Summarization", Description = "AI Integration", Status = "To Do", Priority = "High", Order = 6, ColumnId = plannedColumn.Id },
                
                new Kanban.Domain.Entities.Task { Title = "Collaborative Editing", Description = "Real-time Collaboration", Status = "In Progress", Priority = "High", Order = 0, ColumnId = inProgressColumn.Id },
                new Kanban.Domain.Entities.Task { Title = "AI Voice-to-Text Subtitles", Description = "AI Integration", Status = "In Progress", Priority = "Medium", Order = 1, ColumnId = inProgressColumn.Id },
                new Kanban.Domain.Entities.Task { Title = "Version Control System", Description = "Real-time Collaboration", Status = "In Progress", Priority = "High", Order = 2, ColumnId = inProgressColumn.Id },
                new Kanban.Domain.Entities.Task { Title = "AI-Powered Audio Enhancement", Description = "AI Integration", Status = "In Progress", Priority = "Medium", Order = 3, ColumnId = inProgressColumn.Id },
                new Kanban.Domain.Entities.Task { Title = "Collaborative Storyboarding", Description = "Real-time Collaboration", Status = "In Progress", Priority = "High", Order = 4, ColumnId = inProgressColumn.Id },
                new Kanban.Domain.Entities.Task { Title = "AI Object Tracking", Description = "AI Integration", Status = "In Progress", Priority = "Medium", Order = 5, ColumnId = inProgressColumn.Id },
                new Kanban.Domain.Entities.Task { Title = "Blockchain-based Asset Licensing", Description = "Cloud Migration", Status = "In Progress", Priority = "Low", Order = 6, ColumnId = inProgressColumn.Id },
                
                new Kanban.Domain.Entities.Task { Title = "AI-Powered Color Grading", Description = "AI Integration", Status = "Done", Priority = "High", Order = 0, ColumnId = doneColumn.Id },
                new Kanban.Domain.Entities.Task { Title = "Cloud Asset Management", Description = "Cloud Migration", Status = "Done", Priority = "Medium", Order = 1, ColumnId = doneColumn.Id },
                new Kanban.Domain.Entities.Task { Title = "AI Content-Aware Fill", Description = "AI Integration", Status = "Done", Priority = "High", Order = 2, ColumnId = doneColumn.Id },
                new Kanban.Domain.Entities.Task { Title = "Real-time Project Analytics", Description = "Cloud Migration", Status = "Done", Priority = "Medium", Order = 3, ColumnId = doneColumn.Id },
                new Kanban.Domain.Entities.Task { Title = "AI-Driven Video Compression", Description = "AI Integration", Status = "Done", Priority = "High", Order = 4, ColumnId = doneColumn.Id },
                new Kanban.Domain.Entities.Task { Title = "Real-time Language Translation", Description = "Real-time Collaboration", Status = "Done", Priority = "Medium", Order = 5, ColumnId = doneColumn.Id }
            };

            context.Tasks.AddRange(tasks);
            context.SaveChanges();
        }
    }

    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
        builder.Services.AddControllers();
        builder.Services.AddScoped<Kanban.Application.Services.IBoardService, Kanban.Application.Services.BoardService>();
        builder.Services.AddScoped<Kanban.Application.Services.ITaskService, Kanban.Application.Services.TaskService>();
        builder.Services.AddScoped<Kanban.Application.Services.IColumnService, Kanban.Application.Services.ColumnService>();
        builder.Services.AddOpenApi();



        // Add CORS policy
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });

        // Add database context
        if (builder.Environment.EnvironmentName == "Testing")
        {
            builder.Services.AddDbContext<Kanban.Infrastructure.KanbanDbContext>(options =>
                options.UseInMemoryDatabase("TestDatabase"));
        }
        else
        {
            builder.Services.AddDbContext<Kanban.Infrastructure.KanbanDbContext>(options =>
                options.UseSqlite("Data Source=Kanban.db"));
        }

        var app = builder.Build();

        // Seed the database
        using (var scope = app.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<Kanban.Infrastructure.KanbanDbContext>();
            SeedDatabase(context);
        }

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        // app.UseHttpsRedirection();

        // Use CORS
        app.UseCors("AllowFrontend");

        app.MapControllers();

        var summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        app.MapGet("/weatherforecast", () =>
        {
            var forecast =  Enumerable.Range(1, 5).Select(index =>
                new WeatherForecast
                (
                    DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                    Random.Shared.Next(-20, 55),
                    summaries[Random.Shared.Next(summaries.Length)]
                ))
                .ToArray();
            return forecast;
        })
        .WithName("GetWeatherForecast");

        app.Run();
    }
}

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
