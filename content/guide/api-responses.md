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

### Basic Examples

```rust
use rok_core::api::{ApiResponse, PaginationMeta};
use axum::response::IntoResponse;

async fn list_users() -> impl IntoResponse {
    let users = User::all().await.unwrap();
    let meta = PaginationMeta::new(42, 1, 15);
    ApiResponse::paginated(users, meta)
}

async fn show_user(Path(id): Path<i64>) -> impl IntoResponse {
    match User::find_by_pk(id).await {
        Ok(Some(user)) => ApiResponse::ok(user).into_response(),
        Ok(None) => ApiResponse::error("E_ROW_NOT_FOUND", "User not found", 404).into_response(),
        Err(e) => ApiResponse::error("E_QUERY_EXCEPTION", e.to_string(), 500).into_response(),
    }
}

async fn create_user(Valid(body): Valid<CreateUserRequest>) -> impl IntoResponse {
    let user = User::create(body.validated()).await.unwrap();
    ApiResponse::created(user)
}

async fn delete_user(Path(id): Path<i64>) -> impl IntoResponse {
    User::delete_by_pk(id).await.unwrap();
    ApiResponse::no_content()
}
```

### In Controllers

When using `#[controller]` decorators, return `ApiResponse` directly:

```rust
#[controller("/users")]
impl UserController {
    #[get("/")]
    async fn index(cx: RequestContext) -> ApiResponse {
        let users = User::all().await.unwrap();
        ApiResponse::paginated(users, PaginationMeta::new(42, 1, 15))
    }

    #[get("/{id}")]
    async fn show(cx: RequestContext, user: ModelBind<User>) -> ApiResponse {
        ApiResponse::ok(user.0)
    }

    #[post("/")]
    async fn store(cx: RequestContext, Valid(body): Valid<CreateUserRequest>) -> ApiResponse {
        let user = User::create(body.validated()).await.unwrap();
        ApiResponse::created(user)
    }

    #[put("/{id}")]
    async fn update(cx: RequestContext, user: ModelBind<User>, Valid(body): Valid<UpdateUserRequest>) -> ApiResponse {
        User::update_by_pk(user.0.id(), body.validated()).await.unwrap();
        ApiResponse::no_content()
    }

    #[delete("/{id}")]
    async fn destroy(cx: RequestContext, user: ModelBind<User>) -> ApiResponse {
        User::delete_by_pk(user.0.id()).await.unwrap();
        ApiResponse::no_content()
    }
}
```

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

The `rok_auth::axum::Response` helper remains available for backward compatibility, but now delegates to `ApiResponse`. New code should use `ApiResponse` directly:

```rust
// Legacy (still works):
Response::json(data);
Response::created(data);
Response::no_content();
Response::error("message", 400);

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
