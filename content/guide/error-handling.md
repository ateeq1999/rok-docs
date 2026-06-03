---
title: Error Handling
description: Handle errors consistently using RokError, RFC 9457 Problem Details, and automatic HTTP status mapping.
---

## Unified Error Type

Rok provides `RokError`, a unified error type that automatically converts ORM, auth, validation, and SQLx errors into appropriate HTTP responses:

```rust
use rok_error::RokError;

async fn get_user(id: i64) -> Result<Json<User>, RokError> {
    let user = User::find(id).await?; // SQLx RowNotFound → 404
    Ok(Json(user))
}
```

## Error Variants

```rust
#[derive(Debug, Error)]
pub enum RokError {
    #[error("not found")]
    NotFound,                              // → 404 Not Found

    #[error("forbidden")]
    Forbidden,                             // → 403 Forbidden

    #[error("validation failed")]
    Validation(ValidationErrors),          // → 422 Unprocessable Entity

    #[error("auth error: {0}")]
    Auth(AuthError),                       // → 401 or 403

    #[error("database error: {0}")]
    Orm(sqlx::Error),                      // → 500 (404 for RowNotFound)

    #[error("internal server error: {0}")]
    Internal(String),                      // → 500
}
```

### Automatic Conversions

```rust
// SQLx RowNotFound → RokError::NotFound (404)
let user = User::find(1).await?; // Returns RokError if not found

// ValidationErrors → RokError::Validation (422)
Valid(payload): Valid<CreateUser> // Auto 422 on validation failure

// AuthError → RokError::Auth (401/403)
ctx.require_auth()?;            // 401 if unauthenticated
ctx.require_ability("write")?;  // 403 if unauthorized

// String/&str → RokError::Internal (500)
return Err("something went wrong".into());
```

## Response Format

Errors are returned as JSON:

```json
// 404
{ "message": "not found" }

// 403
{ "message": "forbidden" }

// 422
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email field must be a valid email address."],
    "password": ["The password field must be at least 8 characters."]
  }
}

// 401 (Auth)
{ "message": "Invalid token" }

// 500
{ "message": "internal server error" }
```

## Problem Details (RFC 9457)

For detailed API error responses, use `rok-problem`:

```rust
use rok_problem::Problem;

return Err(Problem::new()
    .status(StatusCode::NOT_FOUND)
    .title("User not found")
    .detail(format!("No user with ID {}", id))
    .instance(format!("/api/users/{}", id))
    .extension("user_id", id)
    .into());
```

This produces:

```json
{
  "type": "https://httpstatuses.io/404",
  "title": "User not found",
  "status": 404,
  "detail": "No user with ID 999",
  "instance": "/api/users/999",
  "user_id": 999
}
```

## Error Handling in Handlers

```rust
async fn show(Path(id): Path<i64>) -> Result<Json<User>, RokError> {
    let user = User::find_or_fail(id).await?; // Auto 404
    Ok(Json(user))
}

async fn update(
    Path(id): Path<i64>,
    Valid(payload): Valid<UpdateUserRequest>, // Auto 422
) -> Result<Json<User>, RokError> {
    let user = User::find_or_fail(id).await?;
    ctx.authorize_policy::<UserPolicy>("update", &user)?; // Auto 403
    user.update(&payload).await?;
    Ok(Json(user))
}

async fn admin_only(
    ctx: RequestContext,
) -> Result<Json<Value>, RokError> {
    ctx.require_ability("admin-access")?; // Auto 403
    Ok(Json(json!({ "secret": "data" })))
}

/// Or using role-based authorization inline:
async fn admin_dashboard(
    ctx: RequestContext,
) -> ApiResponse {
    ctx.require_role::<Admin>().ok();
    ctx.ok(serde_json::json!({ "secret": "data" }))
}
```

## Not Found Handling

```rust
// find_or_fail → RokError::NotFound if missing
let user = User::find_or_fail(id).await?;

// first_or_404 on query builder
let user = User::filter("email", "alice@example.com")
    .first_or_404()
    .await?;

// Custom 404 with context
let user = User::find(id).await
    .map_err(|_| Problem::new()
        .status(StatusCode::NOT_FOUND)
        .title("User not found")
        .detail(format!("No user with ID {}", id))
        .into())?;
```

## Standard Error Envelope with `ApiResponse`

For consistent error responses across your application, use `ApiResponse` from `rok-core`:

```rust
use rok_core::api::ApiResponse;

// Generic error
ApiResponse::error("E_BAD_REQUEST", "Invalid input", 400);

// Row not found
ApiResponse::error("E_ROW_NOT_FOUND", "User not found", 404);

// Validation errors
ApiResponse::validation("Validation failed", hashmap!{
    "email" => vec!["is required".into()],
});
```

All errors follow the same envelope:

```json
{
  "error": {
    "code": "E_ROW_NOT_FOUND",
    "message": "User not found",
    "statusCode": 404
  }
}
```

See the [API Responses](/docs/guide/api-responses) guide for full documentation.

## Best Practices

- Return `Result<T, RokError>` from handlers for automatic conversion
- Use `find_or_fail()` for database lookups that should return 404
- Use `authorize_policy()` for resource-level authorization
- Use `Valid<T>` extractor for automatic 422 on validation failure
- Use `Problem` for rich API error responses with extensions
- Wrap unexpected errors with `.map_err(|e| RokError::Internal(e.to_string()))`
