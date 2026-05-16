---
title: Authentication Overview
description: Understand the Rok authentication system and available authentication methods.
---

## The Auth System

Rok provides a comprehensive authentication and authorization framework built around JWT tokens, with support for multiple authentication strategies.

### Authentication Methods

| Method | Crate | Use Case |
|--------|-------|----------|
| JWT Auth | `rok-auth` | Stateless API authentication (default) |
| Session Auth | `rok-auth-session` | Cookie-based web app auth |
| Social Auth | `rok-auth-social` | OAuth via Google, GitHub, Discord |
| Magic Link | `rok-auth` | Passwordless email authentication |
| HTTP Basic | `rok-auth-basic` | Simple service-to-service auth |

### Auth Flow (JWT)

```
POST /auth/register  ──► Creates user, returns token pair
POST /auth/login     ──► Validates credentials, returns tokens
POST /auth/refresh   ──► Rotates refresh token
POST /auth/logout    ──► Revokes all user tokens
GET  /auth/me        ──► Returns current user from JWT claims
```

## Key Components

- **AuthLayer** — middleware that verifies JWTs on incoming requests
- **Ctx** — extractor that provides the authenticated user context
- **Claims** — JWT payload with user ID, roles, and permissions
- **TokenService** — manages access/refresh token lifecycle

## Configuration

Auth settings are configured in `.env`:

```env
JWT_SECRET=your-256-bit-secret
JWT_TTL=15
JWT_REFRESH_TTL=43200
```
