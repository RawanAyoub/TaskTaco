using Microsoft.Data.Sqlite;

string connectionString = "Data Source=../Kanban.Server/Kanban.db";

using (var connection = new SqliteConnection(connectionString))
{
    connection.Open();
    
    // Update empty CreatedAt and UpdatedAt fields with current datetime
    string currentDateTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
    
    var updateCommand = connection.CreateCommand();
    updateCommand.CommandText = @"
        UPDATE Tasks 
        SET CreatedAt = @currentDateTime, 
            UpdatedAt = @currentDateTime 
        WHERE CreatedAt = '' OR CreatedAt IS NULL 
           OR UpdatedAt = '' OR UpdatedAt IS NULL";
    updateCommand.Parameters.AddWithValue("@currentDateTime", currentDateTime);
    
    int rowsAffected = updateCommand.ExecuteNonQuery();
    Console.WriteLine($"Fixed {rowsAffected} task records with empty DateTime values");
    
    // Verify the fix
    var checkCommand = connection.CreateCommand();
    checkCommand.CommandText = "SELECT COUNT(*) FROM Tasks WHERE CreatedAt = '' OR UpdatedAt = ''";
    int emptyCount = Convert.ToInt32(checkCommand.ExecuteScalar());
    Console.WriteLine($"Remaining empty DateTime records: {emptyCount}");
}
