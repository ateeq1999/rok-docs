---
title: Models
description: Define and interact with database models using rok-orm's Eloquent-inspired API.
---

## Defining a Model

Models represent database tables and are defined with `#[derive(Model)]`:

```rust
use rok_orm::Model;
use rok_orm_macros::Model;

#[derive(Model)]
#[rok_orm(table = "users")]
struct User {
    id: i64,

    #[rok_orm(column = "full_name")]
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
# Basic model
rok make:model Post

# With migration
rok make:model Post --migration

# With resource controller
rok make:model Post --controller

# With factory
rok make:model Post --factory

# Full CRUD scaffold (model + migration + controller + validator + factory + routes + tests)
rok make:crud Post
```

## Model Attributes

| Attribute | Description |
|-----------|-------------|
| `#[rok_orm(table = "...")]` | Custom table name (default: snake_case plural) |
| `#[rok_orm(column = "...")]` | Map field to a differently-named column |
| `#[rok_orm(soft_delete)]` | Enable soft deletes (requires `deleted_at` field) |
| `#[rok_orm(timestamps)]` | Auto-manage `created_at`/`updated_at` |
| `#[rok_orm(primary_key = "...")]` | Custom primary key type (`uuid`, `cuid2`, `ulid`) |
| `#[rok_orm(guarded)]` | Mass-assignment protection (fields not listed in fillable) |

## Soft Deletes

Enable soft deletes to preserve records instead of hard-deleting:

```rust
#[derive(Model)]
#[rok_orm(soft_delete)]
struct Post {
    id: i64,
    title: String,
    content: String,
    deleted_at: Option<chrono::DateTime<chrono::Utc>>,
}

// Soft delete
post.delete().await?;              // Sets deleted_at

// Include soft-deleted in query
Post::with_trashed().get().await?;

// Only trashed
Post::only_trashed().get().await?;

// Restore
post.restore().await?;

// Force delete (permanent)
post.force_delete().await?;
```

## Accessors & Mutators

```rust
#[derive(Model)]
struct User {
    id: i64,
    first_name: String,
    last_name: String,
}

impl User {
    // Computed getter (accessor)
    accessor!(get_full_name_attribute, &self -> String, {
        format!("{} {}", self.first_name, self.last_name)
    });

    // Setter (mutator)
    mutator!(set_email_attribute, &mut self, val: String, {
        self.email = val.to_lowercase();
    });
}

// Usage
let full_name = user.get_full_name_attribute();
user.set_email_attribute("ALICE@EXAMPLE.COM".to_string());
```

## Model Hooks / Observers

Register lifecycle observers:

```rust
use rok_orm::{observe, ModelHooks};

pub struct UserObserver;

impl ModelHooks<User> for UserObserver {
    fn creating(user: &mut User) {
        user.created_at = chrono::Utc::now();
    }

    fn created(user: &User) {
        // Post-creation logic
    }

    fn updating(user: &mut User) {
        user.updated_at = chrono::Utc::now();
    }

    fn deleting(user: &User) {
        // Pre-deletion logic
    }
}

// Register
observe::<User, UserObserver>();
```

## Casts

Automatically convert between database and Rust types:

```rust
#[derive(Model)]
struct Product {
    id: i64,
    name: String,
    metadata: serde_json::Value,    // Auto JSON cast
    tags: Vec<String>,               // Auto comma-list cast
    price: rust_decimal::Decimal,    // Auto decimal cast
}

// Available cast types:
// CastJson      → serde_json::Value
// CastCommaList → Vec<String>
// CastDate      → chrono::NaiveDate
// CastDatetime  → chrono::DateTime<Utc>
// CastBool      → bool
// CastUuid      → uuid::Uuid
```
