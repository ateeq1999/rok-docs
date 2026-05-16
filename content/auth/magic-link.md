---
title: Magic Link Auth
description: Implement passwordless authentication with email magic links.
---

## How It Works

Magic link authentication allows users to sign in by clicking a link sent to their email — no password needed.

1. User submits their email address
2. Rok generates a signed, expiring token
3. An email with the magic link is sent to the user
4. User clicks the link and is authenticated

## Implementation

```rust
use rok_auth::passwordless::MagicLink;

async fn send_magic_link(
    Valid(payload): Valid<MagicLinkRequest>,
    State(state): State<AppState>,
) -> Result<Json<MessageResponse>, RokError> {
    let token = MagicLink::generate(&payload.email, Duration::hours(1)).await?;
    let url = format!("{}/auth/magic/{token}", config.app_url);

    Mail::send(MagicLinkEmail {
        email: payload.email,
        url,
    }).await?;

    Ok(Json(MessageResponse::sent()))
}

async fn verify_magic_link(
    Path(token): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<AuthResponse>, RokError> {
    let user = MagicLink::consume(&token).await?;
    let tokens = state.auth.issue_token(&user).await?;
    Ok(Json(AuthResponse { user, tokens }))
}
```

## Configuration

```env
MAGIC_LINK_TTL=60
MAGIC_LINK_LENGTH=32
```

Magic links use `rok-encrypt` for purpose-bound, expiring encrypted tokens.
