---
title: Authorization
description: Control access to resources using roles, permissions, and policies.
---

## Role-Based Authorization

Require specific roles on routes using the `#[require_role]` macro:

```rust
use rok_auth_macros::require_role;

#[require_role("admin")]
async fn admin_dashboard() -> Json<Dashboard> {
    // Only accessible to admin users
}
```

## Permission-Based Checks

```rust
use rok_acl_macros::require_permission;

#[require_permission("edit-posts")]
async fn update_post(
    Path(id): Path<i64>,
    Valid(payload): Valid<UpdatePostRequest>,
) -> Result<Json<Post>, RokError> {
    // Only users with "edit-posts" permission
}
```

## Policy-Based Authorization

Define authorization policies following the `Policy` trait:

```rust
use rok_bouncer::Policy;

struct PostPolicy;

impl Policy<Post> for PostPolicy {
    fn view(ctx: &Ctx, post: &Post) -> bool {
        ctx.user().id == post.user_id || ctx.has_role("admin")
    }

    fn update(ctx: &Ctx, post: &Post) -> bool {
        ctx.user().id == post.user_id || ctx.has_role("admin")
    }

    fn delete(ctx: &Ctx, post: &Post) -> bool {
        ctx.has_role("admin")
    }
}
```

Use policies in controllers:

```rust
async fn update(
    Ctx(user): Ctx<User>,
    Path(id): Path<i64>,
    Valid(payload): Valid<UpdatePostRequest>,
) -> Result<Json<Post>, RokError> {
    let post = Post::find_or_fail(id).await?;
    ctx.authorize_policy::<PostPolicy>("update", &post)?;
    post.update(&payload).await?;
    Ok(Json(post))
}
```

## Ability Checks

```rust
if ctx.allows(EDIT_POST, &post) {
    // Perform edit
}
```
