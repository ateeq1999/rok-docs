---
title: Models
description: Define and interact with database models using rok-orm.
---

## Defining a Model

Models represent database tables and are defined with `#[derive(Model)]`:

```rust
use rok_orm::Model;

#[derive(Model)]
#[rok_orm(table = "users")]
struct User {
    id: i64,
    name: String,
    email: String,
    #[rok_orm(column = "created_at")]
    created_at: chrono::DateTime<chrono::Utc>,
    #[rok_orm(column = "updated_at")]
    updated_at: chrono::DateTime<chrono::Utc>,
}
```

## Generating Models

```bash
# Generate a model
rok make:model Post

# With migration
rok make:model Post --migration

# With controller
rok make:model Post --controller

# With full CRUD scaffold
rok make:model Post --resource
```

## Model Attributes

Attribute macros customize model behavior:

| Attribute | Description |
|-----------|-------------|
| `#[rok_orm(table = "...")]` | Custom table name |
| `#[rok_orm(soft_delete)]` | Enable soft deletes |
| `#[rok_orm(timestamps)]` | Auto-manage created_at/updated_at |
| `#[rok_orm(primary_key = "uuid")]` | Custom primary key |
| `#[rok_orm(column = "...")]` | Map field to a column |

## Soft Deletes

Enable soft deletes to preserve records:

```rust
#[derive(Model)]
#[rok_orm(soft_delete)]
struct Post {
    id: i64,
    title: String,
    deleted_at: Option<chrono::DateTime<chrono::Utc>>,
}
```

Soft-deleted records are excluded from normal queries. Use `.with_trashed()` to include them.
