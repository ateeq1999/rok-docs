---
title: Search
description: Implement full-text search across your models.
---

## Overview

Rok's `rok-search` crate provides full-text search across your database models.

## Defining Searchable Models

```rust
use rok_search::Searchable;
use rok_search_macros::Searchable;

#[derive(Searchable)]
#[rok_search(index = "posts", fields = "title,content")]
struct Post {
    id: i64,
    title: String,
    content: String,
    user_id: i64,
}
```

## Searching

```rust
let results = Post::search("rust programming").await?;
```

## Drivers

| Driver | Backend | Description |
|--------|---------|-------------|
| `postgres_fts` | PostgreSQL | Built-in full-text search |
| `meilisearch` | Meilisearch | Fast, typo-tolerant |
| `typesense` | Typesense | Typo-tolerant, faceted |

## Auto-Sync

Search indexes are automatically synchronized via model hooks — creating, updating, or deleting a searchable model triggers index updates.

## Manual Sync

```bash
rok make:search-index posts  # Rebuild search index
```
