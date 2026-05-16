---
title: Queries
description: Build and execute database queries using rok-orm's fluent query builder.
---

## Basic Queries

```rust
// Get all records
let users = User::all().await?;

// Find by primary key
let user = User::find(1).await?;

// Find or fail (404)
let user = User::find_or_fail(1).await?;
```

## Filtering

Chain filter conditions:

```rust
let posts = Post::filter("published", true)
    .filter("author_id", 1)
    .get()
    .await?;
```

Advanced conditions:

```rust
use rok_orm::Condition;

Post::where_condition(Condition::new("views", ">", 100))
    .where_condition(Condition::new("created_at", ">=", last_week))
    .get()
    .await?;
```

## Ordering and Limits

```rust
Post::order_by_desc("created_at")
    .order_by("title")
    .limit(10)
    .offset(20)
    .get()
    .await?;
```

## Aggregates

```rust
let count = Post::filter("published", true).count().await?;
let max = Post::max("views").await?;
let avg = Post::avg("rating").await?;
let exists = Post::filter("slug", "hello-world").exists().await?;
```

## Pagination

```rust
// Standard pagination
let page: Page<Post> = Post::paginate(15).await?;

// Cursor pagination
let page = Post::order_by_desc("id")
    .cursor_paginate(15)
    .await?;
```

## Chunking

Process large datasets in batches:

```rust
Post::chunk(100, |batch| async {
    for post in batch {
        process(post).await;
    }
}).await?;
```
