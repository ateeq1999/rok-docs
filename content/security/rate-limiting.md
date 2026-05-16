---
title: Rate Limiting
description: Protect your API from abuse with configurable rate limiting.
---

## Overview

`rok-rate-limit` provides throttling middleware with configurable limits per route or globally.

## Configuration

Apply rate limits via middleware:

```rust
use rok_rate_limit::RateLimitLayer;
use std::time::Duration;

let rate_limit = RateLimitLayer::new()
    .max_requests(100)
    .per(Duration::from_secs(60));
```

## Per-Route Limits

```rust
Router::new()
    .route("/api/posts", get(list_posts))
    .route_layer(
        RateLimitLayer::new()
            .max_requests(30)
            .per(Duration::from_secs(60))
            .by("ip")
    )
```

## Authentication Endpoints

Apply stricter limits to auth routes:

```rust
Router::new()
    .route("/auth/login", post(login))
    .route_layer(
        RateLimitLayer::new()
            .max_requests(5)
            .per(Duration::from_secs(60))
    )
```

## Response Headers

Limited requests receive:
- `X-RateLimit-Remaining` — remaining requests in the window
- `Retry-After` — seconds until the limit resets
- HTTP 429 status code with a problem details response
