---
title: Session Authentication
description: Use cookie-based sessions for traditional web applications.
---

## Overview

Session authentication stores session data server-side and uses cookies to identify the session on subsequent requests.

## Drivers

| Driver | Backend | Description |
|--------|---------|-------------|
| In-Memory | DashMap | Simple, non-persistent, single-process |
| Database | PostgreSQL | Persistent, multi-process |
| Redis | Redis | Fast, persistent, distributed |
| Signed Cookie | AES-GCM | Stateless, encrypted cookie data |

## Configuration

```rust
use rok_auth_session::SessionConfig;

let config = SessionConfig::new()
    .driver(SessionDriver::Database)
    .table("sessions")
    .lifetime(Duration::from_hours(24));
```

## Usage

Session auth works transparently after the middleware is applied:

```rust
// Login creates a session
async fn login(Form(credentials): Form<Credentials>) -> Result<Redirect, RokError> {
    let user = User::authenticate(&credentials).await?;
    // Session is created automatically
    Ok(Redirect::to("/dashboard"))
}

// Ctx extractor still works
async fn dashboard(Ctx(user): Ctx<User>) -> Html<String> {
    // user is loaded from session
}
```
