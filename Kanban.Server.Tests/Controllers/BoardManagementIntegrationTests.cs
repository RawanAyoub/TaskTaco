using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Kanban.Server.Tests.Controllers;

public class BoardManagementIntegrationTests : IClassFixture<WebApplicationFactory<Kanban.Server.Program>>
{
    private readonly WebApplicationFactory<Kanban.Server.Program> _factory;

    public BoardManagementIntegrationTests(WebApplicationFactory<Kanban.Server.Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task BoardLifecycle_CompleteWorkflow_Works()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act 1: Create a board
        var createRequest = new { name = "Integration Test Board" };
        var createResponse = await client.PostAsJsonAsync("/api/boards", createRequest);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var createdBoard = await createResponse.Content.ReadFromJsonAsync<BoardDto>();
        Assert.NotNull(createdBoard);

        // Act 2: Get boards list
        var getResponse = await client.GetAsync("/api/boards");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var boards = await getResponse.Content.ReadFromJsonAsync<List<BoardDto>>();
        Assert.NotNull(boards);
        Assert.Contains(boards, b => b.Id == createdBoard.Id);

        // Act 3: Update the board
        var updateRequest = new { name = "Updated Integration Test Board" };
        var updateResponse = await client.PutAsJsonAsync($"/api/boards/{createdBoard.Id}", updateRequest);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        // Act 4: Delete the board
        var deleteResponse = await client.DeleteAsync($"/api/boards/{createdBoard.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        // Act 5: Verify board is deleted
        var getAfterDeleteResponse = await client.GetAsync("/api/boards");
        Assert.Equal(HttpStatusCode.OK, getAfterDeleteResponse.StatusCode);
        var boardsAfterDelete = await getAfterDeleteResponse.Content.ReadFromJsonAsync<List<BoardDto>>();
        Assert.NotNull(boardsAfterDelete);
        Assert.DoesNotContain(boardsAfterDelete, b => b.Id == createdBoard.Id);
    }

    private class BoardDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}