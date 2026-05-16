---
title: Validation
description: Validate incoming request data with declarative validation rules and the Valid<T> extractor.
---

## Defining Validators

Use `#[derive(Validate)]` to define validation rules on structs:

```rust
use rok_validate::Validate;
use serde::Deserialize;

#[derive(Deserialize, Validate)]
struct CreateUserRequest {
    #[validate(required, email)]
    email: String,

    #[validate(required, min = 8, max = 128)]
    password: String,

    #[validate(required)]
    name: String,

    #[validate(confirm)]
    password_confirmation: String,

    #[validate(optional, max = 500)]
    bio: Option<String>,

    #[validate(url)]
    website: Option<String>,

    #[validate(numeric, min = 18, max = 120)]
    age: Option<i32>,

    #[validate(min_items = 1, max_items = 5)]
    tags: Vec<String>,
}
```

## Using Valid<T> Extractor

Use `Valid<T>` as an Axum extractor to automatically validate:

```rust
use rok_validate::Valid;

async fn store(
    Valid(payload): Valid<CreateUserRequest>,
) -> Result<Json<User>, RokError> {
    // payload is guaranteed valid at this point
    User::create(&payload).await
}
```

## Validation Rules

### String Rules

| Rule | Description |
|------|-------------|
| `required` | Field must be present and non-empty |
| `optional` | Field may be absent; skip remaining rules if absent |
| `email` | Must be a valid email address (contains `@`, domain has `.`) |
| `url` | Must be a valid URL (starts with `http://` or `https://`) |
| `min = N` | Minimum string length |
| `max = N` | Maximum string length |
| `same = "field"` | Must equal another field |
| `confirmed` | Shorthand for `same(password_confirmation)` |

### Numeric Rules

| Rule | Description |
|------|-------------|
| `numeric` | Must parse as a number |
| `min = N` | Minimum value (inclusive) |
| `max = N` | Maximum value (inclusive) |

### Collection Rules

| Rule | Description |
|------|-------------|
| `min_items = N` | Minimum array length |
| `max_items = N` | Maximum array length |

### Nested Validation

```rust
#[derive(Deserialize, Validate)]
struct Address {
    #[validate(required)]
    street: String,

    #[validate(required)]
    city: String,

    #[validate(required, min = 5, max = 10)]
    zip_code: String,
}

#[derive(Deserialize, Validate)]
struct CreateUserRequest {
    #[validate(required)]
    name: String,

    #[validate(nested)]
    address: Address,

    #[validate(nested)]
    tags: Vec<TagInput>,
}
```

## FormRequest and ValidatedForm

For form submissions:

```rust
use rok_validate::{FormRequest, ValidatedForm};

#[derive(Deserialize, Validate)]
struct ContactForm {
    #[validate(required, email)]
    email: String,

    #[validate(required, min = 10)]
    message: String,
}

async fn submit_contact(
    ValidatedForm(form): ValidatedForm<ContactForm>,
) -> Result<Json<Value>, RokError> {
    // form is validated
    Ok(Json(json!({ "status": "sent" })))
}
```

## Filterable & Sortable

For API query parameters:

```rust
use rok_validate::{Filterable, Sortable};

#[derive(Deserialize, Filterable)]
struct PostFilter {
    #[filter(operator = "eq")]
    published: Option<bool>,

    #[filter(operator = "in")]
    category_id: Option<Vec<i64>>,

    #[filter(operator = "gte")]
    created_after: Option<chrono::NaiveDate>,
}

#[derive(Deserialize, Sortable)]
#[sortable(allowed = "created_at,title,view_count")]
struct PostSort {
    sort: Option<String>,
}

// Combined
async fn list_posts(
    Query(filter): Query<PostFilter>,
    Query(sort): Query<PostSort>,
) -> Result<Json<Vec<Post>>, RokError> {
    let query = Post::query()
        .apply_filters(&filter)
        .apply_sorting(&sort);
    let posts = query.get().await?;
    Ok(Json(posts))
}
```

## Custom Error Responses

Validation errors return structured 422 responses:

```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email field must be a valid email address."],
    "password": ["The password field must be at least 8 characters."],
    "bio": ["The bio field must not exceed 500 characters."]
  }
}
```

## Manual Validation

```rust
use rok_validate::{Validate, ValidationErrors};

struct MyRequest {
    name: String,
    age: i32,
}

impl Validate for MyRequest {
    fn validate(&self) -> Result<(), ValidationErrors> {
        let mut errors = ValidationErrors::new();
        if self.name.is_empty() {
            errors.add("name", "The name field is required.");
        }
        if self.age < 18 {
            errors.add("age", "Must be at least 18.");
        }
        if errors.is_empty() { Ok(()) } else { Err(errors) }
    }
}
```

## SortParam

Parse `?sort=-created_at,email` query parameters:

```rust
use rok_validate::SortParam;

#[derive(Deserialize)]
struct QueryParams {
    sort: SortParam,
}

// GET /posts?sort=-created_at,title
// → [("created_at", false), ("title", true)]
// (false = descending, true = ascending)

// Unknown fields are filtered out when allowlist is provided:
let sp = SortParam::parse("-created_at,injected", &["created_at", "title"]);
// → [("created_at", false)]  // "injected" is removed
```
