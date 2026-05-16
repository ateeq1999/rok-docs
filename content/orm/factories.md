---
title: Factories
description: Generate test data with model factories.
---

## Creating Factories

```bash
rok make:model Post --factory
```

This generates a factory definition alongside the model.

## Defining Factories

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

## Using Factories

```rust
// Create one record
let post = Post::factory()
    .with_title("My Post")
    .create()
    .await?;

// Create multiple records
let posts = Post::factory()
    .count(10)
    .create()
    .await?;

// Create with overrides
let post = Post::factory()
    .with_title("Custom Title")
    .with_value("published", false)
    .create()
    .await?;
```
