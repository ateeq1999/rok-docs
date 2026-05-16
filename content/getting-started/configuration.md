---
title: Configuration
description: Learn how to configure your Rok application using environment variables and typed config structs.
---

## Environment-Based Configuration

Rok uses a typed configuration system built on the `#[derive(Config)]` macro from `rok-config`. Configuration values are loaded from environment variables (and `.env` files) at application startup.

### The `.env` File

Rok projects include an `.env.example` file at the project root. Copy it to `.env` and customize:

```bash
cp .env.example .env
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

    #[env("DATABASE_URL")]
    database_url: String,

    #[env("JWT_SECRET")]
    jwt_secret: String,

    #[env("JWT_TTL", default = "15")]
    jwt_ttl: u64,
}
```

### Supported Types

The `#[env()]` attribute supports any type that implements `FromStr`:

| Rust Type | Example |
|-----------|---------|
| `String` | `#[env("APP_NAME")]` |
| `bool` | `#[env("APP_DEBUG", default = "false")]` |
| `u64`, `i64`, `u32`, `i32` | `#[env("PORT", default = "8080")]` |
| `f64`, `f32` | `#[env("FEE", default = "0.05")]` |
| `Duration` | `#[env("TIMEOUT_SECS", default = "30")]` |
| `Option<T>` | `#[env("OPTIONAL_KEY")]` — no error if missing |
| `Vec<String>` | `#[env("CORS_ORIGINS")]` — comma-separated |

### Configuration Validation

Missing required environment variables (those without `default = ...`) cause the application to fail fast at startup with a clear error message:

```bash
Error: Missing required environment variable: JWT_SECRET
```

This prevents runtime misconfiguration.

### Loading Configuration

Configuration is loaded at the application entry point in `main.rs`:

```rust
#[tokio::main]
async fn main() -> Result<(), RokError> {
    dotenvy::dotenv().ok();          // Load .env file
    let config = AppConfig::load()?; // Parse env vars into struct

    // Validate configuration
    if config.debug && config.environment == "production" {
        panic!("Cannot run debug mode in production");
    }

    // Build the app
    let pool = PgPool::connect(&config.database_url).await?;
    let auth = Auth::new(AuthConfig {
        secret: config.jwt_secret.clone(),
        token_ttl: Duration::from_secs(config.jwt_ttl * 60),
        ..Default::default()
    });

    // ...
}
```

### Checking Configuration

Use the CLI to inspect the current configuration:

```bash
rok config:show
```

Sensitive values (keys, secrets) are masked in the output:

```
APP_NAME: my-app
APP_ENV: production
APP_DEBUG: false
DATABASE_URL: postgres://****@localhost:5432/my_app
JWT_SECRET: ****
```

### Environment Validation

Validate that all required environment variables are set without starting the application:

```bash
rok env:check
```

This is useful for CI/CD pipelines and deployment scripts.

### Multi-Environment Configuration

```rust
match config.environment.as_str() {
    "local" => {
        // Debug logging, hot reload, relaxed CORS
    }
    "testing" => {
        // In-memory cache, test database
    }
    "staging" => {
        // Full stack but relaxed security
    }
    "production" => {
        // HSTS, strict CSP, rate limiting, full telemetry
    }
    _ => {}
}
```
