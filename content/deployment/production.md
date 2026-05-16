---
title: Production
description: Deploy your Rok application to production with monitoring, security, and process management.
---

## Building for Release

```bash
# Optimized release build
cargo build --release

# With specific features
cargo build --release --features "postgres,redis,s3"

# Cross-compile for target platform
cargo build --release --target x86_64-unknown-linux-gnu
```

The optimized binary is at `target/release/my-app`.

## Running in Production

```bash
# Set environment
export APP_ENV=production
export APP_DEBUG=false

# Run database migrations
rok db:migrate

# Start server
rok serve

# Or run directly with custom args
./target/release/my-app --port 8080 --host 0.0.0.0
```

## Production Checklist

### Security

- [ ] Generate strong `APP_KEY` (32-byte hex) and `JWT_SECRET` (256-bit)
  ```bash
  rok key:generate
  ```
- [ ] Set `APP_DEBUG=false` to prevent information leakage
- [ ] Configure HSTS and restrictive CSP via `rok-shield`
- [ ] Configure CORS with specific origins (not `*`)
- [ ] Enable rate limiting on auth endpoints (5 req/min on login)
- [ ] Set up database encryption at rest
- [ ] Use HTTPS with TLS termination (reverse proxy or Let's Encrypt)

### Infrastructure

- [ ] Use a production-grade mail driver (SMTP or Resend)
- [ ] Use Redis for cache and queue in production
- [ ] Configure database connection pooling:
  ```env
  DATABASE_POOL_MIN=5
  DATABASE_POOL_MAX=20
  DATABASE_POOL_ACQUIRE_TIMEOUT=30
  ```
- [ ] Set up a reverse proxy (Nginx, Caddy) for TLS termination
- [ ] Configure health check monitoring with `rok-health`
- [ ] Set up structured logging (JSON) to a log aggregator
- [ ] Run database migrations as part of the deployment process
- [ ] Configure backup strategy for the database and file storage

### Deployment Automation

```bash
# Example deployment script
#!/bin/bash
set -e

# Build
cargo build --release

# Run migrations (idempotent)
./target/release/my-app rok db:migrate

# Graceful restart
systemctl restart my-app

# Verify health
sleep 5
curl -f http://localhost:8080/health || exit 1
```

## Monitoring

```bash
# Health check (includes component status)
curl https://myapp.com/health

# Prometheus metrics
curl https://myapp.com/metrics

# Structured logs (JSON)
journalctl -u my-app --output=json
```

### Health Check Integration

```rust
use rok_health::Health;

Health::new()
    .service_name("my-app")
    .check("database", || db.ping())
    .check("cache", || cache.ping())
    .check("queue", || queue.ping())
    .expose("/health");
```

## Process Management

### Systemd Service

```ini
[Unit]
Description=Rok Application
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/my-app
Environment=APP_ENV=production
ExecStart=/usr/local/bin/my-app
Restart=always
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

### Horizontal Scaling

- Run multiple instances behind a load balancer
- Use PostgreSQL connection pooling (PgBouncer)
- Use Redis as a centralized session/cache store
- Ensure file storage uses S3 (not local disk) for shared access
- Configure health checks for load balancer routing

## Scaling Considerations

| Resource | Recommendation |
|----------|---------------|
| CPU | 2+ cores |
| RAM | 1 GB minimum, 4 GB recommended |
| Disk | SSD for database, network storage for uploads |
| Database | PostgreSQL 14+ with connection pooling |
| Cache | Redis for session, cache, and queue |
| Workers | 1 worker per CPU core |
| File Storage | S3-compatible (AWS S3, Cloudflare R2, MinIO) |
