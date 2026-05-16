---
title: Access Control Lists
description: Implement fine-grained access control with a database-backed role and permission system.
---

## Overview

The `rok-acl` crate provides a database-backed role and permission system with a 5-table schema. It integrates with the main auth system to provide runtime-manageable access control suitable for admin panels.

### Architecture

```
Users ── role_user ──► Roles ── permission_role ──► Permissions
  │                                                    │
  └──────────── user_permissions ──────────────────────┘
                       (direct overrides)
```

- **Roles** — Named collections of permissions (e.g., "admin", "editor", "viewer")
- **Permissions** — Named access tokens (e.g., "create-posts", "delete-users")
- **`role_user`** — Many-to-many pivot assigning roles to users
- **`permission_role`** — Many-to-many pivot linking permissions to roles
- **`user_permissions`** — Direct permission overrides (bypass role hierarchy)

## Database Schema

```sql
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    guard_name VARCHAR(255) DEFAULT 'api',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    guard_name VARCHAR(255) DEFAULT 'api',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE role_user (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE permission_role (
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (permission_id, role_id)
);

CREATE TABLE user_permissions (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (user_id, permission_id)
);
```

## AclUser Trait

Implement `AclUser` on your User model to enable ACL methods:

```rust
use rok_acl::AclUser;

impl AclUser for User {
    fn user_id(&self) -> i64 {
        self.id
    }
}
```

## Usage

```rust
use rok_acl::AclUser;

// ── Role Management ──

// Assign a role to a user
user.assign_role("editor").await?;

// Assign multiple roles
user.assign_roles(&["editor", "reviewer"]).await?;

// Remove a role
user.remove_role("editor").await?;

// Sync roles (replace all existing)
user.sync_roles(&["admin"]).await?;

// Check if user has a role
user.has_role("admin");
user.has_any_role(&["admin", "editor"]);
user.has_all_roles(&["admin", "editor"]);

// Get all user roles
let roles: Vec<Role> = user.roles().await?;

// ── Permission Management ──

// Grant permission
user.give_permission("edit-posts").await?;

// Grant multiple permissions
user.give_permissions(&["create-posts", "edit-posts"]).await?;

// Check permission
user.can("edit-posts");
user.can_any(&["edit-posts", "delete-posts"]);
user.can_all(&["edit-posts", "view-posts"]);

// Revoke permission
user.revoke_permission("edit-posts").await?;

// Sync permissions (replace all direct permissions)
user.sync_permissions(&["view-posts"]).await?;

// ── Role-Permission Management ──

// Grant permission to role
Role::give_permission_to_role("editor", "edit-posts").await?;

// Revoke permission from role
Role::revoke_permission_from_role("editor", "edit-posts").await?;

// Get all permissions for a role
let perms: Vec<Permission> = Role::permissions("editor").await?;
```

## Attribute Macros

Protect routes declaratively:

```rust
use rok_acl_macros::{require_permission, require_role};

#[require_permission("edit-posts")]
async fn update_post(
    Path(id): Path<i64>,
    Json(payload): Json<UpdatePostRequest>,
) -> Result<Json<Post>, RokError> {
    // Only accessible with direct "edit-posts" permission
}

#[require_role("admin")]
async fn admin_panel() -> Html<&'static str> {
    // Only accessible with "admin" role
}

#[require_any_permission("edit-posts", "edit-own-posts")]
async fn moderate_content(
    Path(id): Path<i64>,
) -> Result<Json<Post>, RokError> {
    // Accessible with EITHER permission
}
```

## Query Scopes

Filter queries by ACL:

```rust
// Get all users with a specific role
let admins = User::roleScope("admin").get().await?;

// Get all users with a direct permission
let editors = User::permissionScope("edit-posts").get().await?;
```

## Dynamic Management

Roles and permissions can be managed at runtime, making them suitable for admin panels where non-developers manage access control:

```rust
// Create a new role
Role::create("moderator").await?;

// Create permissions
Permission::create("moderate-comments").await?;
Permission::create("feature-content").await?;

// Link them
Role::give_permission_to_role("moderator", "moderate-comments").await?;
Role::give_permission_to_role("moderator", "feature-content").await?;

// Assign to user
user.assign_role("moderator").await?;
```

## Permission Resolution Order

When checking `user.can("edit-posts")`:

1. Check direct `user_permissions` table for explicit grant/deny
2. If no direct override, check all roles assigned to user
3. If any role grants the permission via `permission_role`, return `true`
4. Otherwise return `false`

This allows explicit denial (set `granted = false` in `user_permissions`) to override role-based grants.

## Middleware Integration

```rust
use rok_acl::AclMiddleware;

Router::new()
    .route("/admin/users", get(admin_list_users))
    .route_layer(AclMiddleware::require_permission("manage-users"));
```
