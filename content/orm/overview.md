---
title: ORM Overview
description: Introduction to rok-orm, the Eloquent-inspired ORM for Rust.
---

## What is rok-orm?

`rok-orm` is a fluent, Eloquent-inspired ORM for Rust built on top of SQLx. It provides an expressive query builder, relationship management, soft deletes, pagination, and more.

## Key Features

- **Fluent query builder** — chain methods for readable queries
- **Eloquent-like relationships** — `has_many`, `belongs_to`, `belongs_to_many`, etc.
- **Soft deletes** — preserve records with a `deleted_at` timestamp
- **Automatic timestamps** — managed `created_at`/`updated_at`
- **Pagination** — standard, simple, and cursor-based
- **Scopes** — reusable query constraints
- **Global scopes** — automatic query filtering
- **Model observers** — hooks for lifecycle events
- **Read replicas** — read/write splitting
- **Multi-tenancy** — built-in tenant isolation

## Database Support

| Driver | Feature Flag | Status |
|--------|-------------|--------|
| PostgreSQL | `postgres` | Production-ready |
| SQLite | `sqlite` | Development/testing |
| MySQL | `mysql` | Supported |

## Pool-Free Architecture

Rok uses a unique task-local pool pattern. The `OrmLayer` middleware installs a database pool into the task-local scope, so models and queries transparently use it without passing it through function parameters:

```rust
// No pool parameter needed
let users = User::filter("active", true).get().await?;
```
