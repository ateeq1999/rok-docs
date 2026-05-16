---
title: Migrations
description: Manage database schema changes with SQL-based migrations and an optional Rust DSL.
---

## Overview

Migrations are version-controlled SQL files that manage database schema changes. They live in `database/migrations/` and are run via the `rok` CLI.

## Migration Files

Files follow the naming convention: `{timestamp}_{description}.sql`

```sql
-- database/migrations/20240101000001_create_users_table.sql

-- UP
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DOWN
DROP TABLE IF EXISTS users;
```

Each file must contain:
- `-- UP` section — the forward migration
- `-- DOWN` section — the rollback (can be empty for irreversible migrations)

## Creating Migrations

```bash
# Generate a timestamped migration file
rok make:migration create_posts_table

# Naming conventions:
rok make:migration add_status_to_users
rok make:migration create_orders_table
rok make:migration add_foreign_key_columns
rok make:migration create_password_resets_table
```

## Running Migrations

```bash
# Run all pending migrations
rok db:migrate

# Preview without applying
rok db:migrate --dry-run

# Run with progress output (pending count, before/after stats, colored)
rok db:update
rok db:update --dry-run

# Show migration status
rok db:status
```

## Rolling Back

```bash
# Roll back the last batch
rok db:rollback

# Roll back N batches
rok db:rollback --step 3

# Drop all tables and re-run all migrations (dev only)
rok db:fresh

# Fresh with seeders
rok db:fresh --seed

## Introspection

```bash
# Introspect a database table → generate model struct
rok db:pull users

# Diff a model struct against the actual schema
rok db:diff Post
```
```

## Migration DSL (Rust)

`rok-orm-migrate` also provides a Rust DSL for programmatic migrations:

```rust
use rok_orm_migrate::{MigrationRunner, Schema, TableBuilder, FileSource};
use sqlx::PgPool;

let runner = MigrationRunner::new(pool)
    .source(FileSource::new("./migrations"))
    .source(rok_auth::migrations());  // Auth crate's embedded migrations

runner.run().await?;
```

### Schema Builder

```rust
use rok_orm_migrate::Schema;

// Create table
Schema::create("users", |table| {
    table.id();                              // BIGSERIAL PRIMARY KEY
    table.string("name").nullable(false);
    table.string("email").unique().nullable(false);
    table.timestamps();                      // created_at, updated_at
    table.soft_deletes();                    // deleted_at
}).await?;

// Alter table
Schema::table("users", |table| {
    table.add_column("phone").string().nullable();
    table.add_column("status").string().default("active");
    table.drop_column("legacy_field");
    table.rename_column("fullname", "name");
}).await?;

// Drop table
Schema::drop("old_table").await?;

// Create index
Schema::create_index("users", "idx_users_email", "email").await?;
```

### Column Types

| Method | SQL Type |
|--------|----------|
| `table.id()` | `BIGSERIAL PRIMARY KEY` |
| `table.string(name)` | `VARCHAR(255)` |
| `table.text(name)` | `TEXT` |
| `table.integer(name)` | `INTEGER` |
| `table.big_int(name)` | `BIGINT` |
| `table.float(name)` | `REAL` |
| `table.double(name)` | `DOUBLE PRECISION` |
| `table.decimal(name, precision, scale)` | `DECIMAL(p, s)` |
| `table.boolean(name)` | `BOOLEAN` |
| `table.date(name)` | `DATE` |
| `table.datetime(name)` | `TIMESTAMPTZ` |
| `table.json(name)` | `JSONB` |
| `table.uuid(name)` | `UUID` |
| `table.foreign_id(name)` | `BIGINT` (convention: `user_id`) |

### Column Modifiers

| Method | Description |
|--------|-------------|
| `.nullable(false)` | `NOT NULL` |
| `.nullable(true)` | `NULL` |
| `.default(value)` | `DEFAULT value` |
| `.unique()` | `UNIQUE` constraint |
| `.primary()` | Primary key |
| `.unsigned()` | `UNSIGNED` (MySQL) |
| `.after(column)` | Position after column (MySQL) |

## Embedded Migrations

Crates can embed their own migrations:

```rust
static MIGRATIONS: &[EmbeddedMigration] = &[
    EmbeddedMigration {
        name: "001_create_tokens",
        up: include_str!("../migrations/001_create_tokens.sql"),
        down: "DROP TABLE IF EXISTS tokens;",
    },
];

pub fn migrations() -> EmbeddedMigrations {
    EmbeddedMigrations::new(MIGRATIONS)
}
```

## Migration Status

```bash
rok db:status
```

Shows:
```
Migration                                      Batch   Status
───────────────────────────────────────────────────────────────
20240101000001_create_users_table               1       Ran
20240101000002_create_posts_table               1       Ran
20240102000001_add_status_to_users              2       Ran
20240103000001_create_comments_table             —       Pending
```
