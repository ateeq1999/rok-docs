---
title: Environment
description: Configure your Rok application for different environments.
---

## Environment File

The `.env` file is loaded at startup by `dotenvy`. Required variables:

```env
# Application
APP_NAME=my-app
APP_ENV=production
APP_KEY=your-32-char-hex-secret
APP_DEBUG=false
APP_URL=https://myapp.com

# Database
DATABASE_URL=postgres://user:pass@host:5432/db

# JWT
JWT_SECRET=your-256-bit-jwt-secret
JWT_TTL=15
JWT_REFRESH_TTL=43200

# Mail
MAIL_DRIVER=smtp
MAIL_FROM_ADDRESS=noreply@myapp.com

# Cache
CACHE_DRIVER=redis
REDIS_URL=redis://host:6379

# Queue
QUEUE_DRIVER=redis
```

## Environment Detection

```rust
match config.environment.as_str() {
    "local" => setup_dev_tools(),
    "testing" => setup_test_db(),
    "production" => setup_production_middleware(),
    _ => {}
}
```

## Validation

```bash
rok env:check
```

This validates that all required environment variables are set and produces clear error messages for any missing values.
