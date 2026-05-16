---
title: Middleware
description: Add middleware to your Rok application for cross-cutting concerns.
---

## Built-in Middleware

Rok ships with a comprehensive middleware stack applied globally:

| Middleware | Crate | Purpose |
|-----------|-------|---------|
| TraceLayer | `rok-telemetry` | Request/response logging |
| CorsLayer | `rok-cors` | CORS headers |
| ShieldLayer | `rok-shield` | Security headers |
| CacheLayer | `rok-cache` | Task-local cache scope |
| MailLayer | `rok-mail` | Task-local mail scope |
| OrmLayer | `rok-orm` | Task-local database pool |
| AuthLayer | `rok-auth` | JWT verification |
| RateLimitLayer | `rok-rate-limit` | Rate limiting |

## Middleware Stack Order

Middleware is applied outer-first. The typical order in `main.rs`:

```rust
Router::new()
    .layer(TraceLayer)
    .layer(CorsLayer::new())
    .layer(ShieldLayer::new())
    .layer(CacheLayer)
    .layer(MailLayer)
    .layer(OrmLayer::new(pool))
    .layer(AuthLayer::new(auth_config))
```

## Custom Middleware

Create custom middleware using Tower:

```rust
use axum::{
    middleware::{self, Next},
    extract::Request,
    response::Response,
};

async fn my_middleware(
    request: Request,
    next: Next,
) -> Response {
    println!("Request: {} {}", request.method(), request.uri());
    let response = next.run(request).await;
    println!("Response: {}", response.status());
    response
}
```

Apply it:

```rust
Router::new()
    .route("/", get(handler))
    .layer(middleware::from_fn(my_middleware))
```

## Route-Specific Middleware

Apply middleware only to specific routes:

```rust
Router::new()
    .route("/admin", get(admin_handler))
    .route_layer(middleware::from_fn(require_admin))
```
