using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Kanban.Server.Tests.Controllers;

/// <summary>
/// Integration tests for ColumnController.
/// </summary>
public class ColumnControllerTests : IClassFixture<CustomWebApplicationFactory<Kanban.Server.Program>>
{
    private readonly CustomWebApplicationFactory<Kanban.Server.Program> _factory;

    /// <summary>
    /// Initializes a new instance of the <see cref="ColumnControllerTests"/> class.
    /// </summary>
    /// <param name="factory">The web application factory.</param>
    public ColumnControllerTests(CustomWebApplicationFactory<Kanban.Server.Program> factory)
    {
        _factory = factory;
    }

    /// <summary>
    /// Tests creating a column.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    [Fact]
    public async Task CreateColumn_ValidRequest_ReturnsCreatedWithId()
    {
        // Arrange
        var client = _factory.CreateClient();

        // First create a board
        var createBoardRequest = new { name = "Test Board" };
        var createBoardResponse = await client.PostAsJsonAsync("/api/board", createBoardRequest);
        Assert.Equal(HttpStatusCode.Created, createBoardResponse.StatusCode);
        var createBoardResult = await createBoardResponse.Content.ReadFromJsonAsync<CreateBoardResponse>();
        Assert.NotNull(createBoardResult);

        var createColumnRequest = new
        {
            name = "To Do",
            order = 0
        };

        // Act
        var response = await client.PostAsJsonAsync($"/api/column/board/{createBoardResult.Id}", createColumnRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<CreateColumnResponse>();
        Assert.NotNull(result);
        Assert.Equal(createColumnRequest.name, result.Name);
        Assert.Equal(createColumnRequest.order, result.Order);
        Assert.Equal(createBoardResult.Id, result.BoardId);
    }

    /// <summary>
    /// Tests getting columns by board.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    [Fact]
    public async Task GetColumnsByBoard_ExistingBoard_ReturnsColumns()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Create a board
        var createBoardRequest = new { name = "Test Board" };
        var createBoardResponse = await client.PostAsJsonAsync("/api/board", createBoardRequest);
        Assert.Equal(HttpStatusCode.Created, createBoardResponse.StatusCode);
        var createBoardResult = await createBoardResponse.Content.ReadFromJsonAsync<CreateBoardResponse>();
        Assert.NotNull(createBoardResult);

        // Create columns
        var createColumn1Request = new { name = "To Do", order = 0 };
        var createColumn2Request = new { name = "In Progress", order = 1 };

        await client.PostAsJsonAsync($"/api/column/board/{createBoardResult.Id}", createColumn1Request);
        await client.PostAsJsonAsync($"/api/column/board/{createBoardResult.Id}", createColumn2Request);

        // Act
        var response = await client.GetAsync($"/api/column/board/{createBoardResult.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<List<CreateColumnResponse>>();
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.Equal("To Do", result[0].Name);
        Assert.Equal("In Progress", result[1].Name);
    }

    /// <summary>
    /// Tests getting a column by ID.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    [Fact]
    public async Task GetColumn_ExistingId_ReturnsColumn()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Create a board and column
        var createBoardRequest = new { name = "Test Board" };
        var createBoardResponse = await client.PostAsJsonAsync("/api/board", createBoardRequest);
        Assert.Equal(HttpStatusCode.Created, createBoardResponse.StatusCode);
        var createBoardResult = await createBoardResponse.Content.ReadFromJsonAsync<CreateBoardResponse>();
        Assert.NotNull(createBoardResult);

        var createColumnRequest = new { name = "To Do", order = 0 };
        var createColumnResponse = await client.PostAsJsonAsync($"/api/column/board/{createBoardResult.Id}", createColumnRequest);
        Assert.Equal(HttpStatusCode.Created, createColumnResponse.StatusCode);
        var createColumnResult = await createColumnResponse.Content.ReadFromJsonAsync<CreateColumnResponse>();
        Assert.NotNull(createColumnResult);

        // Act
        var response = await client.GetAsync($"/api/column/{createColumnResult.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<CreateColumnResponse>();
        Assert.NotNull(result);
        Assert.Equal(createColumnResult.Id, result.Id);
        Assert.Equal(createColumnRequest.name, result.Name);
    }

    /// <summary>
    /// Tests updating a column.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    [Fact]
    public async Task UpdateColumn_ValidRequest_ReturnsNoContent()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Create a board and column
        var createBoardRequest = new { name = "Test Board" };
        var createBoardResponse = await client.PostAsJsonAsync("/api/board", createBoardRequest);
        Assert.Equal(HttpStatusCode.Created, createBoardResponse.StatusCode);
        var createBoardResult = await createBoardResponse.Content.ReadFromJsonAsync<CreateBoardResponse>();
        Assert.NotNull(createBoardResult);

        var createColumnRequest = new { name = "To Do", order = 0 };
        var createColumnResponse = await client.PostAsJsonAsync($"/api/column/board/{createBoardResult.Id}", createColumnRequest);
        Assert.Equal(HttpStatusCode.Created, createColumnResponse.StatusCode);
        var createColumnResult = await createColumnResponse.Content.ReadFromJsonAsync<CreateColumnResponse>();
        Assert.NotNull(createColumnResult);

        var updateColumnRequest = new
        {
            name = "Updated Column",
            order = 0
        };

        // Act
        var response = await client.PutAsJsonAsync($"/api/column/{createColumnResult.Id}", updateColumnRequest);

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        // Verify the update
        var getResponse = await client.GetAsync($"/api/column/{createColumnResult.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var getResult = await getResponse.Content.ReadFromJsonAsync<CreateColumnResponse>();
        Assert.NotNull(getResult);
        Assert.Equal(updateColumnRequest.name, getResult.Name);
    }

    /// <summary>
    /// Tests moving a column.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    [Fact]
    public async Task MoveColumn_ValidRequest_ReturnsNoContent()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Create a board and columns
        var createBoardRequest = new { name = "Test Board" };
        var createBoardResponse = await client.PostAsJsonAsync("/api/board", createBoardRequest);
        Assert.Equal(HttpStatusCode.Created, createBoardResponse.StatusCode);
        var createBoardResult = await createBoardResponse.Content.ReadFromJsonAsync<CreateBoardResponse>();
        Assert.NotNull(createBoardResult);

        var createColumn1Request = new { name = "To Do", order = 0 };
        var createColumn2Request = new { name = "In Progress", order = 1 };
        var createColumn3Request = new { name = "Done", order = 2 };

        var createColumn1Response = await client.PostAsJsonAsync($"/api/column/board/{createBoardResult.Id}", createColumn1Request);
        var createColumn2Response = await client.PostAsJsonAsync($"/api/column/board/{createBoardResult.Id}", createColumn2Request);
        var createColumn3Response = await client.PostAsJsonAsync($"/api/column/board/{createBoardResult.Id}", createColumn3Request);

        var createColumn1Result = await createColumn1Response.Content.ReadFromJsonAsync<CreateColumnResponse>();
        Assert.NotNull(createColumn1Result);

        var moveColumnRequest = new { newOrder = 2 };

        // Act
        var response = await client.PatchAsJsonAsync($"/api/column/{createColumn1Result.Id}/move", moveColumnRequest);

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    /// <summary>
    /// Tests deleting a column.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    [Fact]
    public async Task DeleteColumn_ExistingId_ReturnsNoContent()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Create a board and column
        var createBoardRequest = new { name = "Test Board" };
        var createBoardResponse = await client.PostAsJsonAsync("/api/board", createBoardRequest);
        Assert.Equal(HttpStatusCode.Created, createBoardResponse.StatusCode);
        var createBoardResult = await createBoardResponse.Content.ReadFromJsonAsync<CreateBoardResponse>();
        Assert.NotNull(createBoardResult);

        var createColumnRequest = new { name = "To Do", order = 0 };
        var createColumnResponse = await client.PostAsJsonAsync($"/api/column/board/{createBoardResult.Id}", createColumnRequest);
        Assert.Equal(HttpStatusCode.Created, createColumnResponse.StatusCode);
        var createColumnResult = await createColumnResponse.Content.ReadFromJsonAsync<CreateColumnResponse>();
        Assert.NotNull(createColumnResult);

        // Act
        var response = await client.DeleteAsync($"/api/column/{createColumnResult.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        // Verify the column is deleted
        var getResponse = await client.GetAsync($"/api/column/{createColumnResult.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    /// <summary>
    /// Tests getting a non-existing column.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    [Fact]
    public async Task GetColumn_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/column/999");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    /// <summary>
    /// Tests updating a non-existing column.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    [Fact]
    public async Task UpdateColumn_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        var client = _factory.CreateClient();

        var updateColumnRequest = new
        {
            name = "Updated Column",
            order = 0
        };

        // Act
        var response = await client.PutAsJsonAsync("/api/column/999", updateColumnRequest);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    /// <summary>
    /// Tests deleting a non-existing column.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    [Fact]
    public async Task DeleteColumn_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.DeleteAsync("/api/column/999");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}

/// <summary>
/// Response model for creating a board.
/// </summary>
public class CreateBoardResponse
{
    /// <summary>
    /// Gets or sets the board ID.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the board name.
    /// </summary>
    public string Name { get; set; } = string.Empty;
}

/// <summary>
/// Response model for creating a column.
/// </summary>
public class CreateColumnResponse
{
    /// <summary>
    /// Gets or sets the column ID.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the board ID.
    /// </summary>
    public int BoardId { get; set; }

    /// <summary>
    /// Gets or sets the column name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the column order.
    /// </summary>
    public int Order { get; set; }
}