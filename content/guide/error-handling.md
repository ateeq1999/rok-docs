---
title: Error Handling
description: Handle errors consistently using RokError and RFC 9457 Problem Details.
---

## Unified Error Type

Rok provides `RokError`, a unified error type that merges ORM, auth, validation, and SQLx errors:

```rust
use rok_error::RokError;

async fn get_user(id: i64) -> Result<Json<User>, RokError> {
    let user = User::find(id).await?; // RokError from ORM error
    Ok(Json(user))
}
```

## Problem Details (RFC 9457)

API errors follow RFC 9457 Problem Details format:

```json
{
  "type": "https://example.com/errors/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "The requested user was not found.",
  "instance": "/users/999"
}
```

## Custom Problem Responses

Create problem responses directly:

```rust
use rok_problem::Problem;

return Err(Problem::new()
    .status(StatusCode::NOT_FOUND)
    .title("User not found")
    .detail(format!("No user with ID {}", id))
    .instance(format!("/users/{}", id))
    .into());
```

## Error Handling in Handlers

Controllers return `Result<T, RokError>`, which automatically generates appropriate HTTP responses:

```rust
async fn show(Path(id): Path<i64>) -> Result<Json<User>, RokError> {
    let user = User::find_or_fail(id).await?;
    Ok(Json(user))
}
```

## Not Found Handling

Use `find_or_fail` or first_or_404 for automatic 404 responses:

```rust
let user = User::find_query(id)
    .first_or_404()
    .await?;
```
