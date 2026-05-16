---
title: Your First Rok App
description: Build a simple API from scratch to learn the Rok workflow — from project creation to running CRUD endpoints.
---

## Create the Project

```bash
rok new blog-api
cd blog-api
cp .env.example .env
rok secrets:generate       # Generate secure keys
rok check                  # Verify project structure
```

Edit `.env` to set your `DATABASE_URL`, then run migrations:

```bash
rok db:migrate
```

## Generate a Model with Migration

Let's create a `Post` model with an accompanying migration:

```bash
rok make:model Post --migration
```

This generates:
- `src/app/models/post.rs` — the model struct
- `src/database/migrations/xxxx_create_posts_table.sql` — the migration file

Open the migration file and define the schema:

```sql
-- UP
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DOWN
DROP TABLE IF EXISTS posts;
```

Run the migration:

```bash
rok db:migrate
```

## Define the Model

Open `src/app/models/post.rs`:

```rust
use rok_orm::Model;
use rok_orm_macros::Model;

#[derive(Model)]
struct Post {
    id: i64,
    title: String,
    content: String,
    published: bool,
    created_at: chrono::DateTime<chrono::Utc>,
    updated_at: chrono::DateTime<chrono::Utc>,
}
```

## Generate a Controller

```bash
rok make:controller Post --resource
```

This creates `src/app/controllers/post_controller.rs` with CRUD method stubs.

Open the controller and implement the handlers:

```rust
use axum::{Json, extract::{Path, State}};
use rok_auth::axum::Ctx;
use rok_validate::Valid;
use crate::models::Post;
use crate::validators::post_requests::{CreatePostRequest, UpdatePostRequest};

pub async fn index(
    State(state): State<AppState>,
) -> Result<Json<Vec<Post>>, RokError> {
    let posts = Post::all().await?;
    Ok(Json(posts))
}

pub async fn show(
    Path(id): Path<i64>,
) -> Result<Json<Post>, RokError> {
    let post = Post::find_or_fail(id).await?;
    Ok(Json(post))
}

pub async fn store(
    Ctx(ctx): Ctx<AppState>,
    Valid(payload): Valid<CreatePostRequest>,
) -> Result<(StatusCode, Json<Post>), RokError> {
    let post = Post::create(&payload).await?;
    Ok((StatusCode::CREATED, Json(post)))
}

pub async fn update(
    Path(id): Path<i64>,
    Valid(payload): Valid<UpdatePostRequest>,
) -> Result<Json<Post>, RokError> {
    let post = Post::find_or_fail(id).await?;
    post.update(&payload).await?;
    Ok(Json(post))
}

pub async fn destroy(
    Path(id): Path<i64>,
) -> Result<StatusCode, RokError> {
    let post = Post::find_or_fail(id).await?;
    post.delete().await?;
    Ok(StatusCode::NO_CONTENT)
}
```

## Define Validation

Create a validator for request data:

```rust
// src/app/validators/post_requests.rs
use rok_validate::Validate;
use serde::Deserialize;

#[derive(Deserialize, Validate)]
pub struct CreatePostRequest {
    #[validate(required, min = 1, max = 255)]
    pub title: String,

    #[validate(required, min = 1)]
    pub content: String,

    #[validate(optional)]
    pub published: Option<bool>,
}

#[derive(Deserialize, Validate)]
pub struct UpdatePostRequest {
    #[validate(optional, min = 1, max = 255)]
    pub title: Option<String>,

    #[validate(optional, min = 1)]
    pub content: Option<String>,

    #[validate(optional)]
    pub published: Option<bool>,
}
```

## Define Routes

In `src/routes/api.rs`:

```rust
use crate::app::controllers::post_controller;
use axum::{routing::{get, post, put, delete}, Router};

pub fn routes() -> Router {
    Router::new()
        .route("/posts", get(post_controller::index))
        .route("/posts", post(post_controller::store))
        .route("/posts/{id}", get(post_controller::show))
        .route("/posts/{id}", put(post_controller::update))
        .route("/posts/{id}", delete(post_controller::destroy))
}
```

## Start the Server

```bash
rok dev
```

Your API is now live at `http://localhost:3000`. Test it:

```bash
# Create a post
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello World","content":"My first post!"}'

# List posts
curl http://localhost:3000/posts

# Get single post
curl http://localhost:3000/posts/1

# Update post
curl -X PUT http://localhost:3000/posts/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'

# Delete post
curl -X DELETE http://localhost:3000/posts/1
```

## Full CRUD Scaffold

For a complete CRUD setup (model, migration, controller, validator, routes, tests, and factory) in a single command:

```bash
rok make:crud Post
```

This generates all the boilerplate in one step, giving you a fully functional CRUD API.
