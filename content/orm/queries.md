---
title: Queries
description: Build and execute database queries using rok-orm's fluent query builder with filtering, ordering, aggregation, and pagination.
---

## Basic Queries

```rust
// Get all records
let users = User::all().await?;

// Find by primary key
let user = User::find(1).await?;

// Find or fail (returns 404-style error)
let user = User::find_or_fail(1).await?;

// First matching record
let user = User::filter("email", "alice@example.com")
    .first()
    .await?;

// First or fail
let user = User::filter("email", "alice@example.com")
    .first_or_404()
    .await?;

// Check if exists
let exists = User::filter("email", "alice@example.com")
    .exists()
    .await?;
```

## Filtering

```rust
// Simple equality
let posts = Post::filter("published", true)
    .filter("author_id", 1)
    .get()
    .await?;

// Where conditions with operators
use rok_orm::Condition;

let posts = Post::where_condition(Condition::new("views", ">", 100))
    .where_condition(Condition::new("created_at", ">=", last_week))
    .get()
    .await?;

// OR conditions
let posts = Post::where_condition(
    Condition::or()
        .add("status", "=", "published")
        .add("status", "=", "archived")
).get().await?;

// NULL checks
let posts = Post::where_null("deleted_at").get().await?;
let posts = Post::where_not_null("published_at").get().await?;

// IN clause
let posts = Post::where_in("category_id", vec![1, 2, 3]).get().await?;

// BETWEEN
let posts = Post::where_between("created_at", start_date, end_date).get().await?;
```

## Ordering and Limits

```rust
Post::order_by_desc("created_at")   // ORDER BY created_at DESC
    .order_by("title")              // Then ORDER BY title ASC
    .limit(10)                      // LIMIT 10
    .offset(20)                     // OFFSET 20
    .get()
    .await?;

// Random ordering
Post::in_random_order().limit(5).get().await?;

// Latest / oldest
Post::latest().get().await?;        // ORDER BY created_at DESC
Post::oldest().get().await?;        // ORDER BY created_at ASC
```

## Select Specific Columns

```rust
// Select specific columns
let users = User::select(&["id", "name", "email"])
    .get()
    .await?;

// Select with raw expression
let posts = Post::select_raw("id, title, EXTRACT(YEAR FROM created_at) as year")
    .get()
    .await?;
```

## Aggregates

```rust
let count  = Post::filter("published", true).count().await?;
let max    = Post::max("views").await?;
let min    = Post::min("price").await?;
let avg    = Post::avg("rating").await?;
let sum    = Post::sum("views").await?;
let exists = Post::filter("slug", "hello-world").exists().await?;
```

## Pagination

```rust
// Standard pagination (offset-based)
let page: Page<Post> = Post::paginate(15).await?;
// → page.items, page.total, page.per_page, page.current_page, page.last_page

// Simple pagination (no total count)
let simple: SimplePage<Post> = Post::simple_paginate(15).await?;
// → page.items, page.has_more (faster, no COUNT query)

// Cursor pagination (keyset-based, best for large datasets)
let cursor: CursorPage<Post> = Post::order_by_desc("id")
    .cursor_paginate(15)
    .await?;
// → cursor.items, cursor.next_cursor, cursor.has_more

// Pagination with cursor
let next_page = Post::order_by_desc("id")
    .cursor_paginate(15)
    .cursor(after_cursor)
    .await?;
```

## Chunking

Process large datasets in batches to avoid memory issues:

```rust
Post::chunk(100, |batch| async move {
    for post in batch {
        process(post).await;
    }
}).await?;
```

## Joins

```rust
use rok_orm::Join;

let posts = Post::query()
    .join(Join::inner("users", "posts.user_id", "users.id"))
    .where_eq("users.active", true)
    .select(&["posts.*", "users.name as author_name"])
    .get()
    .await?;
```

## Raw SQL

```rust
use rok_orm::{raw_rows, execute_sql, SqlValue};

// Raw SELECT → Vec<PgRow>
let rows = raw_rows(
    "SELECT id, name FROM users WHERE active = $1",
    vec![true.into()],
).await?;

// Raw INSERT/UPDATE/DELETE → rows affected
let affected = execute_sql(
    "UPDATE users SET synced_at = NOW() WHERE active = $1",
    vec![true.into()],
).await?;
```

## Scopes

```rust
use rok_orm::scopes::GlobalScope;

// Local scope (reusable query fragment)
impl Post {
    pub fn scope_published(query: ModelQuery<Self>) -> ModelQuery<Self> {
        query.where_eq("published", true)
    }

    pub fn scope_recent(query: ModelQuery<Self>) -> ModelQuery<Self> {
        query.order_by_desc("created_at").limit(10)
    }
}

// Usage
let posts = Post::query()
    .apply_scope(Post::scope_published)
    .apply_scope(Post::scope_recent)
    .get()
    .await?;

// Global scope (applied automatically to all queries)
struct ActiveUserScope;

impl GlobalScope<User> for ActiveUserScope {
    fn apply(query: ModelQuery<User>) -> ModelQuery<User> {
        query.where_eq("active", true)
    }
}
```
