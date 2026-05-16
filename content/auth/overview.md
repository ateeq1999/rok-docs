---
title: Authentication Overview
description: Understand the Rok authentication system and all available authentication methods, components, and flows.
---

## The Auth System

Rok provides a comprehensive authentication and authorization framework built around JWT tokens, with support for multiple authentication strategies. The `rok-auth` crate serves as the central auth crate, with satellite crates for specific protocols.

### Authentication Methods

| Method | Crate | Feature Flag | Use Case |
|--------|-------|-------------|----------|
| JWT Auth | `rok-auth` | default | Stateless API authentication (default) |
| Session Auth | `rok-auth-session` | — | Cookie-based web app auth |
| Social Auth | `rok-auth-social` | — | OAuth via Google, GitHub, Discord |
| Magic Link | `rok-auth` | `magic-link` | Passwordless email authentication |
| HTTP Basic | `rok-auth-basic` | — | Simple service-to-service auth |
| TOTP (2FA) | `rok-auth` | default | Time-based one-time passwords |
| Passkeys | `rok-auth` | `passkeys` | WebAuthn/FIDO2 passwordless auth |
| Device Trust | `rok-auth` | `device-trust` | Remember trusted devices to skip 2FA |
| API Keys | `rok-auth` | default | Sanctum-style personal access tokens |
| Email Verification | `rok-auth` | default | Verify email ownership |
| Password Reset | `rok-auth` | default | Secure password reset flow |

### Auth Flow (JWT)

```
POST /auth/register  ──► Creates user, returns token pair
POST /auth/login     ──► Validates credentials, returns tokens
POST /auth/refresh   ──► Rotates refresh token
POST /auth/logout    ──► Revokes all user tokens
GET  /auth/me        ──► Returns current user from JWT claims
```

### Token Pair Flow

```
Client                          Server
  │                               │
  │── POST /auth/login ──────────►│
  │                               │── verify credentials
  │                               │── sign access token (15 min TTL)
  │                               │── sign refresh token (7 day TTL)
  │◄── { access_token, refresh_token } ──│
  │                               │
  │── GET /api/resource ─────────►│
  │   Authorization: Bearer <at>  │── AuthLayer verifies JWT
  │◄── 200 OK ───────────────────│
  │                               │
  │── POST /auth/refresh ────────►│
  │   { refresh_token: <rt> }     │── verify refresh token
  │                               │── issue new token pair (rotation)
  │◄── { access_token, refresh_token } ──│
```

## Key Components

### Core Auth (`rok-auth`)

- **`Auth`** — main handle holding signing keys; provides `sign()`, `verify()`, `sign_refresh()`, `verify_refresh()`, `exchange()`, and `attempt()` methods
- **`AuthConfig`** — configuration with `secret`, `token_ttl`, `refresh_ttl`, `issuer` fields
- **`Claims`** — JWT payload with `sub` (user ID), `roles`, `exp`, `iat`, `iss`; includes `has_role()`, `has_any_role()`, `has_all_roles()`, `can()`, `is()` methods
- **`RefreshClaims`** — dedicated refresh token type with `typ: "refresh"` discriminator to prevent type confusion
- **`TokenPair`** — access + refresh token response struct

### Axum Integration (`rok-auth` with `features = ["axum"]`)

- **`AuthLayer`** — Tower middleware that injects `Arc<Auth>` into request extensions
- **`Ctx`** — `FromRequestParts` extractor providing `auth`, `pool`, `user: Option<Claims>`, `req_id`, `raw_bearer_token`, `token_abilities`, `current_token_id`
- **`Claims` extractor** — `FromRequestParts` that validates Bearer token, rejects with 401
- **`OptionalClaims` extractor** — non-failing version returning `Option<Claims>`
- **`RequireRole`** — zero-sized role guard middleware
- **`Guard` / `GuardLayer`** — pluggable authentication guard trait for custom auth strategies
- **`JwtGuard` / `JwtUserProvider`** — default JWT-based guard implementation
- **`Response` helpers** — `IntoResponse` for auth error types

### Password Management (`rok-auth`)

- `password::hash()` — hash passwords with configurable algorithm
- `password::verify()` — verify password against hash
- Integration with `rok-hash` for Argon2/Bcrypt/Scrypt support

### Token Features

- **Access tokens** — short-lived JWTs (default 15 minutes), HS256-signed
- **Refresh tokens** — long-lived (default 7 days), rotated on each use
- **Token blacklist** — `TokenBlacklist::is_revoked()` checks against DB table
- **Personal access tokens** — `rklive_`-prefixed tokens with CRC32 checksum, scoped abilities, never stored in plaintext (only SHA-256 hash persisted)
- **Token revocation** — `auth.revoke_all_user_tokens()` and `AccessTokenManager::revoke()`

### Optional Auth Features

| Feature | Cargo Flag | Crate Module |
|---------|-----------|-------------|
| Magic Link | `features = ["magic-link"]` | `rok_auth::magic_link` |
| Passkeys | `features = ["passkeys"]` | `rok_auth::passkey` |
| Device Trust | `features = ["device-trust"]` | `rok_auth::device_trust` |
| Axum Integration | `features = ["axum"]` | `rok_auth::axum` |

### Database Migrations

`rok_auth::migrations()` returns all embedded migrations (7 total):
1. `001_personal_access_tokens` — Sanctum-style token storage
2. `002_token_blacklist` — Revoked JWT tracking
3. `003_email_verification` — Email verification tokens + `email_verified_at` column
4. `004_password_resets` — Password reset tokens
5. `005_totp` — TOTP secret + enabled flag on users table
6. `006_passkey_credentials` — WebAuthn credential storage
7. `007_device_trust_tokens` — Trusted device tokens

Register migrations:

```rust
use rok_orm_migrate::{MigrationRunner, FileSource};

MigrationRunner::new(pool)
    .source(rok_auth::migrations())
    .source(FileSource::new("./migrations"))
    .run()
    .await?;
```

## Configuration

Auth settings are configured in `.env`:

```env
JWT_SECRET=your-256-bit-secret
JWT_TTL=15
JWT_REFRESH_TTL=43200
APP_KEY=your-32-char-hex-secret
```

Programmatic configuration:

```rust
use rok_auth::{Auth, AuthConfig};

let auth = Auth::new(AuthConfig {
    secret: std::env::var("JWT_SECRET").unwrap(),
    token_ttl: std::time::Duration::from_secs(900),    // 15 min
    refresh_ttl: std::time::Duration::from_secs(604800), // 7 days
    issuer: Some("my-app".to_string()),
});
```
