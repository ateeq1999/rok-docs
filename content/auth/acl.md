---
title: Access Control Lists
description: Implement fine-grained access control with database-backed ACL.
---

## Overview

The `rok-acl` crate provides a database-backed role and permission system with a 5-table schema:

- `roles` — Named roles (e.g., "admin", "editor")
- `permissions` — Named permissions (e.g., "create-posts", "delete-users")
- `role_user` — Many-to-many user-role assignment
- `permission_role` — Many-to-many role-permission assignment
- `user_permissions` — Direct user permission overrides

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
```

## Usage

```rust
// Assign a role
user.assign_role("editor").await?;

// Check if user has role
user.has_role("admin");

// Assign a permission
user.give_permission("edit-posts").await?;

// Check permission
user.can("edit-posts");

// Revoke permission
user.revoke_permission("edit-posts").await?;
```

## Dynamic Management

Roles and permissions can be managed at runtime, making them suitable for admin panels where non-developers manage access control.
