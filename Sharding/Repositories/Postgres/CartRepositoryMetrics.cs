using Prometheus;

namespace Sharding.Repositories.Postgres;

public static class CartRepositoryMetrics
{
    public static readonly Counter RequestsTotal = Metrics.CreateCounter(
        "cart_repository_requests_total",
        "Total number of requests to CartRepository",
        new CounterConfiguration { LabelNames = ["operation"] });

    public static readonly Summary OperationDuration = Metrics.CreateSummary(
        "cart_repository_operation_duration_seconds",
        "Duration of CartRepository operations in seconds",
        new SummaryConfiguration
        {
            LabelNames = ["operation"],
            Objectives =
            [
                new QuantileEpsilonPair(0.5, 0.05),
                new QuantileEpsilonPair(0.9, 0.01),
                new QuantileEpsilonPair(0.95, 0.01),
                new QuantileEpsilonPair(0.99, 0.001)
            ]
        });

    public static readonly Counter ErrorsTotal = Metrics.CreateCounter(
        "cart_repository_errors_total",
        "Total number of errors in CartRepository",
        new CounterConfiguration { LabelNames = ["operation", "error_type"] });

    public static readonly Gauge ActiveOperations = Metrics.CreateGauge(
        "cart_repository_active_operations",
        "Number of active CartRepository operations",
        new GaugeConfiguration { LabelNames = ["operation"] });

    public static readonly Histogram RowsAffected = Metrics.CreateHistogram(
        "cart_repository_rows_affected",
        "Number of rows affected by CartRepository operations",
        new HistogramConfiguration
        {
            LabelNames = ["operation"],
            Buckets = [0.0, 1.0, 5.0, 10.0, 50.0, 100.0, 500.0]
        });
}
