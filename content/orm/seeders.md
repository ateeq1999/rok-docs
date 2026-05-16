---
title: Seeders
description: Populate your database with test data using seeders.
---

## Creating Seeders

```bash
rok make:seeder UserSeeder
```

This creates `src/database/seeders/user_seeder.rs`.

## Writing Seeders

```rust
use rok_orm::Model;

pub async fn run() -> Result<(), RokError> {
    User::create(&serde_json::json!({
        "name": "Admin",
        "email": "admin@example.com",
        "password": hash_password("password"),
    })).await?;

    Ok(())
}
```

## Running Seeders

```bash
# Run all seeders
rok db:seed

# Run specific seeder
rok db:seed --class UserSeeder
```
