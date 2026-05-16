---
title: Your First Rok App
description: Build a simple API from scratch to learn the Rok workflow.
---

## Create the Project

```bash
rok new blog-api
cd blog-api
cp .env.example .env
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

## Generate a Controller

```bash
rok make:controller Post --resource
```

This creates `src/app/controllers/post_controller.rs` with CRUD methods.

## Define Routes

In `src/routes/api.rs`:

```rust
use crate::app::controllers::post_controller;
use axum::{routing::get, Router};

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
curl http://localhost:3000/posts
```

## Full CRUD Scaffold

For a complete CRUD setup (model, migration, controller, validator, routes, tests, and factory) in a single command:

```bash
rok make:crud Post
```

This generates all the boilerplate in one step, giving you a fully functional CRUD API.
