---
title: Project Structure
description: Understand the directory layout and conventions of a Rok project.
---

## Directory Layout

Every Rok project follows a consistent, opinionated structure inspired by MVC frameworks:

```
my-app/
├── Cargo.toml                       # Package manifest with workspace dependencies
├── Cargo.lock
├── .env                             # Environment variables (git-ignored)
├── .env.example                     # Environment variable template
├── Dockerfile                       # Multi-stage Docker build
├── docker-compose.yml               # Docker Compose (app + postgres + redis)
├── .gitignore
├── .prettierrc                      # Code formatting config
│
├── src/
│   ├── main.rs                      # Application entry point
│   ├── lib.rs                       # Library root, exports create_router()
│   ├── state.rs                     # AppState with HasPool + HasAuth
│   │
│   ├── app/
│   │   ├── mod.rs                   # App module root
│   │   ├── controllers/             # Request handlers
│   │   │   ├── mod.rs
│   │   │   ├── auth_controller.rs
│   │   │   └── user_controller.rs
│   │   ├── models/                  # ORM model definitions
│   │   │   ├── mod.rs
│   │   │   ├── user.rs
│   │   │   └── post.rs
│   │   ├── validators/              # Request validation DTOs
│   │   │   ├── mod.rs
│   │   │   ├── auth_requests.rs
│   │   │   └── user_requests.rs
│   │   ├── policies/                # Authorization policies (Policy trait)
│   │   │   ├── mod.rs
│   │   │   └── user_policy.rs
│   │   ├── services/                # Business logic layer
│   │   │   ├── mod.rs
│   │   │   └── token_service.rs
│   │   ├── middleware/              # Custom middleware
│   │   │   ├── mod.rs
│   │   │   └── auth.rs
│   │   └── events/                  # Event structs + listeners
│   │       ├── mod.rs
│   │       ├── auth_events.rs
│   │       └── user_events.rs
│   │
│   ├── config/                      # Typed config structs
│   │   ├── mod.rs
│   │   ├── app.rs
│   │   ├── auth.rs
│   │   └── database.rs
│   │
│   ├── routes/                      # Route definitions
│   │   ├── mod.rs
│   │   ├── api.rs
│   │   ├── auth.rs
│   │   └── web.rs
│   │
│   └── database/
│       └── migrations/              # SQL migration files
│           ├── 20240101_create_users_table.sql
│           └── 20240102_create_posts_table.sql
│
├── locales/                         # i18n JSON translation files
│   ├── en.json
│   └── es.json
│
├── storage/                         # Local file storage (git-ignored)
│   └── app/
│       └── public/
│
├── tests/                           # Integration tests
│   ├── common/
│   │   └── mod.rs                   # Test helpers, TestApp setup
│   ├── auth.rs
│   ├── users.rs
│   └── health.rs
│
└── benches/                         # Criterion benchmarks
    ├── validate.rs
    ├── query_builder.rs
    └── middleware_stack.rs
```

## Key Files

### `src/main.rs`

The application entry point. It:
1. Loads `.env` via `dotenvy`
2. Creates `AppConfig::load()` from env vars
3. Creates the database connection pool (`PgPool`)
4. Initializes services (auth, cache, mail, queue, storage)
5. Registers embedded migrations (`rok_auth::migrations()` + project migrations)
6. Builds the middleware stack with `AuthLayer`, `CorsLayer`, `ShieldLayer`, etc.
7. Starts the Axum server on the configured host/port

### `src/lib.rs`

Exports `create_router()` — the router factory used in both `main.rs` and integration tests. This ensures tests use exactly the same middleware stack as production.

### `src/state.rs`

Defines `AppState`, which implements `HasPool` and `HasAuth` traits for ergonomic access via the `Ctx` extractor throughout the application.

### `src/routes/`

Contains route definitions using Axum's router, typically organized into modules:
- `auth.rs` — authentication endpoints (login, register, refresh, logout)
- `api.rs` — protected API resource routes
- `web.rs` — optional HTML/SSR routes

## Conventions

- **Controllers** are stateless structs with async handler methods grouped by resource
- **Models** use `#[derive(Model)]` with rok-orm for fluent query building
- **Validators** use `#[derive(Validate)]` for declarative request validation with Axum's `Valid<T>` extractor
- **Migrations** are SQL files in `database/migrations/` with `-- UP` and `-- DOWN` sections
- **Policies** implement the `Policy<T>` trait for resource-level authorization
- **Services** contain business logic extracted from controllers
- **Events** follow the `Event` derive + `Listener` trait pattern
- **Config** uses `#[derive(Config)]` with `#[env("KEY")]` attributes
