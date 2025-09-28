using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Kanban.Server.Tests.Controllers;

public class BoardManagementIntegrationTests : IClassFixture<CustomWebApplicationFactory<Kanban.Server.Program>>
{
    private readonly CustomWebApplicationFactory<Kanban.Server.Program> _factory;

    public BoardManagementIntegrationTests(CustomWebApplicationFactory<Kanban.Server.Program> factory)
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
        var createResponse = await client.PostAsJsonAsync("/api/board", createRequest);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var createResult = await createResponse.Content.ReadFromJsonAsync<CreateBoardResponse>();
        Assert.NotNull(createResult);

        // Act 2: Get boards list
        var getResponse = await client.GetAsync("/api/board");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var boards = await getResponse.Content.ReadFromJsonAsync<List<BoardDto>>();
        Assert.NotNull(boards);
        Assert.Contains(boards, b => b.Id == createResult.Id);

        // Act 3: Update the board
        var updateRequest = new { name = "Updated Integration Test Board" };
        var updateResponse = await client.PutAsJsonAsync($"/api/board/{createResult.Id}", updateRequest);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        // Act 4: Delete the board
        var deleteResponse = await client.DeleteAsync($"/api/board/{createResult.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        // Act 5: Verify board is deleted
        var getAfterDeleteResponse = await client.GetAsync("/api/board");
        Assert.Equal(HttpStatusCode.OK, getAfterDeleteResponse.StatusCode);
        var boardsAfterDelete = await getAfterDeleteResponse.Content.ReadFromJsonAsync<List<BoardDto>>();
        Assert.NotNull(boardsAfterDelete);
        Assert.DoesNotContain(boardsAfterDelete, b => b.Id == createResult.Id);
    }

    private class BoardDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    private class CreateBoardResponse
    {
        public int Id { get; set; }
    }
}