---
title: Project Structure
description: Understand the directory layout and conventions of a Rok project.
---

## Directory Layout

Every Rok project follows a consistent, opinionated structure inspired by MVC frameworks:

```
my-app/
├── Cargo.toml              # Package manifest
├── .env                    # Environment variables
├── .env.example            # Environment variable template
├── Dockerfile               # Multi-stage build
├── docker-compose.yml       # Docker Compose services
├── src/
│   ├── main.rs             # Application entry point
│   ├── lib.rs              # Library root (create_router for tests)
│   ├── state.rs            # AppState (pool, auth, etc.)
│   │
│   ├── app/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # ORM model definitions
│   │   ├── validators/     # Request validation DTOs
│   │   ├── policies/       # Authorization policies
│   │   ├── services/       # Business logic layer
│   │   ├── middleware/     # Custom middleware
│   │   └── events/         # Event structs + listeners
│   │
│   ├── config/             # Config structs
│   ├── routes/             # Route definitions
│   │
│   └── database/
│       └── migrations/     # SQL migration files
│
├── locales/                # i18n translation files
├── tests/                  # Integration tests
└── benches/                # Criterion benchmarks
```

## Key Files

### `src/main.rs`

The application entry point. It:
1. Loads configuration from environment variables
2. Creates the database connection pool
3. Initializes services (auth, cache, mail, etc.)
4. Builds the middleware stack
5. Starts the Axum server

### `src/lib.rs`

Exports `create_router()` for use in integration tests, keeping the test setup clean.

### `src/state.rs`

Defines `AppState`, which implements `HasPool` and `HasAuth` traits for ergonomic access throughout the application.

### `src/routes/`

Contains route definitions using Axum's router, typically organized into `auth.rs`, `api.rs`, and `web.rs` modules.

## Conventions

- **Controllers** are stateless structs with async handler methods
- **Models** use `#[derive(Model)]` with rok-orm for fluent query building
- **Validators** use `#[derive(Validate)]` for declarative request validation
- **Migrations** are SQL files in `database/migrations/`
- **Policies** implement the `Policy<T>` trait for authorization
