---
title: JWT Authentication
description: Configure and use JWT-based authentication in your Rok application with access tokens, refresh tokens, and API keys.
---

## How It Works

Rok uses HS256 JWTs with access/refresh token pairs. The `Auth` handle provides sign/verify operations using HMAC-SHA256 via the `jsonwebtoken` crate.

### Token Format

- **Access tokens** — short-lived JWTs (default 15 min TTL) containing `sub`, `roles`, `exp`, `iat`, `iss` claims
- **Refresh tokens** — long-lived JWTs (default 7 day TTL) with `typ: "refresh"` discriminator to prevent type confusion attacks
- **Personal access tokens** — `rklive_`-prefixed strings with CRC32 checksum for integrity verification; only SHA-256 hashes stored in database

### Claims Structure

```rust
use rok_auth::Claims;

// Create claims with subject and roles
let claims = Claims::new("user-123", vec!["admin", "editor"]);

// Check roles
claims.has_role("admin");          // true
claims.has_any_role(&["mod", "admin"]); // true
claims.has_all_roles(&["admin", "editor"]); // true
claims.is("admin");                // true (alias for has_role)
claims.can("posts:write");         // false (alias using permission strings)

// Check validity
claims.is_valid();                 // true if not expired
```

### Auth Handle

```rust
use rok_auth::{Auth, AuthConfig};

let auth = Auth::new(AuthConfig {
    secret: std::env::var("JWT_SECRET").unwrap(),
    token_ttl: std::time::Duration::from_secs(900),
    refresh_ttl: std::time::Duration::from_secs(604800),
    issuer: Some("my-app".to_string()),
});

// Sign claims
let access_token = auth.sign(&claims)?;

// Sign refresh token
let refresh_token = auth.sign_refresh("user-123")?;

// Verify tokens
let decoded: Claims = auth.verify(&access_token)?;
let refresh: RefreshClaims = auth.verify_refresh(&refresh_token)?;

// Exchange refresh token for new pair (rotation)
let (new_access, new_refresh) = auth.exchange(&refresh_token)?;
```

## AuthLayer Middleware

Apply the `AuthLayer` to inject auth into request processing:

```rust
use rok_auth::{Auth, axum::AuthLayer};
use axum::Router;

let auth = Auth::new(config);
let app = Router::new()
    .nest("/api", api_routes())
    .layer(AuthLayer::new(auth));
```

### Custom Guard

Use a custom `Guard` implementation instead of the default JWT flow:

```rust
use rok_auth::axum::{Guard, GuardLayer};

struct MyGuard;

impl Guard for MyGuard {
    type User = MyUser;
    async fn authenticate(&self, req: &Request) -> Result<Claims, AuthError> {
        // Custom auth logic
    }
}

Router::new()
    .layer(AuthLayer::with_guard(MyGuard));
```

## Ctx Extractor

Access the authenticated user context in handlers:

```rust
use rok_auth::axum::Ctx;

async fn me(Ctx(ctx): Ctx<AppState>) -> Json<serde_json::Value> {
    let user = ctx.require_auth()?;
    let db = ctx.db();
    let req_id = ctx.req_id;     // Unique request ID (UUIDv4)
    let can_edit = ctx.token_can("posts:write");
    Ok(Json(json!({ "user": user.sub, "req_id": req_id })))
}
```

Ctx integrates with `HasPool` and `HasAuth` traits from your app state.

## Authentication Controller

Rok scaffolds an auth controller with standard endpoints:

```rust
pub async fn register(
    Valid(payload): Valid<RegisterRequest>,
    State(state): State<AppState>,
) -> Result<Json<AuthResponse>, RokError> {
    let user = User::create(&payload).await?;
    let (access, refresh) = state.auth.attempt::<User>(
        &state.pool, &payload.email, &payload.password
    ).await?;
    Ok(Json(AuthResponse { user, access, refresh }))
}

pub async fn login(
    Valid(payload): Valid<LoginRequest>,
    State(state): State<AppState>,
) -> Result<Json<AuthResponse>, RokError> {
    let tokens = state.auth.attempt::<User>(
        &state.pool, &payload.email, &payload.password
    ).await?;
    Ok(Json(AuthResponse { tokens }))
}
```

## Token Management

```rust
// Issue tokens with credentials
let tokens = auth.attempt::<User>(&pool, "email@example.com", "password").await?;

// Manual token issuing
let access = auth.sign(&Claims::new(user.id.to_string(), user.roles()))?;
let refresh = auth.sign_refresh(&user.id.to_string())?;

// Refresh token rotation
let (new_access, new_refresh) = auth.exchange(&old_refresh_token)?;

// Revoke all user tokens
auth.revoke_all_user_tokens(user.id).await?;
```

## Personal Access Tokens (API Keys)

For server-to-server communication or CLI tools, generate scoped access tokens:

```rust
// Create a token manager
let manager = auth.access_tokens(&pool);

// Create a token with abilities
let token = manager.create(
    user_id,
    vec!["posts:read".to_string(), "posts:write".to_string()],
    Some("CI Deployment Token"),
    Some(chrono::Utc::now() + chrono::Duration::days(90)),
).await?;

// Token returned is the plaintext `rklive_` value
println!("Save this: {}", token.plaintext_token);

// Find and validate
let found = manager.find_by_token("rklive_...").await?;

// Revoke
manager.revoke(token_id).await?;

// List user's tokens
let tokens = manager.list_for_user(user_id).await?;
```

### CLI Management

```bash
# Generate a new API key
rok key:generate

# List all keys
rok key:list

# Revoke a key
rok key:revoke <id>
```

## Protecting Routes

Use the `Ctx` extractor or `Claims` extractor directly:

```rust
use rok_auth::axum::{Ctx, Claims, OptionalClaims};

// Requires authentication (returns 401 if missing)
async fn me(claims: Claims) -> Json<Claims> {
    Json(claims)
}

// Optional authentication
async fn public_or_authed(claims: Option<OptionalClaims>) -> Json<...> {
    if let Some(claims) = claims {
        // User is authenticated
    } else {
        // Anonymous request
    }
}
```

## Error Types

```rust
pub enum AuthError {
    InvalidToken,        // 401 — token malformed or wrong secret
    TokenExpired,        // 401 — token past exp claim
    InvalidCredentials,  // 401 — wrong email/password
    Forbidden(String),   // 403 — missing required ability
    Internal(String),    // 500 — unexpected errors
}
```
