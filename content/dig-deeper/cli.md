---
title: CLI Reference
description: Complete reference for the rok CLI commands.
---

## Overview

The `rok` CLI is the primary developer tool for scaffolding, managing, and running your Rok application.

## Project Scaffolding

### `rok new`

```bash
rok new <name> [-t <template>]
```

Creates a new Rok project. Templates: `api`, `saas`, `htmx`, `microservice`, `minimal`.

## Code Generation

### `rok make:model`

```bash
rok make:model <name> [--migration] [--controller] [--resource] [--factory]
```

### `rok make:controller`

```bash
rok make:controller <name> [--resource]
```

### `rok make:migration`

```bash
rok make:migration <name>
```

### `rok make:crud`

```bash
rok make:crud <name>
```

Generates model, migration, controller, validator, factory, routes, and tests.

### Other Generators

```bash
rok make:seeder <name>
rok make:validator <name>
rok make:policy <name>
rok make:job <name>
rok make:event <name>
rok make:listener <name>
rok make:notification <name>
rok make:observer <name>
rok make:resource <name>
rok make:scope <name>
rok make:test <name>
rok make:locale <lang>
rok make:ts-client
```

## Database

```bash
rok db:migrate         # Run pending migrations
rok db:rollback        # Rollback last batch
rok db:rollback -s 3   # Rollback 3 batches
rok db:status          # Show migration status
rok db:seed            # Run seeders
rok db:fresh           # Drop + re-migrate + seed
rok db:pull <table>    # Introspect table to model
rok db:diff <model>    # Diff model vs schema
```

## Queue

```bash
rok queue:work         # Start worker
rok queue:status       # Job counts
rok queue:retry --id N # Retry failed job
rok queue:flush        # Clear failed jobs
```

## Utilities

```bash
rok key:generate       # Generate JWT secret
rok key:rotate         # Rotate JWT secret
rok config:show        # Show config (secrets masked)
rok routes:list        # List registered routes
rok env:check          # Validate env vars
rok dev                # Start dev server with watch
rok serve              # Start production server
rok tui                # Launch terminal UI
```

## AI Agent Commands

```bash
rok plan:next          # Show next phase
rok plan:list          # List phases
rok plan:graph         # Dependency graph (DOT)
rok agent:rules        # Coding conventions
rok agent:context      # Phase context
rok agent:claude       # Launch Claude Code
rok agent:opencode     # Launch OpenCode
```
