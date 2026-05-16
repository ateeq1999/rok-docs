---
title: Relationships
description: Define and query model relationships in rok-orm.
---

## Defining Relationships

Rok provides relationship macros inspired by Eloquent:

```rust
use rok_orm::{Model, has_many, belongs_to};

#[derive(Model)]
struct User {
    id: i64,
    name: String,
    has_many!(posts, Post, "user_id");
    has_one!(profile, Profile, "user_id");
}

#[derive(Model)]
struct Post {
    id: i64,
    user_id: i64,
    title: String,
    belongs_to!(user, User, "user_id");
}
```

## Querying Relationships

```rust
let user = User::find(1).await?;
let posts = user.posts().get().await?;
let author = post.user().first().await?;
```

## Eager Loading

Prevent N+1 queries:

```rust
let posts = Post::with("user")
    .with("comments")
    .get()
    .await?;
```

## Relationship Types

| Macro | Type |
|-------|------|
| `has_many!` | One-to-many |
| `has_one!` | One-to-one |
| `belongs_to!` | Inverse one-to-one/many |
| `belongs_to_many!` | Many-to-many (pivot table) |
| `has_many_through!` | Has-many-through |
| `has_one_through!` | Has-one-through |
| `morph_many!` | Polymorphic one-to-many |
| `morph_one!` | Polymorphic one-to-one |
| `morph_to!` | Inverse polymorphic |

## Many-to-Many

```rust
#[derive(Model)]
struct User {
    id: i64,
    belongs_to_many!(roles, Role, "role_user", "user_id", "role_id");
}
```
