---
title: API Responses
description: Standardise HTTP JSON responses with the unified ApiResponse envelope for consistent API design.
---

## Standard Response Envelope

All Rok API responses follow a consistent JSON envelope with three top-level keys: `data`, `error`, and `meta`. This ensures predictable response parsing across your entire application.

### Success Responses

```json
// 200 — Single resource
{
  "data": { "id": 1, "name": "Alice" }
}

// 200 — Collection
{
  "data": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
}

// 200 — Paginated collection
{
  "data": [
    { "id": 1, "name": "Alice" }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "perPage": 15,
    "lastPage": 3
  }
}

// 201 — Created
{
  "data": { "id": 1 },
  "meta": { "message": "Resource created" }
}

// 204 — No Content
// (empty body, status only)
```

### Error Responses

```json
// 4xx/5xx — Error
{
  "error": {
    "code": "E_ROUTE_NOT_FOUND",
    "message": "Route not found: GET /api/unknown",
    "statusCode": 404
  }
}

// 422 — Validation failure
{
  "error": {
    "code": "E_VALIDATION_FAILURE",
    "message": "Validation failed. 2 errors.",
    "statusCode": 422,
    "details": {
      "email": ["The email field is required."],
      "password": ["The password must be at least 8 characters."]
    }
  }
}
```

## Using `ApiResponse`

The `ApiResponse` builder is available from `rok-core`:

```rust
use rok_core::api::{ApiResponse, PaginationMeta};
```

### Builder Methods

| Method | HTTP Status | JSON Shape |
|--------|-------------|------------|
| `ApiResponse::ok(data)` | 200 | `{ "data": ... }` |
| `ApiResponse::created(data)` | 201 | `{ "data": ..., "meta": { "message": "Resource created" } }` |
| `ApiResponse::no_content()` | 204 | Empty body |
| `ApiResponse::paginated(data, meta)` | 200 | `{ "data": [...], "meta": {...} }` |
| `ApiResponse::error(code, message, status)` | Custom | `{ "error": { "code", "message", "statusCode" } }` |
| `ApiResponse::validation(message, errors)` | 422 | `{ "error": { "code": "E_VALIDATION_FAILURE", "message", "details": {...} } }` |
| `ApiResponse::from_status(status)` | Custom | Empty body (status only) |

### Accessor Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `response.status_code()` | `StatusCode` | HTTP status code of the response |
| `response.into_body()` | `serde_json::Value` | Consume and return the inner JSON body |

### Basic Examples

```rust
use rok_core::api::{ApiResponse, PaginationMeta};

async fn list_users() -> ApiResponse {
    let users = User::all().await.unwrap_or_default();
    let meta = PaginationMeta::new(42, 1, 15);
    ApiResponse::paginated(users, meta)
}

async fn show_user(Path(id): Path<i64>) -> ApiResponse {
    match User::find_by_pk(id).await {
        Ok(Some(user)) => ApiResponse::ok(user),
        Ok(None) => ApiResponse::error("E_ROW_NOT_FOUND", "User not found", 404),
        Err(e) => ApiResponse::error("E_QUERY_EXCEPTION", e.to_string(), 500),
    }
}

async fn create_user(Json(body): Json<CreateUserRequest>) -> ApiResponse {
    let user = User::create(body).await.unwrap();
    ApiResponse::created(user)
}

async fn delete_user(Path(id): Path<i64>) -> ApiResponse {
    User::delete_by_pk(id).await.unwrap();
    ApiResponse::no_content()
}
```

### Using Response Helpers on `RequestContext`

When using `RequestContext` (the unified extractor), you can skip the `ApiResponse::` prefix — the context itself has response helpers:

```rust
use rok_auth::axum::RequestContext;

async fn index(ctx: RequestContext) -> ApiResponse {
    let users = User::all().await.unwrap_or_default();
    ctx.ok(serde_json::json!({ "users": users }))
}

async fn show(ctx: RequestContext, Path(id): Path<i64>) -> ApiResponse {
    match User::find_by_pk(id).await {
        Ok(Some(user)) => ctx.ok(serde_json::json!({ "user": user })),
        Ok(None) => ctx.error("E_ROW_NOT_FOUND", "User not found", 404),
        Err(e) => ctx.error("E_QUERY_EXCEPTION", e.to_string(), 500),
    }
}

async fn store(ctx: RequestContext, Json(body): Json<CreateUserRequest>) -> ApiResponse {
    let user = User::create(body).await.unwrap();
    ctx.created(serde_json::json!({ "user": user }))
}
```

### Available Context Helpers

| Helper | Equivalent To |
|--------|---------------|
| `ctx.ok(data)` | `ApiResponse::ok(data)` |
| `ctx.created(data)` | `ApiResponse::created(data)` |
| `ctx.no_content()` | `ApiResponse::no_content()` |
| `ctx.error(code, msg, status)` | `ApiResponse::error(code, msg, status)` |
| `ctx.paginated(data, meta)` | `ApiResponse::paginated(data, meta)` |

## PaginationMeta

The `PaginationMeta` struct provides standard pagination metadata:

```rust
pub struct PaginationMeta {
    pub total: i64,     // Total number of records
    pub page: i64,      // Current page number (1-indexed)
    pub per_page: i64,  // Records per page
    pub last_page: i64, // Last page number (calculated)
}

// Construct automatically:
let meta = PaginationMeta::new(42, 1, 15);
// → PaginationMeta { total: 42, page: 1, per_page: 15, last_page: 3 }
```

## Legacy `Response` Helper

The `rok_auth::axum::Response` helper remains available for backward compatibility, but `json()` and `error()` now show `#[deprecated]` warnings directing you to `ApiResponse`. New code should use `ApiResponse` directly:

```rust
// Legacy (still works, with deprecation warnings):
Response::json(data);            // → use ApiResponse::ok()
Response::error("message", 400); // → use ApiResponse::error()

// Other methods (no deprecation):
Response::created(data);
Response::no_content();

// Recommended (new code):
ApiResponse::ok(data);
ApiResponse::created(data);
ApiResponse::no_content();
ApiResponse::error("E_BAD_REQUEST", "message", 400);
```

## `RokCollection` Integration

Collections can be converted directly into an `ApiResponse`:

```rust
use rok_core::RokCollection;

let items = vec![1, 2, 3];
let response = RokCollection::from(items).to_response();
// → ApiResponse::ok([1, 2, 3])
```

## Best Practices

- Always return `ApiResponse` from controllers for consistent API design
- Use `PaginationMeta::new()` for paginated endpoints
- Use `ApiResponse::created()` for 201 responses (POST resources)
- Use `ApiResponse::no_content()` for 204 responses (DELETE)
- Use descriptive error codes following the `E_CONVENTION` pattern
- Validation errors should use `ApiResponse::validation()` with field-level details
