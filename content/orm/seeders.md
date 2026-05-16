---
title: Seeders
description: Populate your database with test and development data using seeders.
---

## Creating Seeders

```bash
# Generate a seeder
rok make:seeder UserSeeder
```

This creates `src/database/seeders/user_seeder.rs`.

## Writing Seeders

```rust
use rok_orm::Model;
use rok_orm_factory::Factory;

// Using factories
pub async fn run() -> Result<(), RokError> {
    User::factory()
        .count(10)
        .create()
        .await?;

    Post::factory()
        .count(50)
        .create()
        .await?;

    Ok(())
}
```

### Manual Seeders

```rust
use rok_orm::Model;

pub async fn run() -> Result<(), RokError> {
    // Create specific records
    User::create(&serde_json::json!({
        "name": "Admin",
        "email": "admin@example.com",
        "password": hash_password("password"),
        "role": "admin",
    })).await?;

    User::create(&serde_json::json!({
        "name": "Editor",
        "email": "editor@example.com",
        "password": hash_password("password"),
        "role": "editor",
    })).await?;

    Ok(())
}
```

## Running Seeders

```bash
# Run all seeders
rok db:seed

# Run a specific seeder
rok db:seed --class UserSeeder

# Run recently created seeder
rok db:seed --class PostSeeder
```

## Seeder with Dependencies

```rust
pub async fn run() -> Result<(), RokError> {
    // Create parent records first
    let admin = User::create(&serde_json::json!({
        "name": "Admin",
        "email": "admin@example.com",
        "role": "admin",
    })).await?;

    let editor = User::create(&serde_json::json!({
        "name": "Editor",
        "email": "editor@example.com",
        "role": "editor",
    })).await?;

    // Create related records
    Post::factory()
        .count(20)
        .with_user_id(admin.id)
        .create()
        .await?;

    Post::factory()
        .count(10)
        .with_user_id(editor.id)
        .with_value("published", false)
        .create()
        .await?;

    Ok(())
}
```

## Database Seeding Strategy

```bash
# Full refresh with seed
rok db:fresh --seed

# This drops all tables, runs all migrations, then seeds:
# 1. DROP ALL TABLES
# 2. RUN ALL MIGRATIONS
# 3. RUN ALL SEEDERS
```

## Best Practices

- Use factories for consistent, repeatable data
- Create seeders that can be run multiple times (idempotent)
- Use `first_or_create` pattern for reference data
- Include seeders for development, test, and staging environments
- Keep sensitive seeds (admin credentials) in environment variables
