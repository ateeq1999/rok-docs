---
title: Rate Limiting
description: Protect your API from abuse with configurable rate limiting middleware.
---

## Overview

`rok-rate-limit` provides throttling middleware with configurable key extraction, limit windows, and per-route granularity. It uses a fixed-window counter algorithm with multiple backend options.

## Configuration

```rust
use rok_rate_limit::RateLimitLayer;
use std::time::Duration;

// Global rate limit: 100 requests per 60 seconds
let rate_limit = RateLimitLayer::new()
    .max_requests(100)
    .per(Duration::from_secs(60));
```

## Key Extraction

Control how the rate limit key is derived:

```rust
// By IP address (default)
RateLimitLayer::new()
    .max_requests(100)
    .per(Duration::from_secs(60))
    .by("ip")

// By user ID (requires authenticated context)
RateLimitLayer::new()
    .max_requests(1000)
    .per(Duration::from_secs(60))
    .by("user")

// By route + IP combination
RateLimitLayer::new()
    .max_requests(50)
    .per(Duration::from_secs(60))
    .by("route:ip")

// Custom key via closure
RateLimitLayer::new()
    .max_requests(100)
    .per(Duration::from_secs(60))
    .by_key(|req| format!("{}:{}", req.uri(), req.method()));
```

## Per-Route Limits

Apply different limits to different endpoints:

```rust
Router::new()
    // Public API: 100 req/min
    .route("/api/posts", get(list_posts))
    .route_layer(
        RateLimitLayer::new()
            .max_requests(100)
            .per(Duration::from_secs(60))
    )

    // Auth endpoints: strict limits
    .route("/auth/login", post(login))
    .route_layer(
        RateLimitLayer::new()
            .max_requests(5)
            .per(Duration::from_secs(60))
    )

    // Admin endpoints: generous limits
    .route("/admin/reports", get(reports))
    .route_layer(
        RateLimitLayer::new()
            .max_requests(500)
            .per(Duration::from_secs(60))
            .by("user")
    );
```

## Response Headers

Limited requests receive rate limit information in response headers:

- `X-RateLimit-Limit` — max requests per window
- `X-RateLimit-Remaining` — remaining requests in the current window
- `X-RateLimit-Reset` — Unix timestamp when the window resets
- `Retry-After` — seconds until the limit resets (when limited)

When the limit is exceeded, the API returns:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/problem+json
Retry-After: 42

{
  "type": "https://httpstatuses.io/429",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Rate limit exceeded. Try again in 42 seconds."
}
```

## Storage Backend

```env
# Rate limit state storage
RATE_LIMIT_DRIVER=memory   # or "redis"
REDIS_URL=redis://localhost:6379
```

## Recommended Limits

| Endpoint | Limit | Window | Reasoning |
|----------|-------|--------|-----------|
| `POST /auth/login` | 5 | 60s | Brute force prevention |
| `POST /auth/register` | 3 | 3600s | Bot registration prevention |
| `POST /auth/password/reset` | 3 | 3600s | Abuse prevention |
| `GET /api/*` | 100 | 60s | Standard API rate |
| `POST /api/*` | 50 | 60s | Mutation throttling |
| Admin endpoints | 500 | 60s | Power user access |
