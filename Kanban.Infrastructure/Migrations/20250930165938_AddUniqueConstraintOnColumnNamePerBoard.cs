using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kanban.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueConstraintOnColumnNamePerBoard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // First, clean up any duplicate columns (keep the one with smallest ID for each BoardId+Name pair)
            migrationBuilder.Sql(@"
                DELETE FROM Columns 
                WHERE Id NOT IN (
                    SELECT MIN(Id) 
                    FROM Columns 
                    GROUP BY BoardId, Name
                )
            ");

            migrationBuilder.DropIndex(
                name: "IX_Columns_BoardId",
                table: "Columns");

            migrationBuilder.CreateIndex(
                name: "IX_Columns_BoardId_Name",
                table: "Columns",
                columns: new[] { "BoardId", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Columns_BoardId_Name",
                table: "Columns");

            migrationBuilder.CreateIndex(
                name: "IX_Columns_BoardId",
                table: "Columns",
                column: "BoardId");
        }
    }
}
