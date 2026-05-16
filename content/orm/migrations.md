---
title: Migrations
description: Manage database schema changes with SQL-based migrations.
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

Each file must contain `-- UP` and `-- DOWN` sections.

## Creating Migrations

```bash
rok make:migration create_posts_table
```

This generates a timestamped migration file ready for editing.

## Running Migrations

```bash
# Run all pending migrations
rok db:migrate

# Preview without applying
rok db:migrate --dry-run

# View migration status
rok db:status
```

## Rolling Back

```bash
# Roll back the last batch
rok db:rollback

# Roll back multiple batches
rok db:rollback --steps 3

# Drop all tables and re-run all migrations
rok db:fresh
```

## Migration DSL

For programmatic migrations, `rok-orm-migrate` also provides a Rust DSL:

```rust
use rok_orm_migrate::Schema;

Schema::create("users", |table| {
    table.id();
    table.string("name");
    table.string("email").unique();
    table.timestamps();
});
```
