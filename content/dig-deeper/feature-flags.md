---
title: Feature Flags
description: Toggle features on and off without deploying code changes.
---

## Overview

Rok's `rok-feature` crate provides feature flag management with multiple strategies.

## Checking Flags

```rust
use rok_feature::Feature;

if Feature::is_active("dark-mode").await? {
    // Show dark mode UI
}

if Feature::is_active("new-checkout-flow").await? {
    // Use new checkout flow
} else {
    // Use old checkout flow
}
```

## Strategies

| Strategy | Description |
|----------|-------------|
| `on` | Always enabled |
| `off` | Always disabled |
| `percentage` | Gradual rollout by percentage |
| `user_list` | Enabled for specific users |
| `date_range` | Active during a time window |

## Drivers

| Driver | Backend | Description |
|--------|---------|-------------|
| `env` | Environment variables | Simple, static |
| `database` | Database table | Dynamic, runtime-updatable |

## CLI Management

```bash
rok tui  # Launch TUI to toggle flags interactively
```
