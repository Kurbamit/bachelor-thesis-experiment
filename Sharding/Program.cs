using Microsoft.Extensions.Options;
using Prometheus;
using Sharding.Models.Postgres;
using Sharding.Models;
using Sharding.Repositories.Postgres;
using Sharding.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<PostgresOptions>(builder.Configuration.GetSection("Postgres"));
builder.Services.Configure<SshTunnelOptions>(builder.Configuration.GetSection("SshTunnel"));

// Start the SSH tunnel on app startup
builder.Services.AddHostedService<SshTunnelService>();

builder.Services.AddSingleton(sp =>
{
    var sshOpt = sp.GetRequiredService<IOptions<SshTunnelOptions>>().Value;
    var pg = builder.Configuration.GetSection("Postgres");
    var db = pg["Database"];
    var user = pg["Username"];
    var pass = pg["Password"];

    return $"Host=127.0.0.1;Port={sshOpt.LocalPort};Database={db};Username={user};Password={pass};Pooling=true;Maximum Pool Size=200;Minimum Pool Size=0;Timeout=90;Command Timeout=90;";
});

builder.Services.AddSingleton(sp =>
{
    var pg = sp.GetRequiredService<IOptions<PostgresOptions>>().Value;
    var ssh = sp.GetRequiredService<IOptions<SshTunnelOptions>>().Value;

    var cs =
        $"Host=127.0.0.1;Port={ssh.LocalPort};Database={pg.Database};Username={pg.Username};Password={pg.Password};Pooling=true;Maximum Pool Size=200;Minimum Pool Size=0;Timeout=90;Command Timeout=90;";

    return new DbConnectionFactory(cs);
});

// Repositories DI
builder.Services.AddScoped<ProductRepository>();
builder.Services.AddScoped<CartRepository>();
builder.Services.AddScoped<CartTenantRepository>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || true)
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Expose Prometheus metrics endpoint at /metrics
app.MapMetrics();

app.MapControllers();

app.Run();
