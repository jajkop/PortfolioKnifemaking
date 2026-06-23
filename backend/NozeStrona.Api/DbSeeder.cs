using Microsoft.EntityFrameworkCore;
using Npgsql;
using NozeStrona.Api.Data;
using NozeStrona.Api.Models;

namespace NozeStrona.Api;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder");

        await EnsureDatabaseExistsAsync(configuration, logger);

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        if (!await db.AdminUsers.AnyAsync())
        {
            var adminPassword = configuration["Admin:Password"] ?? "Admin123!";
            db.AdminUsers.Add(new AdminUser
            {
                Username = configuration["Admin:Username"] ?? "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword)
            });
            await db.SaveChangesAsync();
            logger.LogInformation("Utworzono konto administratora.");
        }
    }

    private static async Task EnsureDatabaseExistsAsync(IConfiguration configuration, ILogger logger)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Brak connection string DefaultConnection.");

        var builder = new NpgsqlConnectionStringBuilder(connectionString);
        var databaseName = builder.Database
            ?? throw new InvalidOperationException("Brak nazwy bazy w connection string.");

        builder.Database = "postgres";

        await using var connection = new NpgsqlConnection(builder.ConnectionString);
        await connection.OpenAsync();

        await using var checkCommand = connection.CreateCommand();
        checkCommand.CommandText = "SELECT 1 FROM pg_database WHERE datname = @name";
        checkCommand.Parameters.AddWithValue("name", databaseName);

        var exists = await checkCommand.ExecuteScalarAsync() is not null;
        if (exists)
        {
            return;
        }

        await using var createCommand = connection.CreateCommand();
        createCommand.CommandText = $"CREATE DATABASE \"{databaseName.Replace("\"", "\"\"")}\"";
        await createCommand.ExecuteNonQueryAsync();

        logger.LogInformation("Utworzono bazę danych {Database}.", databaseName);
    }
}
