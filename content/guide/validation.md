---
title: Validation
description: Validate incoming request data with declarative validation rules.
---

## Defining Validators

Use `#[derive(Validate)]` to define validation rules on structs:

```rust
use rok_validate::Validate;

#[derive(Deserialize, Validate)]
struct CreateUserRequest {
    #[validate(required)]
    #[validate(email)]
    email: String,

    #[validate(required)]
    #[validate(min = 8)]
    #[validate(max = 128)]
    password: String,

    #[validate(required)]
    name: String,

    #[validate(confirm)]
    password_confirmation: String,
}
```

## Using Valid<T> Extractor

Use `Valid<T>` as an Axum extractor to automatically validate:

```rust
use rok_validate::Valid;

async fn store(
    Valid(payload): Valid<CreateUserRequest>,
) -> Json<User> {
    // payload is already validated
    User::create(&payload).await
}
```

## Validation Rules

| Rule | Description |
|------|-------------|
| `required` | Field must be present and non-empty |
| `optional` | Field may be absent |
| `email` | Must be a valid email address |
| `url` | Must be a valid URL |
| `numeric` | Must be numeric |
| `min` | Minimum value/length |
| `max` | Maximum value/length |
| `same` | Must match another field |
| `confirmed` | Shorthand for `same(password_confirmation)` |

## Custom Error Responses

Validated requests return structured 422 errors:

```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email field must be a valid email address."],
    "password": ["The password field must be at least 8 characters."]
  }
}
```
