---
title: Routing
description: Define routes for your Rok application using Axum's router with Rok extensions for compact resource definitions.
---

## Route Definition

Rok uses Axum's flexible routing system. Routes are defined in modules under `src/routes/`:

```rust
use axum::{Router, routing::get};

pub fn routes() -> Router {
    Router::new()
        .route("/", get(handler::index))
        .route("/users", get(handler::list))
        .route("/users/{id}", get(handler::show))
}
```

## Route Groups

Nest related routes under a common prefix:

```rust
Router::new()
    .nest("/api/v1", api::v1_routes())
    .nest("/api/v2", api::v2_routes())
    .nest("/auth", auth::routes())
    .nest("/admin", admin::routes())
```

## Resource Routes (rok-router)

Use the `rok-router` crate for compact resource definitions:

```rust
use rok_router::{routes, resource_routes};

// Inline route groups
routes! {
    "/posts" => {
        "/"         => { get: list, post: create },
        "/{id}"     => { get: show, put: update, delete: destroy },
    },
    "/comments" => {
        "/"         => { get: list_comments, post: create_comment },
        "/{id}"     => { get: show_comment, delete: delete_comment },
    }
}

// Resource route macro (generates CRUD automatically)
#[resource_routes]
mod post_routes {
    async fn index() -> Json<Vec<Post>> { /* ... */ }
    async fn show(Path(id): Path<i64>) -> Json<Post> { /* ... */ }
    async fn store(Valid(body): Valid<CreatePost>) -> Json<Post> { /* ... */ }
    async fn update(Path(id): Path<i64>, Valid(body): Valid<UpdatePost>) -> Json<Post> { /* ... */ }
    async fn destroy(Path(id): Path<i64>) -> Json<MessageResponse> { /* ... */ }
}
// Automatically generates: GET /posts, GET /posts/{id}, POST /posts, PUT /posts/{id}, DELETE /posts/{id}
```

## Route Parameters

```rust
use axum::extract::Path;

// Named parameter
async fn show(Path(id): Path<i64>) -> Json<Post> {
    // Matches /users/{id}
}

// Multiple parameters
async fn get_comment(
    Path((post_id, comment_id)): Path<(i64, i64)>,
) -> Json<Comment> {
    // Matches /posts/{post_id}/comments/{comment_id}
}

// Struct extraction
#[derive(Deserialize)]
struct PostParams {
    post_id: i64,
    comment_id: i64,
}

async fn get_comment_struct(
    Path(params): Path<PostParams>,
) -> Json<Comment> {
    // params.post_id, params.comment_id
}
```

## Query Parameters

```rust
use axum::extract::Query;

#[derive(Deserialize)]
struct Pagination {
    page: Option<u32>,
    per_page: Option<u32>,
    sort: Option<String>,
}

async fn list_posts(
    Query(pagination): Query<Pagination>,
) -> Json<Vec<Post>> {
    // GET /posts?page=1&per_page=20&sort=-created_at
}
```

## Middleware per Route

```rust
use axum::middleware;

Router::new()
    .route("/admin", get(admin::dashboard))
    .route_layer(middleware::from_fn(require_auth))

    .route("/api/posts", get(post::list))
    .route_layer(RateLimitLayer::new()
        .max_requests(100)
        .per(Duration::from_secs(60)));
```

## Listing Routes

View all registered routes with the CLI:

```bash
rok routes:list
rok routes:list --json  # Machine-readable format
```

## Fallback Routes

```rust
Router::new()
    .route("/api", get(api_handler))
    .fallback(handler::not_found);
```
