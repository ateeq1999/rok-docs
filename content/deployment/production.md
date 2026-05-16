---
title: Production
description: Deploy your Rok application to production.
---

## Building for Release

```bash
cargo build --release
```

The optimized binary is at `target/release/my-app`.

## Running in Production

```bash
# Set environment
export APP_ENV=production
export APP_DEBUG=false

# Run migrations
rok db:migrate

# Start server
rok serve
```

## Production Checklist

- [ ] Generate a strong `APP_KEY` and `JWT_SECRET`
- [ ] Set `APP_DEBUG=false` to prevent information leakage
- [ ] Configure a production-grade mail driver (SMTP, Postmark, or Resend)
- [ ] Use Redis for cache and queue in production
- [ ] Enable HSTS and restrictive CSP via `rok-shield`
- [ ] Configure rate limiting on auth endpoints
- [ ] Set up database connection pooling with appropriate pool sizes
- [ ] Configure a reverse proxy (e.g., Nginx, Caddy) for TLS termination
- [ ] Set up health check monitoring
- [ ] Configure structured logging to a log aggregator
- [ ] Run database migrations as part of the deployment process

## Monitoring

```bash
# Health check
curl https://myapp.com/health

# Metrics (Prometheus)
curl https://myapp.com/metrics
```

## Process Manager

Run the binary directly or use a process manager like systemd for automatic restarts.
