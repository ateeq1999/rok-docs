---
title: Docker
description: Containerize your Rok application for deployment.
---

## Dockerfile

Rok projects include a multi-stage `Dockerfile`:

```dockerfile
# Stage 1: Builder
FROM rust:1.88-slim AS builder

WORKDIR /app
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release 2>/dev/null || true

COPY . .
RUN cargo build --release

# Stage 2: Runtime
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*
RUN useradd -m -u 1001 appuser

COPY --from=builder /app/target/release/my-app /usr/local/bin/
COPY --from=builder /app/database/migrations /app/database/migrations

USER appuser
EXPOSE 8080
CMD ["my-app"]
```

## Docker Compose

```yaml
services:
  app:
    build: .
    ports:
      - "8080:8080"
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: my_app
      POSTGRES_PASSWORD: postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 5s

  redis:
    image: redis:7-alpine
```

## Building

```bash
docker compose build
docker compose up -d
```
