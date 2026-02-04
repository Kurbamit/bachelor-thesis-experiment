using Microsoft.Extensions.Options;
using Renci.SshNet;
using Sharding.Models;

namespace Sharding.Services;

public sealed class SshTunnelService(
    IOptions<SshTunnelOptions> options,
    ILogger<SshTunnelService> logger)
    : BackgroundService
{
    private readonly SshTunnelOptions _opt = options.Value;

    private SshClient? _ssh;
    private ForwardedPortLocal? _port;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Basic retry loop
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                EnsureConnectedAndForwarding();
                // Sleep a bit; KeepAlive is handled by SSH.NET KeepAliveInterval.
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // shutdown
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "SSH tunnel error; will retry in 5 seconds.");
                SafeStop();
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }

    private void EnsureConnectedAndForwarding()
    {
        if (_ssh is { IsConnected: true } && _port is { IsStarted: true })
            return;

        SafeStop(); // clean up any half-open state

        var keyFile = string.IsNullOrWhiteSpace(_opt.PrivateKeyPassphrase)
            ? new PrivateKeyFile(_opt.PrivateKeyPath)
            : new PrivateKeyFile(_opt.PrivateKeyPath, _opt.PrivateKeyPassphrase);

        var auth = new PrivateKeyAuthenticationMethod(_opt.SshUser, keyFile);
        var connInfo = new Renci.SshNet.ConnectionInfo(_opt.SshHost, _opt.SshPort, _opt.SshUser, auth);

        _ssh = new SshClient(connInfo)
        {
            KeepAliveInterval = TimeSpan.FromSeconds(Math.Max(5, _opt.KeepAliveSeconds))
        };

        _ssh.ErrorOccurred += (_, e) =>
            logger.LogWarning(e.Exception, "SSH client error occurred.");

        _ssh.Connect();

        _port = new ForwardedPortLocal(_opt.LocalHost, _opt.LocalPort, _opt.RemoteHost, _opt.RemotePort);
        _port.Exception += (_, e) =>
            logger.LogWarning(e.Exception, "Port forwarding exception.");

        _ssh.AddForwardedPort(_port);
        _port.Start();

        logger.LogInformation(
            "SSH tunnel UP: {LocalHost}:{LocalPort} -> {RemoteHost}:{RemotePort} via {SshHost}:{SshPort}",
            _opt.LocalHost, _opt.LocalPort, _opt.RemoteHost, _opt.RemotePort, _opt.SshHost, _opt.SshPort);
    }

    public override Task StopAsync(CancellationToken cancellationToken)
    {
        SafeStop();
        return base.StopAsync(cancellationToken);
    }

    private void SafeStop()
    {
        try
        {
            if (_port is { IsStarted: true })
                _port.Stop();
        }
        catch { /* ignore */ }

        try
        {
            if (_ssh is { IsConnected: true })
                _ssh.Disconnect();
        }
        catch { /* ignore */ }

        try { _port?.Dispose(); } catch { /* ignore */ }
        try { _ssh?.Dispose(); } catch { /* ignore */ }

        _port = null;
        _ssh = null;
    }
}