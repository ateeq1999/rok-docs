---
title: Telemetry
description: Monitor and observe your application with OpenTelemetry tracing, structured logging, metrics, and health checks.
---

## Overview

Rok's `rok-telemetry` crate provides observability through OpenTelemetry tracing, structured JSON logging, Prometheus metrics, and health check endpoints.

## Tracing

Configure OpenTelemetry tracing with OTLP export:

```rust
use rok_telemetry::Telemetry;

Telemetry::init()
    .service_name("my-app")
    .service_version("1.0.0")
    .service_namespace("production")
    .otlp_endpoint("http://localhost:4317")
    .sample_rate(0.1)              // 10% sampling for high-throughput
    .init();

// Tracing is automatic — spans are created for each request
async fn get_user(id: i64) -> Result<User, RokError> {
    // Create custom spans for business logic
    let span = tracing::info_span!("get_user", user.id = id);
    let _guard = span.enter();
    // ...
}
```

### Span Attributes

```rust
async fn process_order(order_id: i64) -> Result<Order, RokError> {
    // Instrument a function span
    let span = tracing::info_span!(
        "process_order",
        order.id = order_id,
        order.status = field::Empty,
    );
    let _guard = span.enter();

    let order = Order::find(order_id).await?;
    span.record("order.status", &order.status);

    Ok(order)
}
```

## Structured Logging

Logs are output as structured JSON by default, compatible with log aggregators (Datadog, Grafana Loki, ELK, etc.):

```rust
// Info-level logging
tracing::info!("User registered");

// With structured fields
tracing::info!(
    user.email = %email,
    user.id = %user_id,
    "User registered successfully"
);

// Warning
tracing::warn!(
    rate.remaining = %remaining,
    "Rate limit approaching"
);

// Error
tracing::error!(
    error = %e,
    "Database connection failed"
);
```

### JSON Output Format

```json
{
  "timestamp": "2026-05-16T10:30:00Z",
  "level": "INFO",
  "message": "User registered successfully",
  "target": "my_app::handlers",
  "fields": {
    "user.email": "alice@example.com",
    "user.id": "42"
  },
  "span": {
    "name": "POST /auth/register",
    "trace_id": "abc123def456",
    "span_id": "789012"
  }
}
```

## Metrics

```rust
use rok_telemetry::metrics;
use std::time::Instant;

// Counter (how many times something happened)
metrics::counter("http_requests_total", 1);
metrics::counter("http_requests_total", 1, "method" => "GET", "path" => "/api/users");

// Histogram (distribution of values)
let start = Instant::now();
// ... do work ...
metrics::histogram("response_time_ms", start.elapsed().as_millis() as f64);

// Gauge (current value)
metrics::gauge("active_users", current_count);

// Track active connections
metrics::gauge("db_connections", pool_size, "pool" => "primary");
```

### Prometheus

Metrics are exposed at the `/metrics` endpoint for Prometheus scraping:

```bash
curl http://localhost:3000/metrics

# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",path="/api/users"} 1024
http_requests_total{method="POST",path="/auth/login"} 256
# HELP response_time_ms Response time in milliseconds
# TYPE response_time_ms histogram
response_time_ms_bucket{le="10"} 500
response_time_ms_bucket{le="50"} 800
response_time_ms_bucket{le="200"} 950
response_time_ms_sum 45000
response_time_ms_count 1000
```

## Health Checks

```rust
use rok_health::Health;
use std::time::Duration;

Health::new()
    .service_name("my-app")
    .service_version("1.0.0")
    .check("database", || async {
        db.ping().await.map_err(|e| e.to_string())
    })
    .check("cache", || async {
        cache.ping().await.map_err(|e| e.to_string())
    })
    .check("queue", || async {
        queue.ping().await.map_err(|e| e.to_string())
    })
    .with_timeout(Duration::from_secs(5))
    .expose("/health");
```

### Health Check Response

```json
// GET /health
{
  "status": "ok",
  "checks": {
    "database": { "status": "ok", "latency_ms": 2 },
    "cache": { "status": "ok", "latency_ms": 1 },
    "queue": { "status": "ok", "latency_ms": 3 }
  }
}

// During degradation
{
  "status": "degraded",
  "checks": {
    "database": { "status": "ok", "latency_ms": 2 },
    "cache": { "status": "degraded", "latency_ms": 500 },
    "queue": { "status": "ok", "latency_ms": 3 }
  }
}
```

## TelemetryLayer

```rust
use rok_telemetry::TelemetryLayer;

// The layer automatically:
// 1. Creates a root span per request
// 2. Records request method, URI, status code
// 3. Records response time
// 4. Injects trace context into response headers

let app = Router::new()
    .route("/api", get(handler))
    .layer(TelemetryLayer::new());
```

## Configuration

```env
# OTLP endpoint
OTLP_ENDPOINT=http://localhost:4317

# Service identity
OTLP_SERVICE_NAME=my-app
OTLP_SERVICE_VERSION=1.0.0

# Sampling
OTLP_SAMPLE_RATE=0.1

# Log format (json or text)
LOG_FORMAT=json
LOG_LEVEL=info
```
