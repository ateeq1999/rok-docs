---
title: Routing
description: Define routes for your Rok application using Axum's router with Rok extensions.
---

## Route Definition

Rok uses Axum's flexible routing system. Routes are defined in modules under `src/routes/`:

```rust
use axum::{Router, routing::get};

pub fn routes() -> Router {
    Router::new()
        .route("/", get(handler::index))
        .route("/users", get(handler::list))
        .route("/users/:id", get(handler::show))
}
```

## Route Groups

Group related routes under a common prefix:

```rust
Router::new()
    .nest("/api", api::routes())
    .nest("/auth", auth::routes())
```

## Resource Routes

Use the `rok-router` crate for compact resource definitions:

```rust
use rok_router::{routes, resource_routes};

routes! {
    "/posts" => {
        "/"         => { get: list, post: create },
        "/:id"      => { get: show, put: update, delete: destroy },
    }
}
```

## Route Parameters

Path parameters are extracted using Axum's `Path` extractor:

```rust
async fn show(Path(id): Path<i64>) -> Json<Post> {
    // ...
}
```

## Middleware per Route

Apply middleware to specific routes or groups:

```rust
Router::new()
    .route("/admin", get(admin::dashboard))
    .route_layer(middleware::from_fn(require_auth))
```

## Listing Routes

View all registered routes with the CLI:

```bash
rok routes:list
```
