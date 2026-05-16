---
title: ID Generators
description: Generate unique identifiers using various ID schemes.
---

## Overview

Rok's `rok-ids` crate provides multiple ID generation strategies, each suited to different use cases.

## Available ID Types

| Type | Prefix | Example | Use Case |
|------|--------|---------|----------|
| CUID2 | `c` | `cltyd4x1g0000...` | Collision-resistant, URL-safe |
| ULID | — | `01ARZ3NDEKTSV4RRFFQ69G5FAV` | Sortable, timestamp-prefixed |
| UUIDv7 | — | `018f0e10-9b3a-7...` | Time-ordered UUID |
| Snowflake | — | `718273619284357120` | Distributed sequential IDs |
| NanoID | — | `V1StGXR8_Z5jdHi6B-myT` | Short, URL-safe |

## Usage

```rust
use rok_ids::IdGenerator;

// Generate a CUID2
let id = IdGenerator::cuid2();

// Generate a ULID
let id = IdGenerator::ulid();

// Generate UUIDv7
let id = IdGenerator::uuid7();

// Generate Snowflake
let id = IdGenerator::snowflake();

// Generate NanoID
let id = IdGenerator::nanoid(21);
```

## Model Integration

Use custom ID types in models:

```rust
#[derive(Model)]
#[rok_orm(primary_key = "cuid2")]
struct Post {
    id: String,
    title: String,
}
```
