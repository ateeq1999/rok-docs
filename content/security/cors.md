---
title: CORS
description: Configure Cross-Origin Resource Sharing for your API with fine-grained control.
---

## Overview

Rok's `rok-cors` crate provides fine-grained CORS control via a Tower middleware layer built on `tower-http`. It allows you to specify allowed origins, methods, headers, and more.

## Basic Configuration

```rust
use rok_cors::{CorsLayer, CorsOrigin};
use std::time::Duration;

let cors = CorsLayer::new()
    .allow_origin("https://myapp.com")
    .allow_methods(["GET", "POST", "PUT", "DELETE", "PATCH"])
    .allow_headers(["Content-Type", "Authorization", "X-Requested-With"])
    .allow_credentials(true)
    .expose_headers(["X-RateLimit-Remaining", "X-Request-Id"])
    .max_age(Duration::from_secs(86400));
```

## Multiple Origins

```rust
let cors = CorsLayer::new()
    .allow_origin(CorsOrigin::list([
        "https://app.example.com",
        "https://admin.example.com",
        "https://dashboard.example.com",
    ]));
```

## Origin Matching

```rust
// Allow any subdomain
let cors = CorsLayer::new()
    .allow_origin(CorsOrigin::matching(|origin: &str| {
        origin.ends_with(".example.com")
    }));

// Allow all (development only)
let cors = CorsLayer::new()
    .allow_origin(CorsOrigin::any());
```

## Per-Route CORS

Apply different CORS policies to different route groups:

```rust
Router::new()
    .route("/api/public", get(public_handler))
    .layer(CorsLayer::new().allow_origin(CorsOrigin::any()))

    .route("/api/admin", get(admin_handler))
    .layer(CorsLayer::new()
        .allow_origin("https://admin.example.com")
        .allow_credentials(true));
```

## Configuration Reference

```rust
pub struct CorsConfig {
    pub allowed_origins: Vec<String>,
    pub allowed_methods: Vec<String>,
    pub allowed_headers: Vec<String>,
    pub expose_headers: Vec<String>,
    pub allow_credentials: bool,
    pub max_age_secs: u64,
}
```

## Preflight Handling

The middleware automatically handles `OPTIONS` preflight requests:

- Responds with appropriate `Access-Control-Allow-*` headers
- Caches preflight response for `max-age` duration
- Validates `Access-Control-Request-Method` and `Access-Control-Request-Headers`

> **Warning:** Wide-open CORS (`CorsOrigin::any()` with credentials allowed) is suitable only for development. Restrict origins in production.
