---
title: Social Authentication
description: Add OAuth login with Google, GitHub, and Discord.
---

## Overview

Rok's `rok-auth-social` crate provides OAuth2-based social login for Google, GitHub, and Discord.

## Configuration

Add the provider credentials to `.env`:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback

DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback
```

## Routes

```rust
use rok_auth_social::{SocialAuth, Provider};

async fn redirect_to_provider(
    Path(provider): Path<Provider>,
) -> Redirect {
    let url = SocialAuth::redirect_url(provider).await?;
    Redirect::to(&url)
}

async fn handle_callback(
    Path(provider): Path<Provider>,
    Query(code): Query<String>,
    State(state): State<AppState>,
) -> Result<Json<AuthResponse>, RokError> {
    let user = SocialAuth::handle_callback(provider, &code).await?;
    let token = state.auth.issue_token(&user).await?;
    Ok(Json(AuthResponse { user, token }))
}
```

## Adding a New Provider

The `SocialAuth` trait is extensible — implement it for custom OAuth providers.
