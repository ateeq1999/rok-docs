---
title: Feature Flags
description: Toggle features on and off without deploying code changes, with multiple rollout strategies and drivers.
---

## Overview

Rok's `rok-feature` crate provides feature flag management with multiple rollout strategies. Features can be checked at runtime to conditionally enable or disable functionality.

## Checking Flags

```rust
use rok_feature::Feature;

// Simple boolean check
if Feature::is_active("dark-mode").await? {
    // Show dark mode UI
}

// With context-based strategies
if Feature::is_active("new-checkout-flow").await? {
    // Use new checkout flow
} else {
    // Use old checkout flow
}

// Inside handlers
async fn dashboard(Ctx(ctx): Ctx<AppState>) -> Result<Json<Value>, RokError> {
    let show_analytics = Feature::is_active("beta-analytics").await?;
    // Build response based on active features
}
```

## Rollout Strategies

| Strategy | Description | Use Case |
|----------|-------------|----------|
| `AllOn` | Always enabled | Full rollout, testing |
| `AllOff` | Always disabled | Kill switch, WIP features |
| `Percentage(f32)` | Gradual rollout (0.0–100.0) | Canary releases, A/B testing |
| `UserList(Vec<String>)` | Enabled for specific user IDs | Internal beta testing |
| `GroupList(Vec<String>)` | Enabled for specific groups | Team-specific features |
| `DateRange(chrono::DateTime)` | Active during a time window | Timed launches, promotions |

Examples:

```rust
use rok_feature::{Feature, Strategy};

// Percentage rollout
Feature::define("new-checkout", Strategy::Percentage(25.0))
    .await?;

// User-specific
Feature::define("beta-reports", Strategy::UserList(
    vec!["user-1".into(), "user-42".into()]
)).await?;

// Timed
Feature::define("holiday-theme", Strategy::DateRange {
    start: chrono::Utc::now(),
    end: chrono::Utc::now() + chrono::Duration::days(30),
}).await?;
```

## Drivers

| Driver | Backend | Description |
|--------|---------|-------------|
| `env` | Environment variables | Simple, static, no DB needed |
| `memory` | In-memory HashMap | Development, testing, reset on restart |
| `database` | Database table | Dynamic, runtime-updatable, persistent |

### Database Driver

```env
FEATURE_DRIVER=database
DATABASE_URL=postgres://...
```

The database driver stores flags in a `feature_flags` table:

```sql
CREATE TABLE feature_flags (
    key VARCHAR(255) PRIMARY KEY,
    strategy JSONB NOT NULL,  -- { "type": "percentage", "value": 50 }
    enabled BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ
);
```

## CLI and TUI Management

```bash
# List all flags
rok feature:list

# Enable/disable
rok feature:on dark-mode
rok feature:off dark-mode

# View details
rok feature:show new-checkout
```

Or use the TUI for interactive management:

```bash
rok tui
# → Navigate to "Feature Flags" tab
```

## Programmatic Management

```rust
// Define a new feature flag
Feature::define("new-dashboard", Strategy::Percentage(10.0)).await?;

// Update strategy at runtime
Feature::update("new-dashboard", Strategy::Percentage(50.0)).await?;

// Remove a flag
Feature::remove("old-feature").await?;

// List all flags
let flags = Feature::all().await?;
```

## Example: A/B Testing

```rust
async fn get_pricing(Ctx(ctx): Ctx<AppState>) -> Json<PricingPage> {
    if Feature::is_active("new-pricing-v2").await? {
        // Return new pricing page (A/B test group)
        get_new_pricing()
    } else {
        // Return control pricing page
        get_legacy_pricing()
    }
}
```
