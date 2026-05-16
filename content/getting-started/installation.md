---
title: Installation
description: Get started with Rok by installing the CLI and scaffolding your first project.
---

## Prerequisites

Before installing Rok, ensure you have the following installed:

- **Rust** (edition 2021+) — [rustup.rs](https://rustup.rs)
- **Cargo** — comes with Rust
- **PostgreSQL** 14+ — or Docker for the database
- **Node.js** 18+ (optional, for frontend assets)

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

| Template | Description |
|----------|-------------|
| `api` | REST API with JWT auth, CRUD scaffolding, validation |
| `saas` | Multi-tenant SaaS with magic-link auth and billing hooks |
| `htmx` | Full-stack with Htmx and Minijinja templates |
| `microservice` | Minimal service with health checks and Docker |
| `minimal` | Bare Axum + SQLx skeleton |

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

Edit `.env` to set your `DATABASE_URL`:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/my_app_dev
```

Then run the database migrations:

```bash
rok db:migrate
```

Your application is now ready. Start the development server:

```bash
rok dev
```

Visit `http://localhost:3000` to see your app running.
