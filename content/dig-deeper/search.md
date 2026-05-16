---
title: Search
description: Implement full-text search across your models with multiple search engine backends and auto-sync.
---

## Overview

Rok's `rok-search` crate provides full-text search with multiple backend drivers. It supports PostgreSQL's built-in full-text search as well as dedicated search engines (Meilisearch, Typesense).

## Drivers

| Driver | Backend | Description |
|--------|---------|-------------|
| `postgres_fts` | PostgreSQL | Built-in FTS, no extra services, tsvector-based |
| `meilisearch` | Meilisearch | Fast, typo-tolerant, instant faceted search |
| `typesense` | Typesense | Typo-tolerant, faceted, ranked search |

## Defining Searchable Models

```rust
use rok_search::Searchable;
use rok_search_macros::Searchable;

#[derive(Searchable)]
#[rok_search(
    index = "posts",
    fields = "title,content,tags",
    filterable = "published,user_id,category_id",
    sortable = "created_at,updated_at,view_count"
)]
struct Post {
    id: i64,
    title: String,
    content: String,
    tags: String,
    published: bool,
    user_id: i64,
    category_id: i64,
    created_at: chrono::DateTime<chrono::Utc>,
    updated_at: chrono::DateTime<chrono::Utc>,
    view_count: i32,
}
```

### Searchable Attributes

| Attribute | Description |
|-----------|-------------|
| `index` | Search index name |
| `fields` | Comma-separated list of fields to index for search |
| `filterable` | Fields available for filtering |
| `sortable` | Fields available for sorting results |

## Searching

```rust
// Basic search
let results = Post::search("rust programming").await?;
// → Vec<SearchResult<Post>>

// With filters and sorting
let results = Post::search("rust")
    .filter("published", true)
    .filter("category_id", 5)
    .sort_by("created_at", SortOrder::Desc)
    .limit(20)
    .offset(0)
    .execute()
    .await?;

// With typo tolerance
let results = Post::search("rust programing")  // Note typo
    .typo_tolerance(true)
    .execute()
    .await?;

// Faceted search
let results = Post::search("")
    .facets(&["category_id", "published"])
    .execute()
    .await?;
// results.facets contains aggregate counts per facet
```

## Auto-Sync

Search indexes are automatically synchronized via model hooks:

```rust
// Creating a Post → automatically indexed
let post = Post::create(&payload).await?;
// Search index updated automatically

// Updating → re-indexed
post.update(&update_payload).await?;

// Deleting → removed from index
post.delete().await?;
```

## Manual Sync

```bash
# Rebuild a specific search index
rok make:search-index posts

# Rebuild all search indexes
rok make:search-index --all
```

## Per-Driver Configuration

### PostgreSQL FTS

```env
SEARCH_DRIVER=postgres_fts
```

Uses PostgreSQL's `GIN` indexes on `tsvector` columns:

```sql
CREATE INDEX idx_posts_fts ON posts USING GIN(to_tsvector('english', title || ' ' || content));
```

### Meilisearch

```env
SEARCH_DRIVER=meilisearch
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=your-master-key
```

### Typesense

```env
SEARCH_DRIVER=typesense
TYPESENSE_URL=http://localhost:8108
TYPESENSE_API_KEY=your-api-key
```

## SearchResult

```rust
pub struct SearchResult<T> {
    pub items: Vec<T>,
    pub total: u64,
    pub page: u64,
    pub per_page: u64,
    pub facets: Option<HashMap<String, HashMap<String, u64>>>,
}
```
