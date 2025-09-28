using Microsoft.EntityFrameworkCore;

namespace Kanban.Server;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
        builder.Services.AddControllers();
        builder.Services.AddScoped<Kanban.Application.Services.IBoardService, Kanban.Application.Services.BoardService>();
        builder.Services.AddOpenApi();

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

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        app.UseHttpsRedirection();
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
