---
title: Configuration
description: Learn how to configure your Rok application using environment variables and typed config structs.
---

## Environment-Based Configuration

Rok uses a typed configuration system built on the `#[derive(Config)]` macro. Configuration values are loaded from environment variables (and `.env` files) at application startup.

### The `.env` File

Rok projects include an `.env.example` file at the project root. Copy it to `.env` and customize:

```bash
cp .env.example .env
```

A typical `.env` file looks like:

```env
APP_NAME=my-app
APP_ENV=local
APP_KEY=your-secret-key
APP_DEBUG=true
APP_URL=http://localhost:3000

DATABASE_URL=postgres://postgres:postgres@localhost:5432/my_app_dev

JWT_SECRET=your-jwt-secret
JWT_TTL=15
JWT_REFRESH_TTL=43200

MAIL_DRIVER=log
MAIL_FROM_ADDRESS=noreply@example.com

CACHE_DRIVER=memory
QUEUE_DRIVER=sync
```

### Typed Config Structs

Rok's `rok-config` crate provides `#[derive(Config)]` to map environment variables to Rust structs with full type safety:

```rust
use rok_config::Config;

#[derive(Config)]
struct AppConfig {
    #[env("APP_NAME", default = "rok")]
    name: String,

    #[env("APP_ENV", default = "local")]
    environment: String,

    #[env("APP_DEBUG", default = "false")]
    debug: bool,

    #[env("APP_URL", default = "http://localhost:3000")]
    url: String,
}
```

### Configuration Validation

Missing required environment variables cause the application to fail fast at startup with a clear error message, preventing runtime misconfiguration.

### Loading Configuration

Configuration is loaded at the application entry point in `main.rs`:

```rust
#[tokio::main]
async fn main() -> Result<(), RokError> {
    let config = AppConfig::load()?;
    // ...
}
```

### Checking Configuration

Use the CLI to inspect the current configuration:

```bash
rok config:show
```

Sensitive values (keys, secrets) are masked in the output.

### Environment Validation

Validate that all required environment variables are set without starting the application:

```bash
rok env:check
```
