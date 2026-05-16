---
title: Factories
description: Generate test and seed data with model factories using Faker integration.
---

## Creating Factories

```bash
# Generate factory alongside model
rok make:model Post --factory
```

This generates a factory definition stub.

## Defining Factories

Implement the `Factory` trait on your model:

```rust
use rok_orm_factory::Factory;

impl Factory for Post {
    fn definition() -> serde_json::Value {
        serde_json::json!({
            "title": fake::faker::lorem::sentence(6),
            "content": fake::faker::lorem::paragraph(3),
            "published": true,
            "user_id": 1,
        })
    }
}
```

The `definition()` method returns default values for each field. Use `fake` crate functions for realistic random data.

## Using Factories

```rust
// Create a single record with default values
let post = Post::factory().create().await?;

// Create with attribute overrides
let post = Post::factory()
    .with_title("My Custom Post")
    .with_content("Custom content here")
    .with_value("published", false)
    .create()
    .await?;

// Create multiple records
let posts = Post::factory()
    .count(10)
    .create()
    .await?;

// Create and return only the IDs
let ids: Vec<i64> = Post::factory()
    .count(5)
    .create_ids()
    .await?;
```

## Stateful Factories

```rust
impl Factory for User {
    fn definition() -> serde_json::Value {
        serde_json::json!({
            "name": fake::faker::name::name(),
            "email": fake::faker::internet::email(),
            "password": hash_password("password"),
            "role": "user",
        })
    }

    fn states() -> Vec<(&'static str, fn() -> serde_json::Value)> {
        vec![
            ("admin", || serde_json::json!({ "role": "admin" })),
            ("moderator", || serde_json::json!({ "role": "moderator" })),
            ("unverified", || serde_json::json!({ "email_verified_at": null })),
        ]
    }
}

// Usage
let admin = User::factory()
    .state("admin")
    .create()
    .await?;

let unverified = User::factory()
    .state("unverified")
    .with_email("new@example.com")
    .create()
    .await?;
```

## Related Factory Data

```rust
// Create with related models
let post = Post::factory()
    .for_user(&user)              // Sets user_id to user.id
    .create()
    .await?;

// Create parent with children
let (user, posts) = User::factory()
    .has_many(Post::factory().count(3))
    .create()
    .await?;

// Or create separately
let user = User::factory().create().await?;
let posts = Post::factory()
    .count(3)
    .with_user_id(user.id)
    .create()
    .await?;
```

## Faker Integration

Use the `fake` crate for realistic data:

```rust
use fake::faker::{name, internet, lorem, number};

impl Factory for User {
    fn definition() -> serde_json::Value {
        serde_json::json!({
            "name": name::Name().fake::<String>(),
            "email": internet::SafeEmail().fake::<String>(),
            "bio": lorem::Paragraph(2).fake::<String>(),
        })
    }
}
```

## Using Factories in Tests

```rust
#[tokio::test]
async fn test_post_creation() {
    let post = Post::factory()
        .with_title("Test Post")
        .with_value("published", true)
        .create()
        .await?;

    assert_eq!(post.title, "Test Post");
    assert!(post.published);
}
```

## Using Factories in Seeders

```rust
// src/database/seeders/post_seeder.rs
pub async fn run() -> Result<(), RokError> {
    let user = User::factory()
        .state("admin")
        .create()
        .await?;

    Post::factory()
        .count(50)
        .with_user_id(user.id)
        .create()
        .await?;

    Ok(())
}
```
