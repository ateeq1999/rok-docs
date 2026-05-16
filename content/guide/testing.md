---
title: Testing
description: Write integration tests for your Rok application using TestClient, model factories, and test helpers.
---

## Test Setup

Rok projects are structured for testability. The `src/lib.rs` exports `create_router()`:

```rust
// tests/api/posts_test.rs
use rok_testing::{TestApp, TestClient, TestResponse};
use my_app::create_router;

#[tokio::test]
async fn test_list_posts() {
    let app = TestApp::new(create_router()).await;
    let response = app.get("/api/posts").await;
    assert_eq!(response.status(), 200);
}
```

## TestClient

`TestClient` provides a fluent HTTP testing interface built on `tower::Service`:

```rust
use rok_testing::TestClient;

// GET request
let response = client.get("/api/posts").await;

// GET with query params
let response = client.get("/api/posts?page=1&per_page=20").await;

// POST with JSON body
let response = client
    .post("/api/posts")
    .json(&serde_json::json!({
        "title": "Hello World",
        "content": "My first post",
    }))
    .await;

// POST with form data
let response = client
    .post("/api/login")
    .form(&[("email", "user@example.com"), ("password", "secret")])
    .await;

// With auth header
let response = client
    .get("/api/me")
    .bearer_token("rklive_abc123...")
    .await;
```

## TestResponse

```rust
use rok_testing::TestResponse;

let response: TestResponse = client.get("/api/posts").await;

// Status checks
assert_eq!(response.status(), 200);
assert!(response.status().is_success());
assert!(response.status().is_client_error());

// JSON assertions
assert_json!(response, {
    "title": "Hello World",
});
assert_json_contains!(response, "posts");
assert_json_not_contains!(response, "error");

// Get JSON value
let json: serde_json::Value = response.json().await;
let title = json["title"].as_str().unwrap();

// Header checks
let content_type = response.header("content-type").unwrap();
assert_eq!(content_type, "application/json");

// Status assertion macros
assert_status!(response, 200);
assert_ok!(response);
assert_created!(response);
assert_unauthorized!(response);
assert_forbidden!(response);
assert_not_found!(response);
assert_unprocessable!(response);
```

## TestApp

```rust
use rok_testing::TestApp;

let app = TestApp::new(create_router()).await;

// Get client
let client = app.client();

// Authenticated requests
let response = app
    .acting_as(&user)
    .get("/api/me")
    .await;

// With custom state
let app = TestApp::builder()
    .router(create_router_with_state(custom_state))
    .await
    .build();
```

## Model Factories

Generate test data with factories:

```rust
use rok_orm_factory::Factory;

// Create a single record with default values
let user = User::factory().create().await?;

// Create with attribute overrides
let user = User::factory()
    .with_name("Jane Doe")
    .with_email("jane@example.com")
    .with_value("role", "admin")
    .create()
    .await?;

// Create multiple records
let posts = Post::factory()
    .count(5)
    .with_user_id(user.id)
    .create()
    .await?;

// Create with state (for chained setup)
let (user, posts) = User::factory()
    .has_many(Post::factory().count(3))
    .create()
    .await?;
```

## Testing Auth

```rust
// Test unauthenticated access
#[tokio::test]
async fn test_requires_auth() {
    let client = TestApp::new(create_router()).await.client();
    let response = client.get("/api/admin").await;
    assert_unauthorized!(response);
}

// Test role-based access
#[tokio::test]
async fn test_admin_only() {
    let app = TestApp::new(create_router()).await;
    let admin = User::factory().with_role("admin").create().await?;

    let response = app.acting_as(&admin).get("/api/admin").await;
    assert_ok!(response);
}

// Test with specific permissions
#[tokio::test]
async fn test_permission_check() {
    let user = User::factory()
        .give_permission("edit-posts")
        .create().await?;
}
```

## Running Tests

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_list_posts

# Run tests with database (requires PostgreSQL)
cargo test -- --ignored           # if tests marked #[ignore]
cargo test -- --test-threads=1    # Sequential DB tests

# Run with specific features
cargo test --features "postgres,redis"
```

## Test Database Setup

```rust
// tests/common/mod.rs
use rok_testing::TestApp;
use sqlx::PgPool;

pub async fn setup_test_db() -> PgPool {
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set for integration tests");
    let pool = PgPool::connect(&database_url).await.unwrap();
    sqlx::migrate!().run(&pool).await.unwrap();
    pool
}
```

## Best Practices

- Use `TestApp` for integration tests against the full middleware stack
- Use factories for consistent test data
- Test auth scenarios (unauthenticated, unauthorized, valid)
- Test validation (missing fields, invalid data, boundary values)
- Test error responses (404, 403, 422, 500)
- Use `#[tokio::test]` for async test functions
- Keep tests in `tests/` directory matching module structure
