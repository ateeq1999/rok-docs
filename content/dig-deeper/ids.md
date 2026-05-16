---
title: ID Generators
description: Generate unique identifiers using various ID schemes, each suited to different use cases.
---

## Overview

Rok's `rok-ids` crate provides multiple ID generation strategies, each optimized for different constraints (collision resistance, sortability, length, distributed generation).

## Available ID Types

| Type | Prefix | Example | Length | Use Case |
|------|--------|---------|--------|----------|
| CUID2 | `c` | `cltyd4x1g0000jv0h5t1y5n9d` | 24-26 chars | Collision-resistant, URL-safe, prefix identifies type |
| ULID | — | `01ARZ3NDEKTSV4RRFFQ69G5FAV` | 26 chars | Sortable, timestamp-prefixed (millisecond precision) |
| UUIDv7 | — | `018f0e10-9b3a-7d40-8a31-c3a2e8d5f912` | 36 chars | Time-ordered UUID (RFC 9562) |
| Snowflake | — | `718273619284357120` | 19 digits | Distributed, sequential, 64-bit |
| NanoID | — | `V1StGXR8_Z5jdHi6B-myT` | 21 chars (configurable) | Short, URL-safe, customizable alphabet |

## Usage

```rust
use rok_ids::IdGenerator;

// Generate a CUID2
let id = IdGenerator::cuid2();
// → "cltyd4x1g0000jv0h5t1y5n9d"

// Generate a ULID
let id = IdGenerator::ulid();
// → "01ARZ3NDEKTSV4RRFFQ69G5FAV"

// Generate UUIDv7
let id = IdGenerator::uuid7();
// → "018f0e10-9b3a-7d40-8a31-c3a2e8d5f912"

// Generate Snowflake (requires node ID)
let id = IdGenerator::snowflake(1);
// → "718273619284357120"

// Generate NanoID with custom length
let id = IdGenerator::nanoid(21);
// → "V1StGXR8_Z5jdHi6B-myT"

// NanoID with custom alphabet
let id = IdGenerator::nanoid_alphabet(12, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
// → "KLMNOPQRSTUV"
```

## Model Integration

Use custom ID types in models:

```rust
#[derive(Model)]
#[rok_orm(primary_key = "cuid2")]
struct Post {
    id: String,      // Auto-generated CUID2
    title: String,
    content: String,
}

#[derive(Model)]
#[rok_orm(primary_key = "ulid")]
struct Event {
    id: String,      // Auto-generated ULID
    event_type: String,
    payload: serde_json::Value,
}

#[derive(Model)]
#[rok_orm(primary_key = "uuid")]
struct User {
    id: Uuid,        // Auto-generated UUIDv7
    name: String,
    email: String,
}
```

## ID Type Comparison

| Feature | CUID2 | ULID | UUIDv7 | Snowflake | NanoID |
|---------|-------|------|--------|-----------|--------|
| Sortable | No | Yes (timestamp) | Yes (timestamp) | Yes (timestamp) | No |
| URL-safe | Yes | Yes | No (dashes) | Yes | Yes |
| Case-sensitive | Yes | Yes | No | N/A | Yes |
| Distributed-safe | Yes | Yes | Yes | Yes (node ID) | Yes |
| Collision resistant | Very high | High | Extremely high | Moderate | Moderate |
| Max ID/s per node | Unlimited | Unlimited | Unlimited | ~4000 | Unlimited |
| Human-readable | Medium | High | Low | High | Medium |

## Timestamp Extraction

ULIDs and UUIDv7 encode their creation timestamp. Rok provides extraction:

```rust
let ulid = IdGenerator::ulid();
let created_at: chrono::DateTime<chrono::Utc> = ulid.timestamp();

let uuid = IdGenerator::uuid7();
let created_at: chrono::DateTime<chrono::Utc> = uuid.timestamp();
```

## Best Practices

- **Use ULID or UUIDv7** when time-ordered sorting is beneficial (e.g., pagination by ID)
- **Use CUID2** for public-facing IDs where unpredictability matters
- **Use Snowflake** for distributed systems needing compact 64-bit IDs
- **Use NanoID** for short, user-friendly IDs (e.g., invite codes, short URLs)
- **UUIDv7** is recommended as a default — standard, time-ordered, universally unique
