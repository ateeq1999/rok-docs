---
title: CLI Reference
description: Complete reference for the rok CLI commands — scaffolding, code generation, database, queue, and utilities.
---

## Overview

The `rok` CLI is the primary developer tool for scaffolding, managing, and running your Rok application. It provides code generation, database management, queue operations, and development utilities.

## Installation

```bash
cargo install rok-cli
```

## Project Scaffolding

### `rok new`

```bash
rok new <name> [-t <template>] [--path <dir>]
```

Creates a new Rok project at `./<name>`.

| Option | Description |
|--------|-------------|
| `-t, --template` | Project template (default: `api`) |
| `--path` | Parent directory (default: current dir) |

#### Available Templates

| Template | Description |
|----------|-------------|
| `api` | REST API with JWT auth, ORM, validation |
| `saas` | Multi-tenant SaaS with magic-link auth, billing hooks |
| `htmx` | Full-stack with Htmx and Minijinja templates |
| `microservice` | Minimal service with health checks and Docker |
| `minimal` | Bare Axum + SQLx skeleton |

## Code Generation

### Model & CRUD Generators

```bash
rok make:model <name>                     # Generate model struct
rok make:model <name> --migration         # + migration file
rok make:model <name> --controller        # + controller
rok make:model <name> --resource          # + all CRUD scaffolding
rok make:model <name> --factory           # + model factory
rok make:crud <name>                      # Model + migration + controller + validator + factory + routes + tests

rok make:controller <name>                # Standard controller
rok make:controller <name> --resource     # Resource controller (CRUD methods)
rok make:controller <name> --api          # API controller (JSON responses)

rok make:migration <name>                 # Timestamped SQL migration
rok make:seeder <name>                    # Database seeder
rok make:factory <name>                   # Model factory (for rok-orm-factory)
```

### Supporting Generators

```bash
rok make:validator <name>                 # Request validation DTO
rok make:policy <name>                    # Authorization policy
rok make:job <name>                       # Queue job
rok make:event <name>                     # Event struct
rok make:listener <name>                  # Event listener
rok make:notification <name>              # Multi-channel notification
rok make:observer <name>                  # Model observer
rok make:resource <name>                  # API resource transformer
rok make:scope <name>                     # Query scope
rok make:middleware <name>                # Custom middleware
rok make:service <name>                   # Business logic service
rok make:test <name>                      # Test file
rok make:locale <lang>                    # i18n translation file
rok make:search-index <name>              # Search index rebuild
rok make:ts-client                        # TypeScript API client
```

## Database

```bash
rok db:migrate                    # Run pending migrations
rok db:migrate --dry-run          # Preview without applying
rok db:migrate --step N           # Run N migrations only

rok db:rollback                   # Rollback last batch
rok db:rollback --steps N         # Rollback N batches
rok db:rollback --all             # Rollback all migrations

rok db:status                     # Show migration status
rok db:seed                       # Run all seeders
rok db:seed --class UserSeeder    # Run specific seeder

rok db:fresh                      # Drop all + re-migrate + seed
rok db:fresh --seed               # With seeders
rok db:fresh --migrations-only    # Without seeders

rok db:pull <table>               # Introspect table → model scaffold
rok db:diff <model>               # Diff model definition vs actual schema
```

## Queue

```bash
rok queue:work                    # Start worker (blocking)
rok queue:work --queue emails     # Specific queues
rok queue:work --workers 4        # Parallel workers
rok queue:work --max-jobs 100     # Process N jobs then exit

rok queue:status                  # Job count by status
rok queue:retry --job-id 42       # Retry failed job
rok queue:retry --all             # Retry all failed jobs
rok queue:flush                   # Clear pending jobs
rok queue:flush --failed          # Clear failed jobs
```

## Key Management

```bash
rok key:generate                  # Generate APP_KEY and JWT_SECRET
rok key:rotate                    # Rotate secrets (keep old valid)
rok key:list                      # List API access tokens
rok key:revoke <id>               # Revoke an access token
```

## Configuration & Routes

```bash
rok config:show                   # Show config (secrets masked)
rok env:check                     # Validate all env vars exist
rok routes:list                   # List all registered routes
rok routes:list --json            # JSON format for tooling
```

## Server

```bash
rok dev                           # Dev server with file watching (hot reload)
rok dev --port 8080               # Custom port
rok serve                         # Production server start
```

## TUI (Terminal UI)

```bash
rok tui                           # Launch terminal UI
```

The TUI provides tabbed interfaces for:
- **DB Browser** — explore tables, run queries
- **Queue Manager** — monitor and manage jobs
- **Migrations** — view and run migrations
- **Feature Flags** — toggle feature flags
- **Logs** — tail application logs

## API Testing Studio

```bash
rok studio                         # Launch API testing TUI
```

The studio is a full-featured API testing client with:
- **Collections** — organize API requests
- **History** — past request/response log
- **Request Builder** — method, URL, headers, body
- **Response Viewer** — formatted JSON/XML/HTML
- **Environment Manager** — variable substitution

## AI Agent Commands

```bash
rok plan:next            # Show next development phase
rok plan:list            # List all development phases
rok plan:graph           # Dependency graph (DOT format)
rok agent:rules          # Show coding conventions
rok agent:context        # Show current phase context
rok agent:claude         # Launch Claude Code for this phase
rok agent:opencode       # Launch OpenCode for this phase
```
