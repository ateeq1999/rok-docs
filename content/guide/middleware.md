---
title: Middleware
description: Add middleware to your Rok application for cross-cutting concerns with built-in and custom options.
---

## Built-in Middleware

Rok ships with a comprehensive middleware stack applied globally:

| Middleware | Crate | Purpose | Required |
|-----------|-------|---------|----------|
| `TraceLayer` | `rok-telemetry` | Request/response tracing, span creation | Recommended |
| `CorsLayer` | `rok-cors` | CORS headers for API responses | APIs |
| `ShieldLayer` | `rok-shield` | Security headers (CSP, HSTS, XFO) | Production |
| `CacheLayer` | `rok-cache` | Task-local cache scope | If using cache |
| `MailLayer` | `rok-mail` | Task-local mail scope | If using mail |
| `NotificationLayer` | `rok-notification` | Task-local notification scope | If using notifications |
| `StorageLayer` | `rok-storage` | Task-local storage scope | If using storage |
| `OrmLayer` | `rok-orm` | Task-local database pool | Required for ORM |
| `AuthLayer` | `rok-auth` | JWT verification + auth context | If using auth |
| `RateLimitLayer` | `rok-rate-limit` | Rate limiting | Production |
| `QueueLayer` | `rok-queue` | Task-local queue scope | If using queue |
| `TelemetryLayer` | `rok-telemetry` | Auto-instrumentation | Recommended |

## Middleware Stack Order

Middleware is applied outer-first. The recommended order:

```rust
Router::new()
    .layer(TraceLayer)              // 1. Tracing (outermost)
    .layer(TelemetryLayer::new())   // 2. Auto-instrumentation
    .layer(CorsLayer::new())        // 3. CORS
    .layer(ShieldLayer::new())      // 4. Security headers
    .layer(RateLimitLayer::new())   // 5. Rate limiting
    .layer(CacheLayer::new(handle)) // 6. Task-local cache
    .layer(MailLayer::new(mailer))  // 7. Task-local mail
    .layer(NotificationLayer::new(ctx)) // 8. Task-local notifications
    .layer(StorageLayer::new(mgr))  // 9. Task-local storage
    .layer(OrmLayer::new(pool))     // 10. Task-local DB pool
    .layer(QueueLayer::new(driver)) // 11. Task-local queue
    .layer(AuthLayer::new(auth));   // 12. Auth (innermost)
```

## Custom Middleware

Create custom middleware using Tower or Axum's `middleware::from_fn`:

```rust
use axum::{
    middleware::{self, Next},
    extract::Request,
    response::Response,
};

// Simple function middleware
async fn request_logger(
    request: Request,
    next: Next,
) -> Response {
    let start = std::time::Instant::now();
    let method = request.method().clone();
    let uri = request.uri().clone();

    let response = next.run(request).await;

    let duration = start.elapsed();
    tracing::info!("{method} {uri} → {} ({:?})", response.status(), duration);
    response
}

// Apply to router
Router::new()
    .route("/", get(handler))
    .layer(middleware::from_fn(request_logger));
```

## Middleware with State

```rust
use axum::{
    extract::{Request, State},
    middleware::Next,
    response::Response,
};

async fn require_admin(
    State(state): State<AppState>,
    request: Request,
    next: Next,
) -> Result<Response, RokError> {
    let ctx = request.extensions().get::<Ctx>().unwrap();
    if !ctx.has_role("admin") {
        return Err(RokError::Forbidden);
    }
    Ok(next.run(request).await)
}
```

## Route-Specific Middleware

```rust
Router::new()
    .route("/admin", get(admin_handler))
    .route_layer(middleware::from_fn(require_admin))

    .route("/api/posts", get(list_posts))
    .route_layer(RateLimitLayer::new()
        .max_requests(30)
        .per(Duration::from_secs(60)));
```

## Tower Layers

Any Tower-compatible layer can be used:

```rust
use tower_http::{
    compression::CompressionLayer,
    decompression::DecompressionLayer,
    timeout::TimeoutLayer,
    set_header::SetResponseHeaderLayer,
};

Router::new()
    .layer(CompressionLayer::new())      // Gzip/Brotli response compression
    .layer(DecompressionLayer::new())     // Decompress requests
    .layer(TimeoutLayer::new(Duration::from_secs(30))) // Request timeout
    .layer(SetResponseHeaderLayer::new(
        header::SERVER,
        header::HeaderValue::from_static("Rok"),
    ));
```
