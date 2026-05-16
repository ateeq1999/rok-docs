---
title: Relationships
description: Define and query model relationships in rok-orm — one-to-one, one-to-many, many-to-many, and polymorphic variants.
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
    belongs_to_many!(roles, Role, "role_user", "user_id", "role_id");
}

#[derive(Model)]
struct Post {
    id: i64,
    user_id: i64,
    title: String,
    belongs_to!(user, User, user_id);
    has_many!(comments, Comment, "post_id");
    morph_many!(tags, Tag, "post", "taggable");
}
```

## Relationship Types

| Macro | Type | Example |
|-------|------|---------|
| `has_many!` | One-to-many | User has many Posts |
| `has_one!` | One-to-one | User has one Profile |
| `belongs_to!` | Inverse one-to-one/many | Post belongs to User |
| `belongs_to_many!` | Many-to-many (pivot) | User has many Roles |
| `has_many_through!` | Has-many-through | Country has many Posts via Users |
| `has_one_through!` | Has-one-through | Mechanic has one Car Owner via Cars |
| `morph_many!` | Polymorphic one-to-many | Post has many Comments (also Video has many Comments) |
| `morph_one!` | Polymorphic one-to-one | Post has one Cover Image |
| `morph_many_to_many!` | Polymorphic many-to-many | Post has many Tags (also Video has many Tags) |

## Querying Relationships

```rust
// One-to-many: get related records
let user = User::find(1).await?;
let posts: Vec<Post> = user.posts().get().await?;

// One-to-one: get single related record
let profile: Option<Profile> = user.profile().first().await?;

// Belongs-to: get parent
let post = Post::find(1).await?;
let author: User = post.user().first().await?.unwrap();

// Relationship with additional constraints
let recent_posts = user.posts()
    .where_eq("published", true)
    .order_by_desc("created_at")
    .limit(5)
    .get()
    .await?;
```

## Many-to-Many

```rust
#[derive(Model)]
struct User {
    id: i64,
    belongs_to_many!(roles, Role, "role_user", "user_id", "role_id");
}

// Basic query
let roles: Vec<Role> = user.roles().get().await?;

// With pivot data
let roles = user.roles()
    .with_pivot("assigned_at")   // Include pivot column
    .get()
    .await?;
```

## Polymorphic Relationships

```rust
// MorphMany — multiple models can own the same child type
#[derive(Model)]
struct Comment {
    id: i64,
    body: String,
    commentable_id: i64,        // Polymorphic FK
    commentable_type: String,   // Polymorphic type
}

impl Post {
    // Comments where commentable_type = "post" AND commentable_id = post.id
    morph_many!(comments, Comment, "post", "commentable");
}

impl Video {
    // Comments where commentable_type = "video" AND commentable_id = video.id
    morph_many!(comments, Comment, "video", "commentable");
}

// Usage — same API for both models
let comments: Vec<Comment> = post.comments().get().await?;
let comments: Vec<Comment> = video.comments().get().await?;

// MorphToMany — taggable pattern
impl Post {
    morph_many_to_many!(tags, Tag, "post", "taggables", "taggable", "tag_id");
}

impl Video {
    morph_many_to_many!(tags, Tag, "video", "taggables", "taggable", "tag_id");
}

// Usage
let tags: Vec<Tag> = post.tags().get().await?;
post.tags().attach(tag_id).await?;       // Add tag
post.tags().detach(tag_id).await?;       // Remove tag
post.tags().sync(&[1, 2, 3]).await?;     // Sync to exact set
```

## Eager Loading

Prevent N+1 queries by loading relationships in batch:

```rust
// Eager load single relationship
let posts = Post::with("user").get().await?;
// → 2 queries instead of N+1

// Eager load multiple
let posts = Post::with(&["user", "comments"]).get().await?;

// Nested eager loading
let posts = Post::with("comments.user").get().await?;
// → Loads comments and each comment's author

// Constrained eager loading
let posts = Post::with("comments", |query| {
    query.where_eq("approved", true)
}).get().await?;
```

## Has-Many-Through

```rust
#[derive(Model)]
struct Country {
    id: i64,
    has_many_through!(posts, Post, "users", "country_id", "user_id");
}

// Get all posts by users in this country
let posts: Vec<Post> = country.posts()
    .where_eq("published", true)
    .get()
    .await?;
```

## Attaching / Detaching (Many-to-Many)

```rust
// Attach a role to user
user.roles().attach(role_id).await?;

// Detach a role
user.roles().detach(role_id).await?;

// Sync (replace all related records)
user.roles().sync(&[1, 2, 3]).await?;

// Toggle (attach if not present, detach if present)
user.roles().toggle(&[1, 2]).await?;
```
