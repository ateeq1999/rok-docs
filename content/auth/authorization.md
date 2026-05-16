---
title: Authorization
description: Control access to resources using roles, permissions, policies, and ability checks.
---

## Overview

Rok provides a layered authorization system with multiple approaches:

| Approach | Crate | Granularity | Use Case |
|----------|-------|-------------|----------|
| Role checks | `rok-auth-macros` | Coarse | Route-level admin/editor gates |
| Permission checks | `rok-acl-macros` | Fine | Feature-level access control |
| Policy-based | `rok-bouncer` | Resource-level | Per-object authorization |
| Ability checks | `rok-bouncer` | Mixed | Runtime permission queries |

## Role-Based Authorization

Require specific roles on routes using the `#[require_role]` macro:

```rust
use rok_auth_macros::require_role;

#[require_role("admin")]
async fn admin_dashboard() -> Json<Dashboard> {
    // Only accessible to users with the "admin" role
}

#[require_role("editor")]
async fn create_post(
    Valid(payload): Valid<CreatePostRequest>,
) -> Result<Json<Post>, RokError> {
    // Only editors and above
}
```

The macro expands to check `claims.has_role("admin")` at runtime, returning 403 if the check fails.

## Permission-Based Checks

For fine-grained permissions:

```rust
use rok_acl_macros::require_permission;

#[require_permission("edit-posts")]
async fn update_post(
    Path(id): Path<i64>,
    Valid(payload): Valid<UpdatePostRequest>,
) -> Result<Json<Post>, RokError> {
    // Only users with "edit-posts" permission
}

#[require_permission("delete-users")]
async fn delete_user(
    Path(id): Path<i64>,
) -> Result<Json<MessageResponse>, RokError> {
    // Admin-only operation
}
```

## Multiple Role/Permission Checks

```rust
// User must have ALL specified roles
use rok_auth_macros::require_role;
use rok_acl_macros::require_permission;

#[require_role("admin")]
#[require_permission("manage-billing")]
async def billing_dashboard() -> Json<Billing> {
    // Only admins with billing permissions
}

// Require ANY of the specified abilities
use rok_auth_macros::require_any_ability;

#[require_any_ability("admin", "editor", "moderator")]
async fn moderate_content() -> Json<Content> {
    // Any of the listed roles can access
}
```

## Policy-Based Authorization

Define authorization policies following the `Policy` trait from `rok-bouncer`:

```rust
use rok_bouncer::{Policy, CtxBounceExt};

struct PostPolicy;

impl Policy<Post> for PostPolicy {
    fn view(ctx: &Ctx, post: &Post) -> bool {
        ctx.user().id == post.user_id || ctx.has_role("admin")
    }

    fn create(ctx: &Ctx) -> bool {
        ctx.has_role("author") || ctx.has_role("admin")
    }

    fn update(ctx: &Ctx, post: &Post) -> bool {
        ctx.user().id == post.user_id || ctx.has_role("admin")
    }

    fn delete(ctx: &Ctx, post: &Post) -> bool {
        ctx.has_role("admin")
    }

    fn restore(ctx: &Ctx, post: &Post) -> bool {
        ctx.has_role("admin")
    }

    fn force_delete(ctx: &Ctx, post: &Post) -> bool {
        ctx.has_role("super-admin")
    }
}
```

Use policies in controllers with `authorize_policy`:

```rust
async fn update(
    Ctx(ctx): Ctx<AppState>,
    Path(id): Path<i64>,
    Valid(payload): Valid<UpdatePostRequest>,
) -> Result<Json<Post>, RokError> {
    let post = Post::find_or_fail(id).await?;

    // Returns 403 if policy check fails
    ctx.authorize_policy::<PostPolicy>("update", &post)?;

    post.update(&payload).await?;
    Ok(Json(post))
}

async fn store(
    Ctx(ctx): Ctx<AppState>,
    Valid(payload): Valid<CreatePostRequest>,
) -> Result<Json<Post>, RokError> {
    // Policy without a model instance
    ctx.authorize_policy::<PostPolicy>("create")?;

    let post = Post::create(&payload).await?;
    Ok(Json(post))
}
```

## Ability Checks

Define named abilities and check them at runtime:

```rust
use rok_bouncer::{ability, CtxBounceExt, GuestAbility};

// Define abilities
ability!(EDIT_POST, "edit-post");
ability!(DELETE_POST, "delete-post");
ability!(VIEW_ANALYTICS, "view-analytics");

// Check in handlers
async fn edit_post(
    Ctx(ctx): Ctx<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<Post>, RokError> {
    let post = Post::find_or_fail(id).await?;

    if ctx.allows(EDIT_POST, &post) {
        // User can edit this post
    }

    // For simple checks without a model:
    if ctx.has_ability(VIEW_ANALYTICS) {
        // Show analytics
    }
}
```

## Guest Ability

Define what unauthenticated users can do:

```rust
use rok_bouncer::GuestAbility;

impl GuestAbility for MyGuestPolicy {
    fn allowed_abilities() -> Vec<&'static str> {
        vec!["view-public-posts", "register", "login"]
    }
}
```

## CtxBounceExt Trait

The `CtxBounceExt` trait extends `Ctx` with authorization methods:

```rust
pub trait CtxBounceExt {
    fn authorize_policy<P, M>(&self, action: &str, model: Option<&M>) -> Result<(), RokError>;
    fn authorize_resource(&self, action: &str) -> Result<(), RokError>;
    fn has_role(&self, role: &str) -> bool;
    fn has_ability(&self, ability: &str) -> bool;
    fn allows(&self, ability: &str, model: &impl Policy<M>) -> bool;
}
```

## Middleware Guards

```rust
use rok_auth_macros::require_role;

// Apply to entire route group via middleware
Router::new()
    .route("/admin", get(admin_dashboard))
    .route_layer(RequireRole::new("admin"));
```

## Summary

```
┌─────────────────────────────────────────────┐
│           Authorization Layers               │
├─────────────────────────────────────────────┤
│ 1. AuthLayer          → JWT/session check   │
│ 2. RequireRole        → Role gate           │
│ 3. require_permission → Permission gate     │
│ 4. Policy trait       → Resource ownership  │
│ 5. ability! checks    → Runtime queries      │
└─────────────────────────────────────────────┘
```

Each layer is optional and composable. Start with role checks, add permissions as complexity grows, and use policies for resource ownership.
