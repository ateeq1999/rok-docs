---
title: Installation
description: Get started with Rok by installing the CLI and scaffolding your first project.
---

## Prerequisites

Before installing Rok, ensure you have the following installed:

- **Rust** (edition 2021+) — [rustup.rs](https://rustup.rs)
- **Cargo** — comes with Rust
- **PostgreSQL** 14+ — or Docker for the database
- **Node.js** 18+ (optional, for frontend assets like Htmx templates)
- **pkg-config** and **libssl** (Linux) — `apt-get install pkg-config libssl-dev`
- **cargo-watch** (optional, for hot reload) — `cargo install cargo-watch`

## Install the Rok CLI

The `rok` CLI is the primary tool for scaffolding and managing Rok projects. Install it via Cargo:

```bash
cargo install rok-cli
```

To verify the installation:

```bash
rok --version
```

## Create a New Project

Use the `rok new` command to scaffold a fresh project:

```bash
rok new my-app
```

This creates a new directory `my-app/` with a complete, runnable Axum application. By default it uses the **API template** with JWT authentication, an ORM setup, and a full project structure.

### Available Templates

Rok offers five project templates, each optimized for different use cases:

| Template | Description | Included Features |
|----------|-------------|-------------------|
| `api` | REST API | JWT auth, ORM, validation, error handling, CORS |
| `saas` | Multi-tenant SaaS | Magic-link auth, tenant isolation, billing hooks |
| `htmx` | Full-stack | Htmx, Minijinja templates, session auth |
| `microservice` | Minimal service | Health checks, Docker, env config |
| `minimal` | Bare skeleton | Axum, SQLx, basic config |

Select a specific template with the `-t` flag:

```bash
rok new my-app -t saas
rok new my-app -t htmx
```

## Project Initialization

After scaffolding, navigate into the project directory:

```bash
cd my-app
```

Copy the environment file and configure your database connection:

```bash
cp .env.example .env
```

Generate secure keys for production:

```bash
rok secrets:generate
```

This reads `.env.example`, identifies all secret-like keys (`SECRET`, `_KEY`, `PASSWORD`, `TOKEN`), and generates cryptographically random hex values in `.env`.

Edit `.env` to set your `DATABASE_URL`:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/my_app_dev
```

Verify your project is set up correctly:

```bash
rok check
```

Then run the database migrations:

```bash
rok db:migrate
# or with progress output:
rok db:update
```

Your application is now ready. Start the development server:

```bash
rok dev
```

Visit `http://localhost:3000` to see your app running.

## Quick Start

Once the server is running, test the health endpoint:

```bash
curl http://localhost:3000/health

# Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```
