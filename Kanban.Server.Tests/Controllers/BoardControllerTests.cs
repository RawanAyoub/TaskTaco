using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Kanban.Server.Tests.Controllers;

public class BoardControllerTests : IClassFixture<WebApplicationFactory<Kanban.Server.Program>>
{
    private readonly WebApplicationFactory<Kanban.Server.Program> _factory;

    public BoardControllerTests(WebApplicationFactory<Kanban.Server.Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CreateBoard_ValidRequest_ReturnsCreatedWithId()
    {
        // Arrange
        var client = _factory.CreateClient();
        var request = new { name = "My Board" };

        // Act
        var response = await client.PostAsJsonAsync("/api/boards", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<CreateBoardResponse>();
        Assert.NotNull(result);
        Assert.NotEqual(Guid.Empty, result.Id);
    }

    [Fact]
    public async Task GetBoards_ReturnsOkWithBoardsList()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/boards");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<List<BoardDto>>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task UpdateBoard_ValidRequest_ReturnsOk()
    {
        // Arrange
        var client = _factory.CreateClient();
        var boardId = Guid.NewGuid(); // Assume board exists
        var request = new { name = "Updated Name" };

        // Act
        var response = await client.PutAsJsonAsync($"/api/boards/{boardId}", request);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task DeleteBoard_ValidRequest_ReturnsNoContent()
    {
        // Arrange
        var client = _factory.CreateClient();
        var boardId = Guid.NewGuid(); // Assume board exists

        // Act
        var response = await client.DeleteAsync($"/api/boards/{boardId}");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    private class CreateBoardResponse
    {
        public Guid Id { get; set; }
    }

    private class BoardDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}