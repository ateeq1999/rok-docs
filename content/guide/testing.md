---
title: Testing
description: Write integration tests for your Rok application using TestClient and model factories.
---

## Test Setup

Rok projects are structured for testability. The `src/lib.rs` exports `create_router()`:

```rust
// tests/api/posts_test.rs
use rok_testing::TestApp;
use my_app::create_router;

#[tokio::test]
async fn test_list_posts() {
    let app = TestApp::new(create_router()).await;
    let response = app.get("/posts").await;
    assert_eq!(response.status(), 200);
}
```

## TestClient

`TestClient` provides a fluent HTTP testing interface:

```rust
let response = app
    .post("/posts")
    .json(&serde_json::json!({
        "title": "Hello",
        "content": "World"
    }))
    .await;

assert_eq!(response.status(), 201);
assert_json!(response, {
    "title": "Hello",
});
```

## Model Factories

Generate test data with factories:

```rust
use rok_orm_factory::Factory;

let user = User::factory()
    .with_name("Jane Doe")
    .with_email("jane@example.com")
    .create()
    .await;
```

Generate multiple records:

```rust
let posts = Post::factory()
    .count(5)
    .with_user_id(user.id)
    .create()
    .await;
```

## Assertions

```rust
assert_status!(response, 200);
assert_json!(response, {"name": "Jane"});
assert_json_contains!(response, "users");
```

## Running Tests

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_list_posts

# Run with database
cargo test -- --test-threads=1
```
