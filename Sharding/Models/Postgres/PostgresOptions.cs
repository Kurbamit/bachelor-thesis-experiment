namespace Sharding.Models.Postgres;

public sealed class PostgresOptions
{
    public string Database  { get; set; } = "postgres";
    public string Host { get; set; } = "localhost";
    public string Username { get; set; } = "postgres";
    public string Password { get; set; } = "postgres";
}