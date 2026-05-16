---
title: Magic Link Auth
description: Implement passwordless authentication with email magic links using purpose-bound encrypted tokens.
---

## How It Works

Magic link authentication allows users to sign in by clicking a link sent to their email — no password needed. Rok uses `rok-encrypt` for purpose-bound, expiring encrypted tokens.

### Flow

1. User submits their email address via a form
2. Rok generates a signed, expiring token tied to the "magic-link" purpose
3. An email with the magic link URL is sent to the user via `rok-mail`
4. User clicks the link, which hits a verification endpoint
5. Rok decrypts and validates the token, then issues JWT tokens
6. User is authenticated — no password ever required

## Implementation

Enable the `magic-link` feature in your `Cargo.toml`:

```toml
rok-auth = { version = "0.1", features = ["magic-link", "axum"] }
```

```rust
use rok_auth::magic_link::{MagicLink, MagicLinkConfig};
use rok_auth::axum::Ctx;
use rok_mail::Mail;

// Configuration
let magic_link = MagicLink::new(MagicLinkConfig {
    ttl: std::time::Duration::from_secs(3600),   // 1 hour
    token_length: 32,                               // Token byte length
});

// Send magic link
async fn send_magic_link(
    Valid(payload): Valid<MagicLinkRequest>,
    State(state): State<AppState>,
) -> Result<Json<MessageResponse>, RokError> {
    let token = MagicLink::generate(&payload.email, Duration::hours(1)).await?;
    let url = format!("{}/auth/magic/{}", config.app_url, token);

    Mail::send(MagicLinkEmail {
        email: payload.email,
        url,
    }).await?;

    Ok(Json(MessageResponse::sent()))
}

// Verify magic link
async fn verify_magic_link(
    Path(token): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<AuthResponse>, RokError> {
    let user = MagicLink::consume(&token).await?;

    // Token is single-use — consumed on successful verification
    let tokens = state.auth.attempt::<User>(
        &state.pool, &user.email, ""
    ).await?;

    Ok(Json(AuthResponse { user, tokens }))
}
```

## MagicLinkRequest Validation

```rust
#[derive(Deserialize, Validate)]
struct MagicLinkRequest {
    #[validate(required, email)]
    email: String,
}
```

## Security Properties

- **Purpose-bound** — tokens are encrypted with a purpose string ("magic-link"), preventing reuse for other operations (e.g., password reset)
- **Expiring** — configurable TTL, defaults to 1 hour
- **Single-use** — tokens are consumed upon verification
- **Encrypted** — uses AES-256-GCM via `rok-encrypt`, not just signed
- **No plaintext storage** — only verification hashes stored temporarily

## Configuration

```env
# TTL in minutes
MAGIC_LINK_TTL=60

# Token length in bytes (not characters)
MAGIC_LINK_LENGTH=32

# App URL for link generation
APP_URL=http://localhost:3000
```

Programmatic configuration:

```rust
use rok_auth::magic_link::MagicLinkConfig;

let config = MagicLinkConfig {
    ttl: Duration::from_secs(3600),   // 1 hour
    token_length: 32,                   // 32 bytes → 64 hex chars
};
```

## Under the Hood

Magic links use `rok_encrypt::Encrypt::purpose()`:

```rust
// What happens internally:
let token = rok_encrypt::Encrypt::purpose("magic-link")
    .expires_in(Duration::hours(1))
    .sign(email)?;

// Verification:
let email = rok_encrypt::Encrypt::purpose("magic-link")
    .verify(&token)?;
```

This ensures tokens cannot be forged, reused for different purposes, or replayed after expiry.
