---
title: Controllers
description: Handle HTTP requests with structured, stateless controllers using Axum extractors.
---

## Controller Pattern

Controllers in Rok are stateless structs that group related request handlers:

```rust
use axum::{Json, extract::{State, Path, Query}};
use crate::models::User;

pub struct UserController;

impl UserController {
    pub async fn index(
        State(state): State<AppState>,
        Query(pagination): Query<PaginationParams>,
    ) -> Result<Json<Vec<User>>, RokError> {
        let users = User::paginate(pagination.per_page.unwrap_or(15)).await?;
        Ok(Json(users))
    }
}
```

## Generating Controllers

```bash
# Standard controller
rok make:controller User

# Resource controller (CRUD methods scaffolded)
rok make:controller User --resource

# Nested controller
rok make:controller Admin/UserController
```

## Controller Conventions

| Method | Route | Purpose | Typical Return |
|--------|-------|---------|----------------|
| `index` | `GET /resource` | List all records | `Json<Vec<T>>` or paginated |
| `show` | `GET /resource/{id}` | Show one record | `Json<T>` or `404` |
| `store` | `POST /resource` | Create a record | `Json<T>` with `201` |
| `update` | `PUT /resource/{id}` | Update a record | `Json<T>` |
| `destroy` | `DELETE /resource/{id}` | Delete a record | `Json<MessageResponse>` or `204` |

## Extracting Data

Rok provides all standard Axum extractors plus Rok-specific ones:

```rust
use axum::{Json, extract::{Path, Query, State}};
use rok_auth::axum::Ctx;
use rok_validate::Valid;

async fn store(
    // State access
    State(state): State<AppState>,

    // Auth context (requires AuthLayer)
    Ctx(ctx): Ctx<AppState>,

    // Path parameters
    Path(id): Path<i64>,

    // Query parameters
    Query(pagination): Query<Pagination>,

    // JSON body with validation
    Valid(payload): Valid<CreateUserRequest>,

    // Headers
    headers: HeaderMap,
) -> Result<Json<User>, RokError> {
    let current_user = ctx.require_auth()?;
    let db = ctx.db();
    // ...
}
```

## Response Types

Controllers return any type implementing `IntoResponse`:

| Type | Use Case |
|------|----------|
| `Json<T>` | JSON API responses |
| `Html<T>` | HTML responses |
| `Redirect` | Redirects |
| `Result<T, RokError>` | Fallible handlers (auto error conversion) |
| `StatusCode` | Status-only responses |
| `(StatusCode, Json<T>)` | Custom status + body |
| `Response` | Full custom response |

```rust
// Status + body
async fn store(Valid(payload): Valid<CreatePost>) -> Result<(StatusCode, Json<Post>), RokError> {
    let post = Post::create(&payload).await?;
    Ok((StatusCode::CREATED, Json(post)))
}

// Empty success
async fn destroy(Path(id): Path<i64>) -> Result<StatusCode, RokError> {
    Post::find_or_fail(id).await?.delete().await?;
    Ok(StatusCode::NO_CONTENT)
}
```

## Dependency Injection

App state is available through Axum's `State` extractor:

```rust
#[derive(Clone)]
struct AppState {
    pool: PgPool,
    auth: Arc<Auth>,
    config: Arc<AppConfig>,
}

async fn handler(
    State(state): State<AppState>,
) -> Json<Value> {
    // Access any app dependency
    let users = User::all_with_pool(&state.pool).await?;
    Ok(Json(users))
}
```
