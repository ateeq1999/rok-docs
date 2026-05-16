---
title: Environment
description: Configure your Rok application for different environments with typed config structs and validation.
---

## Environment File

The `.env` file is loaded at startup by `dotenvy`. Required and optional variables:

```env
# ── Application ──
APP_NAME=my-app
APP_ENV=production              # local | testing | production
APP_KEY=your-32-byte-hex-secret  # Generate with `rok key:generate`
APP_DEBUG=false                  # true for detailed error pages
APP_URL=https://myapp.com        # Used for link generation

# ── Server ──
HOST=0.0.0.0                    # Bind address (default: 0.0.0.0)
PORT=8080                       # Bind port (default: 8080)

# ── Database ──
DATABASE_URL=postgres://user:pass@host:5432/db
DATABASE_POOL_MIN=1             # Minimum pool connections
DATABASE_POOL_MAX=20            # Maximum pool connections
DATABASE_POOL_ACQUIRE_TIMEOUT=30 # Connection acquire timeout (seconds)

# ── JWT ──
JWT_SECRET=your-256-bit-jwt-secret
JWT_TTL=15                      # Access token TTL (minutes)
JWT_REFRESH_TTL=43200           # Refresh token TTL (minutes, default: 7 days)

# ── Encryption ──
APP_KEY=your-32-byte-hex-secret  # Used for AES-256-GCM encryption

# ── Hash ──
HASH_DRIVER=argon2              # argon2 | bcrypt | scrypt
HASH_ROUNDS=12                  # Cost factor

# ── Mail ──
MAIL_DRIVER=log                 # log | smtp | resend
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@myapp.com
MAIL_FROM_NAME="My App"
RESEND_API_KEY=re_...           # For Resend driver

# ── Cache ──
CACHE_DRIVER=memory             # memory | redis
REDIS_URL=redis://host:6379

# ── Queue ──
QUEUE_DRIVER=sync               # sync | postgres | redis

# ── Storage ──
STORAGE_DRIVER=local            # local | s3
STORAGE_LOCAL_PATH=./storage
STORAGE_LOCAL_URL=http://localhost:3000/storage
S3_KEY=
S3_SECRET=
S3_REGION=us-east-1
S3_BUCKET=my-app-uploads
S3_ENDPOINT=https://s3.amazonaws.com

# ── Search ──
SEARCH_DRIVER=postgres_fts      # postgres_fts | meilisearch | typesense
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=
TYPESENSE_URL=http://localhost:8108
TYPESENSE_API_KEY=

# ── Rate Limiting ──
RATE_LIMIT_DRIVER=memory        # memory | redis

# ── Features ──
FEATURE_DRIVER=env              # env | memory | database

# ── CORS ──
CORS_ALLOWED_ORIGINS=https://myapp.com
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,PATCH
CORS_ALLOWED_HEADERS=Content-Type,Authorization

# ── Locale ──
APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_LOCALES=en,es,fr,de,ja

# ── Telemetry ──
OTLP_ENDPOINT=http://localhost:4317
OTLP_SAMPLE_RATE=0.1
LOG_FORMAT=json
LOG_LEVEL=info
```

## Environment Detection

```rust
match config.app_env.as_str() {
    "local" => {
        setup_dev_tools();
        // Debug logging, hot reload, relaxed CORS
    }
    "testing" => {
        setup_test_db();
        // Test-specific configuration
    }
    "production" => {
        setup_production_middleware();
        // HSTS, strict CSP, rate limiting, full telemetry
    }
    _ => {}
}
```

## Typed Configuration

Use `#[derive(Config)]` for type-safe environment configuration:

```rust
use rok_config::Config;

#[derive(Config)]
struct AppConfig {
    #[env("APP_NAME", default = "rok")]
    name: String,

    #[env("APP_ENV", default = "local")]
    app_env: String,

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

    #[env("MAIL_DRIVER", default = "log")]
    mail_driver: String,
}

// Load at startup
let config = AppConfig::load()?;
```

## Validation

```bash
# Validate all required env vars without starting the app
rok env:check
```

This validates that all required environment variables are set and produces clear error messages for any missing values. The application also fails fast at startup if required configuration is missing.

## CLI Inspection

```bash
# Show current configuration (secrets masked)
rok config:show

# Example output:
# APP_NAME: my-app
# APP_ENV: production
# APP_DEBUG: false
# APP_URL: https://myapp.com
# DATABASE_URL: postgres://****@host:5432/db
# JWT_SECRET: ****
# MAIL_DRIVER: smtp
```
