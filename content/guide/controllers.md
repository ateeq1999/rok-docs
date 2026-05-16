---
title: Controllers
description: Handle HTTP requests with structured, stateless controllers.
---

## Controller Pattern

Controllers in Rok are stateless structs that group related request handlers:

```rust
use axum::{Json, extract::State};
use crate::models::User;

pub struct UserController;

impl UserController {
    pub async fn index(
        State(state): State<AppState>,
    ) -> Json<Vec<User>> {
        let users = User::all().await?;
        Json(users)
    }
}
```

## Generating Controllers

Use the CLI to scaffold controllers:

```bash
# Standard controller
rok make:controller User

# Resource controller (with CRUD methods)
rok make:controller User --resource

# Controller with custom actions
rok make:controller Admin/UserController
```

## Controller Conventions

| Method | Typical Route | Purpose |
|--------|--------------|---------|
| `index` | `GET /resource` | List all records |
| `show` | `GET /resource/:id` | Show one record |
| `store` | `POST /resource` | Create a record |
| `update` | `PUT /resource/:id` | Update a record |
| `destroy` | `DELETE /resource/:id` | Delete a record |

## Extracting Data

Access request data through Axum extractors:

```rust
use axum::{Json, extract::{Path, Query, State}};
use serde::Deserialize;

#[derive(Deserialize)]
struct Pagination {
    page: Option<u32>,
    per_page: Option<u32>,
}

async fn index(
    State(state): State<AppState>,
    Query(pagination): Query<Pagination>,
) -> Json<Vec<Post>> {
    // pagination.page, pagination.per_page
}
```

## Response Types

Controllers return anything implementing `IntoResponse`:

- `Json<T>` for JSON APIs
- `Html<T>` for HTML responses
- `Redirect` for redirects
- `Result<T, RokError>` for fallible handlers
