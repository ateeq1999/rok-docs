---
title: Social Authentication
description: Add OAuth login with Google, GitHub, and Discord using rok-auth-social.
---

## Overview

Rok's `rok-auth-social` crate provides OAuth2-based social login with PKCE (Proof Key for Code Exchange) support for Google, GitHub, and Discord. It uses the `oauth2` crate under the hood and integrates seamlessly with the main auth system.

## Built-in Providers

| Provider | Crate Feature | Auth URL |
|----------|--------------|----------|
| Google | `google` | `accounts.google.com/o/oauth2/auth` |
| GitHub | `github` | `github.com/login/oauth/authorize` |
| Discord | `discord` | `discord.com/api/oauth2/authorize` |

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

Or configure programmatically:

```rust
use rok_auth_social::{SocialAuth, SocialConfig, Provider};

let social = SocialAuth::new(SocialConfig {
    google_client_id: env("GOOGLE_CLIENT_ID"),
    google_client_secret: env("GOOGLE_CLIENT_SECRET"),
    google_redirect_uri: env("GOOGLE_REDIRECT_URI"),
    github_client_id: env("GITHUB_CLIENT_ID"),
    // ... other providers
});
```

## Routes

Use `SocialRouter<H>` for a pre-built route handler:

```rust
use rok_auth_social::{SocialRouter, SocialHandler};

struct MySocialHandler;

#[async_trait]
impl SocialHandler for MySocialHandler {
    type Error = RokError;

    async fn on_login(
        &self,
        provider: Provider,
        external_user: ExternalUser,
    ) -> Result<AuthResponse, Self::Error> {
        // Find or create user by external_user.email / external_user.id
        let user = User::first_or_create(external_user).await?;
        let tokens = auth.issue_token(&user).await?;
        Ok(AuthResponse { user, tokens })
    }
}

// Register routes
let app = Router::new()
    .nest("/auth", SocialRouter::new(MySocialHandler).routes());
```

Or implement manually:

```rust
use rok_auth_social::{SocialAuth, Provider, ExternalUser};

async fn redirect_to_provider(
    Path(provider): Path<Provider>,
) -> Redirect {
    // Generates PKCE challenge and stores verifier in session
    let (url, _verifier) = SocialAuth::authorize_url(provider).await?;
    Redirect::to(&url)
}

async fn handle_callback(
    Path(provider): Path<Provider>,
    Query(code): Query<String>,
    Query(state): Query<Option<String>>,
    State(state): State<AppState>,
) -> Result<Json<AuthResponse>, RokError> {
    // Exchange code for token, fetch user profile
    let external_user: ExternalUser = SocialAuth::handle_callback(
        provider, &code, None
    ).await?;

    // Find or create local user
    let user = User::find_or_create_by_email(
        &external_user.email
    ).await?;

    let tokens = state.auth.attempt::<User>(
        &state.pool,
        &external_user.email,
        "",  // Social users may not have password
    ).await?;

    Ok(Json(AuthResponse { user, tokens }))
}
```

## ExternalUser Structure

```rust
pub struct ExternalUser {
    pub id: String,            // Provider's user ID
    pub email: String,
    pub name: Option<String>,
    pub avatar_url: Option<String>,
    pub provider: Provider,    // Google | GitHub | Discord
}
```

## Provider Enum

```rust
pub enum Provider {
    Google,
    GitHub,
    Discord,
}

impl Provider {
    // Display name for the provider
    fn display_name(&self) -> &str;

    // All supported providers
    fn all() -> Vec<Provider>;
}
```

## Adding a New Provider

The system is extensible — implement the `SocialProvider` trait:

```rust
use rok_auth_social::SocialProvider;

struct CustomProvider {
    client_id: String,
    client_secret: String,
    redirect_uri: String,
}

#[async_trait]
impl SocialProvider for CustomProvider {
    fn name(&self) -> &str { "custom" }

    fn authorize_url(&self) -> String { /* ... */ }

    async fn exchange_code(&self, code: &str) -> Result<String, Error> {
        // Exchange authorization code for access token
    }

    async fn fetch_user(&self, access_token: &str) -> Result<ExternalUser, Error> {
        // Fetch user profile from provider API
    }
}
```

## PKCE Flow

Rok uses PKCE (Proof Key for Code Exchange) for enhanced security:

1. Client requests authorization URL — generates a `code_verifier` (random string)
2. SHA-256 hash of verifier sent as `code_challenge` with `S256` challenge method
3. Authorization code returned after user grants access
4. Code + original verifier exchanged for access token
5. Provider verifies the challenge matches before issuing token

This prevents authorization code interception attacks even without a client secret.

## Hooks

Customize behavior with lifecycle hooks:

```rust
pub trait SocialHooks {
    /// Called before redirect to provider
    async fn before_redirect(&self, provider: Provider) -> Result<(), Error>;

    /// Called after successful authentication
    async fn after_login(&self, user: &ExternalUser) -> Result<(), Error>;

    /// Called on authentication failure
    async fn on_error(&self, provider: Provider, error: &Error);
}
```
