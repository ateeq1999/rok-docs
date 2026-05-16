---
title: Cache
description: Improve application performance with Rok's cache facade.
---

## Overview

The `Cache` facade provides a unified API for caching data across multiple backends.

## Drivers

| Driver | Backend | Use Case |
|--------|---------|----------|
| `memory` | DashMap | Single-server, development |
| `redis` | Redis | Distributed, production |

## Basic Usage

```rust
use rok_cache::Cache;

// Store a value
Cache::set("user_count", 42, Duration::from_secs(3600)).await?;

// Retrieve a value
let count: Option<i64> = Cache::get("user_count").await?;

// Remember pattern (get or compute)
let count: i64 = Cache::remember("user_count", Duration::hours(1), || async {
    User::count().await
}).await?;

// Check existence
let exists = Cache::has("user_count").await?;

// Delete
Cache::forget("user_count").await?;

// Flush all
Cache::flush().await?;
```

## Configuration

```env
CACHE_DRIVER=redis
REDIS_URL=redis://localhost:6379
```

## Cache Middleware

The `CacheLayer` middleware provides task-local cache scope, making the cache accessible throughout the request lifecycle without passing references.
