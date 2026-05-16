---
title: ORM Overview
description: Introduction to rok-orm, the Eloquent-inspired ORM for Rust with fluent query building, relationships, and more.
---

## What is rok-orm?

`rok-orm` is a fluent, Eloquent-inspired ORM for Rust built on top of SQLx. It provides an expressive query builder, relationship management, soft deletes, pagination, model hooks, scopes, eager loading, and more.

## Key Features

- **Fluent query builder** — chain methods for readable, type-safe queries
- **Eloquent-like relationships** — `has_many!`, `belongs_to!`, `belongs_to_many!`, polymorphic variants
- **Soft deletes** — preserve records with a `deleted_at` timestamp
- **Automatic timestamps** — managed `created_at`/`updated_at`
- **Pagination** — offset-based, simple, and cursor-based
- **Scopes** — reusable query constraints (global and local)
- **Model observers** — lifecycle hooks for creating, updating, deleting
- **Eager loading** — batch-load relationships to prevent N+1 queries
- **Field casts** — automatic JSON, comma-list, date, UUID conversion
- **Accessors & mutators** — computed getters and setters
- **Read replicas** — read/write splitting support
- **Multi-tenancy** — built-in tenant isolation
- **Raw queries** — escape hatch for complex SQL

## Database Support

| Driver | Feature Flag | Status |
|--------|-------------|--------|
| PostgreSQL | `postgres` | Production-ready (primary target) |
| SQLite | `sqlite` | Development/testing |
| MySQL | `mysql` | Supported |

## Architecture

### Pool-Free Pattern

Rok uses a unique task-local pool pattern. The `OrmLayer` middleware installs a database pool into the task-local scope, so models and queries transparently use it without passing it through function parameters:

```rust
// No pool parameter needed — OrmLayer provides it
let users = User::filter("active", true).get().await?;
let user = User::find(1).await?;
let count = Post::count().await?;
```

### Layer Setup

```rust
use rok_orm::OrmLayer;

Router::new()
    .route("/api", get(handler))
    .layer(OrmLayer::new(pool));  // Injects pool into task-local scope
```

### Manual Pool Access

```rust
use rok_orm::pool;

// Access the current request's pool
let pool = pool::current_pool();

// Try access (returns None if no OrmLayer)
if let Some(pool) = pool::try_current_pool() {
    // Use pool directly
}
```

## Transactions

```rust
use rok_orm::Tx;

Tx::begin().await?;

// All ORM operations within this scope use the transaction
let user = User::create(&payload).await?;
let profile = Profile::create(&profile_payload).await?;

Tx::commit().await?; // or Tx::rollback().await?
```

## Core Components

| Module | Purpose |
|--------|---------|
| `Model` trait | Core trait — `table_name()`, `columns()`, `pk()`, `pk_value()` |
| `PgModel` | Async CRUD for PostgreSQL — `find()`, `create()`, `update()`, `delete()` |
| `ModelQuery` | Fluent query builder — `filter()`, `order_by()`, `limit()`, `get()` |
| `Page<T>` | Paginated result — `items`, `total`, `per_page`, `current_page`, `last_page` |
| `CursorPage<T>` | Cursor-based pagination — `items`, `next_cursor`, `has_more` |
| `GlobalScope` | Automatic query constraints — soft deletes, multi-tenancy |
| `ModelHooks` | Lifecycle callbacks — `creating`, `created`, `updating`, `updated`, etc. |
| `Resource` | API resource transformer — shape JSON responses |

## Quick Start

```rust
use rok_orm::Model;
use rok_orm_macros::Model;

#[derive(Model)]
struct User {
    id: i64,
    name: String,
    email: String,
}

// All users
let users = User::all().await?;

// Filtered
let active = User::filter("active", true).get().await?;

// Single
let user = User::find(1).await?;

// Create
let user = User::create(&serde_json::json!({
    "name": "Alice",
    "email": "alice@example.com",
})).await?;

// Update
user.update(&serde_json::json!({ "name": "Alicia" })).await?;

// Delete
user.delete().await?;
```
