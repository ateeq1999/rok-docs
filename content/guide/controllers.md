---
title: Controllers
description: Handle HTTP requests with structured, stateless controllers using the unified RequestContext extractor.
---

## Controller Pattern

Controllers in Rok group related request handlers. Unlike raw Axum, you rarely reach for `State<AppState>` — the [`RequestContext`](/docs/guide/request-lifecycle) (aliased as `Ctx`) bundles pool, auth, request metadata, and response helpers into a single extractor:

```rust
use axum::Json;
use rok_auth::axum::RequestContext;
use rok_core::api::ApiResponse;
use crate::models::User;

pub struct UserController;

impl UserController {
    pub async fn index(ctx: RequestContext) -> ApiResponse {
        let users = User::all().await.unwrap_or_default();
        ctx.ok(serde_json::json!({ "users": users }))
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

Resource controllers are generated with `ApiResponse::ok()`, `ApiResponse::created()`, and correct status codes by default.

## Controller Conventions

| Method | Route | Purpose | Typical Return |
|--------|-------|---------|----------------|
| `index` | `GET /resource` | List all records | `ApiResponse::paginated(...)` or `ctx.ok(...)` |
| `show` | `GET /resource/{id}` | Show one record | `ctx.ok(...)` or `ctx.error("E_ROW_NOT_FOUND", ..., 404)` |
| `store` | `POST /resource` | Create a record | `ctx.created(...)` with `201` |
| `update` | `PUT /resource/{id}` | Update a record | `ctx.ok(...)` |
| `destroy` | `DELETE /resource/{id}` | Delete a record | `ctx.no_content()` with `204` |

## Extracting Data

Rok provides standard Axum extractors plus Rok-specific ones. The `RequestContext` replaces `State<AppState>` entirely — no manual state plumbing:

```rust
use axum::extract::{Path, Query};
use axum::Json;
use rok_auth::axum::RequestContext;
use rok_validate::Valid;

async fn store(
    // Unified context — provides db, auth, request metadata, response helpers
    ctx: RequestContext,

    // Path parameters
    Path(id): Path<i64>,

    // Query parameters
    Query(pagination): Query<Pagination>,

    // JSON body with validation
    Valid(payload): Valid<CreateUserRequest>,

    // Headers
    headers: HeaderMap,
) -> ApiResponse {
    let current_user = ctx.require_auth().unwrap();
    let db = ctx.db();
    ctx.created(serde_json::json!({ "id": id }))
}
```

## Response Helpers

Every `RequestContext` has built-in response helpers so you don't need to import `ApiResponse`:

```rust
async fn show(ctx: RequestContext, Path(id): Path<i64>) -> ApiResponse {
    match User::find_by_pk(id).await {
        Ok(Some(user)) => ctx.ok(serde_json::json!({ "user": user })),
        Ok(None) => ctx.error("E_ROW_NOT_FOUND", "User not found", 404),
        Err(e) => ctx.error("E_DATABASE", e.to_string(), 500),
    }
}

async fn store(ctx: RequestContext, Json(body): Json<CreateUser>) -> ApiResponse {
    // ...
    ctx.created(serde_json::json!({ "user": user }))
}
```

## Response Types

| Type | Use Case |
|------|----------|
| `ApiResponse` | **Recommended** — standard JSON envelope (see [API Responses](/docs/guide/api-responses)) |
| `ctx.ok(data)` / `ctx.created(data)` / `ctx.error(code, msg, status)` | Convenience helpers on `RequestContext` |
| `Json<T>` | Raw JSON responses |
| `Html<T>` | HTML responses |
| `Redirect` | Redirects |
| `Result<T, RokError>` | Fallible handlers with `?` support |

## Authorization

Two approaches work inside controllers:

```rust
// 1. Extractor-based (runs before handler body)
use rok_auth::axum::RequireRole;

async fn index(
    ctx: RequestContext,
    _: RequireRole<Admin>,
) -> ApiResponse {
    ctx.ok(serde_json::json!({ "users": users }))
}

// 2. Inline (conditional or inside handler)
use rok_auth::axum::RequestContext;

async fn search(ctx: RequestContext) -> ApiResponse {
    ctx.require_role::<Admin>().ok();
    // ...
}
```

## Dependency Injection

Define `AppState` with `HasPool` + `HasAuth` traits. The `RequestContext` extractor reads pool and auth from the state automatically:

```rust
#[derive(Clone)]
struct AppState {
    pool: PgPool,
    auth: Arc<Auth>,
}

impl HasPool for AppState {
    fn pool(&self) -> &PgPool { &self.pool }
}
impl HasAuth for AppState {
    fn auth_handle(&self) -> Arc<Auth> { self.auth.clone() }
}
```

No need to extract `State` in handlers — `RequestContext` resolves dependencies from the state type automatically via its `FromRequestParts` implementation.
