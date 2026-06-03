---
title: Request Lifecycle
description: Intercept HTTP requests before and after handler execution with lifecycle hooks for logging, rate limiting, and validation.
---

## Overview

Request lifecycle hooks allow you to run code **before** and **after** your request handlers. They are useful for cross-cutting concerns like logging, rate limiting, request validation, and response augmentation.

The hooks module is available from `rok-core` under the `api` feature:

```rust
use rok_core::hooks::{
    BeforeHandler, AfterHandler, RequestContext,
    LogRequest, ThrottleInterceptor, HookChain,
};
```

## Traits

### `BeforeHandler`

Runs before the request handler. Return `Ok(())` to proceed, or `Err(ApiResponse)` to short-circuit:

```rust
pub trait BeforeHandler: Send + Sync {
    fn before(&self, cx: &RequestContext) -> Result<(), ApiResponse>;
}
```

### `AfterHandler`

Runs after the request handler. Can inspect and/or modify the response:

```rust
pub trait AfterHandler: Send + Sync {
    fn after(&self, cx: &RequestContext, response: ApiResponse) -> ApiResponse;
}
```

## `RequestContext`

Contextual information about the current request passed to all hooks:

```rust
pub struct RequestContext {
    pub method: Method,
    pub uri: Uri,
    pub ip: Option<IpAddr>,
    pub user_id: Option<i64>,
    pub user_agent: Option<String>,
    pub started_at: Instant,
}
```

Builder methods are available for ergonomic construction:

```rust
let cx = RequestContext::new(method, uri)
    .with_ip(client_ip)
    .with_user_id(user_id)
    .with_user_agent(agent_string);
```

## Built-in Interceptors

### `LogRequest`

Logs each incoming request and its completion using `tracing` (requires the `tracing` feature):

```rust
use rok_core::hooks::LogRequest;

let logger = LogRequest::new();
```

### `ThrottleInterceptor`

In-memory rate limiter keyed by IP address:

```rust
use rok_core::hooks::ThrottleInterceptor;

// Allow max 100 requests per 60 seconds per IP
let throttle = ThrottleInterceptor::new(100, 60);
```

Returns a `429 Too Many Requests` response with code `E_RATE_LIMIT_EXCEEDED` when the limit is exceeded.

### `ValidateBody<T>`

Placeholder interceptor for request body validation. In practice, validation is handled at the handler level via the `Valid<T>` extractor from `rok-validate`:

```rust
use rok_core::hooks::ValidateBody;

let validator = ValidateBody::<CreateUserRequest>::new();
```

## `HookChain`

Compose multiple hooks into a single chain:

```rust
use rok_core::hooks::HookChain;

let chain = HookChain::new()
    .push_before(LogRequest::new())
    .push_before(ThrottleInterceptor::new(100, 60))
    .push_after(LogRequest::new());

// Run all before hooks
chain.run_before(&cx)?;

// Run all after hooks (in reverse order)
let response = chain.run_after(&cx, response);
```

## Best Practices

- Use `LogRequest` early in the chain to capture all requests
- Place `ThrottleInterceptor` before expensive handlers to reject early
- Keep hook implementations stateless where possible; use `Arc` for shared state
- For distributed rate limiting, use a dedicated Redis-backed limiter instead of `ThrottleInterceptor`
