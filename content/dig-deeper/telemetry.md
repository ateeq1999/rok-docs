---
title: Telemetry
description: Monitor and observe your application with OpenTelemetry and structured logging.
---

## Overview

Rok's `rok-telemetry` crate provides observability through OpenTelemetry tracing, structured logging, and metrics.

## Tracing

```rust
use rok_telemetry::Telemetry;

Telemetry::init()
    .service_name("my-app")
    .service_version("1.0.0")
    .otlp_endpoint("http://localhost:4317")
    .init();

// Tracing is automatic via tracing crate
async fn get_user(id: i64) -> Result<User, RokError> {
    let span = tracing::info_span!("get_user", user.id = id);
    let _guard = span.enter();
    // ...
}
```

## Structured Logging

```rust
tracing::info!("User registered");
tracing::warn!("Rate limit approaching");
tracing::error!("Database connection failed");
```

Logs are output as structured JSON by default, compatible with log aggregators.

## Metrics

```rust
use rok_telemetry::metrics;

metrics::counter("http_requests_total", 1);
metrics::histogram("response_time_ms", duration.as_millis() as f64);
metrics::gauge("active_users", current_count);
```

## Prometheus

Metrics are exposed at the `/metrics` endpoint for Prometheus scraping.

## Health Checks

```rust
use rok_health::Health;

Health::new()
    .check("database", || db.ping())
    .check("cache", || cache.ping())
    .expose("/health");
```
