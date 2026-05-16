---
title: Session Authentication
description: Use cookie-based sessions for traditional web applications with multiple storage backends.
---

## Overview

Session authentication stores session data server-side and uses cookies to identify the session on subsequent requests. The `rok-auth-session` crate provides this functionality with multiple driver backends.

## Drivers

| Driver | Backend | Description |
|--------|---------|-------------|
| In-Memory | DashMap | Simple, non-persistent, single-process (development) |
| Database | PostgreSQL | Persistent, multi-process (production) |
| Redis | Redis | Fast, persistent, distributed (production) |
| Signed Cookie | AES-GCM | Stateless, encrypted cookie data (no server-side store) |

## Configuration

```rust
use rok_auth_session::{SessionConfig, SessionDriver, SessionLayer};

let config = SessionConfig::new()
    .driver(SessionDriver::Database)
    .table("sessions")
    .lifetime(Duration::from_hours(24))
    .cookie_name("rok_session")
    .cookie_path("/")
    .cookie_domain("example.com")
    .cookie_secure(true)       // HTTPS only
    .cookie_http_only(true)    // Not accessible via JS
    .cookie_same_site("lax"); // CSRF protection
```

## Middleware Setup

Apply `SessionLayer` to your router:

```rust
use rok_auth_session::SessionLayer;

let app = Router::new()
    .route("/login", post(login_handler))
    .route("/dashboard", get(dashboard_handler))
    .layer(SessionLayer::new(config));
```

## Usage

Session auth works transparently — the `Ctx` extractor still works:

```rust
use rok_auth::axum::Ctx;
use axum::{Form, response::Redirect};

// Login creates a session
async fn login(
    Form(credentials): Form<Credentials>,
    State(state): State<AppState>,
) -> Result<Redirect, RokError> {
    let user = User::authenticate(&credentials).await?;

    // Session is created automatically by the middleware
    // The Ctx extractor on subsequent requests returns this user
    Ok(Redirect::to("/dashboard"))
}

// Ctx extractor resolves user from session
async fn dashboard(
    Ctx(ctx): Ctx<AppState>,
) -> Result<Html<String>, RokError> {
    let user = ctx.require_auth()?;
    Ok(Html(format!("<h1>Welcome, {}!</h1>", user.sub)))
}

// Logout destroys the session
async fn logout(
    Ctx(ctx): Ctx<AppState>,
) -> Result<Redirect, RokError> {
    // Session cookie is cleared server-side
    Ok(Redirect::to("/"))
}
```

## Session Data API

Access and store arbitrary data in the session:

```rust
use rok_auth_session::Session;

// Store data
Session::set("cart_items", 3).await?;
Session::set("preferred_lang", "en").await?;

// Retrieve data
let count: Option<i32> = Session::get("cart_items").await?;
let lang: String = Session::get("preferred_lang")
    .await?
    .unwrap_or_else(|| "en".to_string());

// Remove data
Session::forget("cart_items").await?;

// Check existence
let has_key = Session::has("cart_items").await?;

// Clear all session data
Session::flush().await?;

// Regenerate session ID (prevents session fixation)
Session::regenerate().await?;
```

## Flash Messages

Store one-time notification messages:

```rust
use rok_auth_session::Session;

// Set flash message (available only on next request)
Session::flash("success", "Account created!").await?;

// Retrieve flash (consumed on read)
let msg: Option<String> = Session::get_flash("success").await?;

// Flash data is automatically removed after being read
```

## Session Configuration Reference

```rust
pub struct SessionConfig {
    pub driver: SessionDriver,       // Memory | Database | Redis | Cookie
    pub table: String,               // DB table name (default: "sessions")
    pub lifetime: Duration,          // Session TTL (default: 24 hours)
    pub cookie_name: String,         // Cookie name (default: "rok_session")
    pub cookie_path: String,         // Cookie path (default: "/")
    pub cookie_domain: Option<String>,
    pub cookie_secure: bool,         // HTTPS only (default: true in production)
    pub cookie_http_only: bool,      // JS inaccessible (default: true)
    pub cookie_same_site: String,    // "lax" | "strict" | "none"
}
```

## Security Considerations

- Session IDs are randomly generated using a cryptographically secure RNG
- Session data is signed server-side to prevent tampering
- The cookie itself contains only the session ID (not user data)
- Session fixation is prevented via `Session::regenerate()` after login
- CSRF protection should be added separately for state-changing operations
