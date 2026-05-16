---
title: Docker
description: Containerize your Rok application for deployment with multi-stage builds and Docker Compose.
---

## Dockerfile

Rok projects include a multi-stage `Dockerfile` optimized for small production images:

```dockerfile
# Stage 1: Builder
FROM rust:1.88-slim AS builder

WORKDIR /app

# Cache dependencies (layer 1)
COPY Cargo.toml Cargo.lock ./
COPY crates/ ./crates/
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release 2>/dev/null || true

# Build with real source (layer 2)
COPY . .
RUN cargo build --release

# Stage 2: Runtime
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y \
    libssl3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1001 appuser

COPY --from=builder /app/target/release/my-app /usr/local/bin/
COPY --from=builder /app/database/migrations /app/database/migrations

USER appuser
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

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
    volumes:
      - ./storage:/app/storage    # Persistent file storage
      - ./migrations:/app/database/migrations
    restart: unless-stopped

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: my_app
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## Building

```bash
# Build images
docker compose build

# Build without cache
docker compose build --no-cache

# Start services
docker compose up -d

# View logs
docker compose logs -f app

# Run migrations
docker compose exec app rok db:migrate

# Stop
docker compose down

# Stop and remove volumes
docker compose down -v
```

## Manual Docker Build

```bash
# Build image
docker build -t my-app:latest .

# Run container
docker run -d \
  --name my-app \
  -p 8080:8080 \
  --env-file .env \
  -v ./storage:/app/storage \
  my-app:latest

# Execute commands inside running container
docker exec my-app rok db:migrate
docker exec my-app rok queue:work
```

## Production Considerations

- Use a registry (Docker Hub, ECR, GCR) for image distribution
- Tag images with Git commit SHA for traceability
- Use `.dockerignore` to exclude `target/`, `.git/`, `node_modules/`
- Set `APP_DEBUG=false` and `APP_ENV=production` in the environment
- Configure database connection pooling for container restarts
- Use Docker secrets or vault for sensitive environment variables
