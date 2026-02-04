using System.Data;
using Npgsql;

namespace Sharding.Services;

public sealed class DbConnectionFactory(string connectionString)
{
    public IDbConnection Create()
        => new NpgsqlConnection(connectionString);
}