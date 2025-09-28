using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Kanban.Server.Tests.Controllers;

public class BoardControllerTests : IClassFixture<CustomWebApplicationFactory<Kanban.Server.Program>>
{
    private readonly CustomWebApplicationFactory<Kanban.Server.Program> _factory;

    public BoardControllerTests(CustomWebApplicationFactory<Kanban.Server.Program> factory)
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
        var response = await client.PostAsJsonAsync("/api/board", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<CreateBoardResponse>();
        Assert.NotNull(result);
        Assert.True(result.Id > 0);
    }

    [Fact]
    public async Task GetBoards_ReturnsOkWithBoardsList()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/board");

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
        
        // First create a board
        var createRequest = new { name = "Test Board" };
        var createResponse = await client.PostAsJsonAsync("/api/board", createRequest);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var createResult = await createResponse.Content.ReadFromJsonAsync<CreateBoardResponse>();
        Assert.NotNull(createResult);
        
        // Now update the board
        var updateRequest = new { name = "Updated Name" };
        var response = await client.PutAsJsonAsync($"/api/board/{createResult.Id}", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task DeleteBoard_ValidRequest_ReturnsNoContent()
    {
        // Arrange
        var client = _factory.CreateClient();
        
        // First create a board
        var createRequest = new { name = "Test Board" };
        var createResponse = await client.PostAsJsonAsync("/api/board", createRequest);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var createResult = await createResponse.Content.ReadFromJsonAsync<CreateBoardResponse>();
        Assert.NotNull(createResult);

        // Now delete the board
        var response = await client.DeleteAsync($"/api/board/{createResult.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    private class CreateBoardResponse
    {
        public int Id { get; set; }
    }

    private class BoardDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}