namespace Sharding.Models;

public sealed class SshTunnelOptions
{
    public string SshHost { get; set; } = "";
    public int SshPort { get; set; } = 22;
    public string SshUser { get; set; } = "";
    public string PrivateKeyPath { get; set; } = "";
    public string? PrivateKeyPassphrase { get; set; }
    public string LocalHost { get; set; } = "127.0.0.1";
    public uint LocalPort { get; set; } = 5433;
    public string RemoteHost { get; set; } = "127.0.0.1";
    public uint RemotePort { get; set; } = 5432;
    public int KeepAliveSeconds { get; set; } = 30;
}