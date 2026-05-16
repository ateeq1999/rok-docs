---
title: Cache
description: Improve application performance with Rok's cache facade, supporting multiple backends with a unified API.
---

## Overview

The `Cache` facade provides a unified API for caching data across multiple backends. It uses a task-local scope pattern via `CacheLayer` middleware, eliminating the need to pass cache handles through function parameters.

## Drivers

| Driver | Backend | Use Case |
|--------|---------|----------|
| `memory` | DashMap | Single-server, development, testing |
| `redis` | Redis | Distributed, production, multi-server |

## Basic Usage

```rust
use rok_cache::Cache;
use std::time::Duration;

// Store a value with TTL
Cache::set("user_count", 42, Some(Duration::from_secs(3600))).await?;

// Store without expiry (lives until eviction/restart)
Cache::set("config", config_value, None).await?;

// Retrieve a value
let count: Option<i64> = Cache::get("user_count").await?;

// Remember pattern (get or compute and cache)
let count: i64 = Cache::remember("user_count", Duration::from_secs(3600), || async {
    User::count().await
}).await?;

// Check existence
let exists = Cache::has("user_count").await?;

// Delete a key
Cache::forget("user_count").await?;

// Flush all keys
Cache::flush().await?;
```

## Structured Caching

```rust
#[derive(Serialize, Deserialize)]
struct UserProfile {
    id: i64,
    name: String,
    email: String,
}

// Cache any serializable struct
Cache::set("user:123", &profile, Some(Duration::from_secs(300))).await?;

let cached: Option<UserProfile> = Cache::get("user:123").await?;
```

## Namespace Isolation

The `CacheHandle` supports prefix-based namespaces for logical isolation:

```rust
use std::sync::Arc;
use rok_cache::{CacheHandle, Driver, drivers::MemoryDriver};

let user_cache = Arc::new(CacheHandle::new(
    Driver::Memory(MemoryDriver::new()),
    "users:",     // prefix
));

let session_cache = Arc::new(CacheHandle::new(
    Driver::Memory(MemoryDriver::new()),
    "sessions:", // prefix
));

// user_cache.get("abc") → looks up "users:abc"
// session_cache.get("abc") → looks up "sessions:abc"
```

## CacheLayer Middleware

The `CacheLayer` middleware installs the cache into task-local scope, making it accessible throughout the request lifecycle without passing references:

```rust
use rok_cache::{CacheLayer, Cache};

let app = Router::new()
    .route("/users", get(list_users))
    .layer(CacheLayer::new(cache_handle));
```

Without the layer, `Cache::get()` returns `Err(CacheError::NotConfigured)`.

## Configuration

```env
CACHE_DRIVER=redis
REDIS_URL=redis://localhost:6379
```

Programmatic initialization:

```rust
use rok_cache::{CacheHandle, Driver, drivers::{MemoryDriver, RedisDriver}};

// Memory driver (development)
let handle = CacheHandle::new(
    Driver::Memory(MemoryDriver::new()),
    "myapp:",
);

// Redis driver (production)
let handle = CacheHandle::new(
    Driver::Redis(RedisDriver::new("redis://localhost:6379")?),
    "myapp:",
);
```

## CacheError

```rust
pub enum CacheError {
    NotConfigured,     // Cache::get() called outside CacheLayer scope
    Serialization(String),
    Backend(String),
}
```
