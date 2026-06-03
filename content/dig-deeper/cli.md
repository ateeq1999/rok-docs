---
title: CLI Reference
description: Complete reference for the rok CLI — scaffolding, code generation, database, queue, publishing, and utilities.
---

## Overview

The `rok` CLI is the primary developer tool for scaffolding, managing, and running your Rok application. It provides 40+ commands organized into categories.

```bash
# Install
cargo install rok-cli

# List all commands grouped by category
rok list

# Check project health
rok check

# Get help for any command
rok help <command>
```

## Project Scaffolding

### `rok new`

```bash
rok new <name> [-t <template>]
```

Creates a new Rok project. Without `-t`, shows an interactive template picker.

| Option | Description |
|--------|-------------|
| `-t, --template` | Project template: `api`, `saas`, `htmx`, `microservice`, `minimal` |

#### Available Templates

| Template | Description | Included Features |
|----------|-------------|-------------------|
| `api` | REST API | JWT auth, ORM, validation, error handling, CORS |
| `saas` | Multi-tenant SaaS | Magic-link auth, tenant isolation, billing hooks |
| `htmx` | Full-stack | Htmx, Minijinja templates, session auth |
| `microservice` | Minimal service | Health checks, Docker, env config |
| `minimal` | Bare skeleton | Axum, SQLx, basic config |

## Code Generation (`make:*`)

### Model & CRUD

```bash
rok make:model <name>                     # Generate model
rok make:model <name> --migration         # + migration file
rok make:model <name> --controller        # + controller
rok make:model <name> --resource          # + API resource transformer
rok make:model <name> --factory           # + model factory

rok make:crud <name>                      # Full CRUD: migration + model +
                                          #   validator + resource + policy +
                                          #   controller + factory + routes + test
rok make:crud <name> --fields title:string,body:text  # With field definitions
rok make:crud <name> --auth               # Add auth guard to routes
rok make:crud <name> --soft-delete        # Add deleted_at column
rok make:crud <name> --paginate           # Cursor-based pagination
```

### Controllers

```bash
rok make:controller <name>                # Standard controller
rok make:controller <name> --resource     # Resource controller (index, store, show, update, destroy)
```

### Supporting Generators

```bash
rok make:request <name>                   # Request validation struct (src/app/requests/)
rok make:request <name> --resource        # Create + update request pair for a resource
rok make:validator <name>                 # Request validation DTO (src/app/validators/)
rok make:policy <name>                    # Authorization policy
rok make:job <name>                       # Background job
rok make:event <name>                     # Event class
rok make:listener <name>                  # Event listener
rok make:notification <name>              # Multi-channel notification
rok make:observer <name>                  # Model observer (lifecycle hooks)
rok make:resource <name>                  # API resource transformer
rok make:scope <name>                     # Query scope
rok make:migration <name>                 # SQL migration file
rok make:seeder <name>                    # Database seeder
rok make:test <name>                      # Test file
rok make:locale <lang>                    # i18n translation file (from en.json template)
```

### Advanced Generators

```bash
rok make:from-json <name> <json>          # Model + migration from inline JSON
rok make:from-json <name> <file> --file   # From JSON file
rok make:from-schema <name> --file <file> # From JSON Schema file
rok make:ts-client                        # Generate TypeScript API client from resources
rok make:feature --spec <json>            # Full feature from JSON spec
rok make:scaffold [template]              # Run a domain scaffold (20 available)
rok make:scaffold --list                  # List all scaffold templates
```

### Available Scaffold Templates (20)

```
auth          crud          crud-api      upload
webhook       websocket     search        notification
billing       social-auth   admin         export
import        multi-tenant  api-versioned comments
ratings       activity-log  newsletter    flags
```

## Database (`db:*`)

```bash
rok db:migrate                    # Apply pending migrations
rok db:migrate --dry-run          # Preview without applying

rok db:update                     # Apply with progress output (pending count,
                                  #   before/after stats, colored output)

rok db:rollback                   # Rollback last batch
rok db:rollback --step N          # Rollback N batches

rok db:status                     # Show migration status table
rok db:seed                       # Run all seeders
rok db:seed --class UserSeeder    # Run specific seeder

rok db:fresh                      # Drop all tables + re-run migrations

rok db:pull <table>               # Introspect table → model struct
rok db:diff <model>               # Diff model vs actual schema
```

## Queue (`queue:*`)

```bash
rok queue:work                    # Start queue worker (guidance — worker runs in your app)
rok queue:work --queue emails     # Specific queue
rok queue:work --concurrency 8    # Parallel workers

rok queue:status                  # Pending/running/failed job counts
rok queue:retry --job-id 42       # Retry a failed job
rok queue:flush                   # Delete failed jobs (all queues)
rok queue:flush --queue emails    # Specific queue only
```

## Key & Secrets Management

```bash
rok key:generate                  # Generate a random JWT secret (prints to stdout)
rok key:rotate                    # Rotate a key in .env (keeps old value as backup)
rok key:rotate --key APP_KEY      # Rotate a specific key
rok key:rotate --write            # Write new key to .env in-place

rok secrets:generate              # Read .env.example, generate random values for
                                  #   all secret-like keys (SECRET, _KEY, PASSWORD, TOKEN),
                                  #   write .env (safe for new projects)
```

## Configuration & Routes

```bash
rok config:show                   # Show config values (secrets masked)
rok config:show --json            # JSON output for tooling
rok env:check                     # Validate all required env vars are set
rok routes:list                   # List all registered routes
rok rok:init                      # Create .rok/config.toml with generator defaults
```

## Server

```bash
rok dev                           # Dev server with cargo-watch (hot reload)
rok serve                         # Start production server
rok serve --port 8080             # Custom port
rok serve --release               # Build in release mode
```

## Project Health

```bash
rok check                         # Validate project structure, required files,
                                  #   installed tools (rok CLI, cargo-watch)
rok list                          # List all commands grouped by category
rok completion bash               # Generate shell completions (bash/zsh/fish/powershell/elvish)
```

## Publishing & Releases

```bash
rok publish                       # Publish all crates to crates.io in dependency order.
                                  #   Runs gates (fmt, clippy, test, doc, clean tree),
                                  #   handles 60s rate-limit spacing, creates git tags.
rok publish --dry-run             # Verify gates + show order without uploading
rok publish --crate-name rok-auth # Publish a single crate only

rok release patch                 # Bump all crate versions → commit → tag → push →
                                  #   GitHub Release → publish to crates.io
rok release minor --crate rok-auth      # Bump + release a single crate
rok release major --skip-publish        # Version bump + tag only, no publish

rok changelog                     # Preview unreleased commits grouped by type
                                  #   (Added, Fixed, Changed, Removed)
```

## TUI (Terminal UI)

```bash
rok tui                           # Launch terminal UI dashboard
rok tui --db postgres://...       # Override database URL
```

The TUI provides tabbed interfaces for:

| Tab | Features |
|-----|----------|
| **DB Browser** | Browse tables, paginate rows, run custom SQL queries |
| **Migrations** | View applied/pending migrations |
| **Features** | Toggle feature flags interactively |
| **Queue** | Monitor job queues (pending/running/failed/done) |
| **Studio** *(optional)* | API testing client with request builder, response viewer, env manager |

**Keybindings:** `F1`-`F4` switch tabs, `Tab` focuses next panel, `Ctrl+P` opens command palette, `Ctrl+C` copies selected row as JSON, `F5`/`r` refreshes, `q`/`Ctrl+Q` quits.

## Roadmap & AI Agent Commands

```bash
rok plan:next            # Show next development phase
rok plan:list            # List all phases with status
rok plan:graph           # Dependency graph (DOT format for Graphviz)
rok plan:status          # Show status of all phases
rok plan:status --phase N     # Specific phase only

rok agent:rules          # Print AI coding conventions
rok agent:context        # Show current phase context (feature + PRD + progress)
rok agent:context --phase N   # Specific phase
rok agent:feedback --progress "done"    # Append progress note
rok agent:feedback --progress "done" --prd-item 0  # Mark PRD item
rok agent:claude         # Launch Claude Code with rok rules
rok agent:claude --phase N --prompt "..."   # With context + prompt
rok agent:opencode       # Launch OpenCode with rok rules
```

## Global Flags

| Flag | Description |
|------|-------------|
| `--json`, `-j` | Output results as machine-readable JSON |
| `--help`, `-h` | Print help for a command |
| `--version`, `-V` | Print CLI version |
