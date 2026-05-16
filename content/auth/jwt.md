---
title: JWT Authentication
description: Configure and use JWT-based authentication in your Rok application.
---

## How It Works

Rok uses HS256 JWTs with access/refresh token pairs. Tokens are formatted as `rklive_`-prefixed strings with CRC32 checksums for integrity verification.

Only SHA-256 hashes of tokens are stored in the database; plaintext tokens are never persisted.

## Authentication Controller

Rok scaffolds an auth controller with standard endpoints:

```rust
// src/app/controllers/auth_controller.rs

pub async fn register(
    Valid(payload): Valid<RegisterRequest>,
    State(state): State<AppState>,
) -> Result<Json<AuthResponse>, RokError> {
    let user = User::create(&payload).await?;
    let token = state.auth.issue_token(&user).await?;
    Ok(Json(AuthResponse { user, token }))
}

pub async fn login(
    Valid(payload): Valid<LoginRequest>,
    State(state): State<AppState>,
) -> Result<Json<AuthResponse>, RokError> {
    let user = User::authenticate(&payload.email, &payload.password).await?;
    let token = state.auth.issue_token(&user).await?;
    Ok(Json(AuthResponse { user, token }))
}
```

## Protecting Routes

Use the `Ctx` extractor to access the authenticated user:

```rust
async fn me(Ctx(user): Ctx<User>) -> Json<User> {
    Json(user)
}
```

## Token Management

```rust
// Issue tokens
let tokens = auth.issue_token(&user).await?;

// Refresh tokens
let tokens = auth.refresh_token(&refresh_token).await?;

// Revoke tokens
auth.revoke_all_user_tokens(user.id).await?;
```

## API Key Auth

For server-to-server communication, generate API keys:

```bash
# Via CLI
rok key:generate
```

API keys use the same `rklive_` format and are verified via the `Ctx` extractor.
