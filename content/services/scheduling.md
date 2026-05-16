---
title: Scheduling
description: Schedule recurring tasks using cron expressions and convenience methods.
---

## Overview

Rok's scheduler runs recurring tasks in-process on the Tokio runtime. It supports cron expressions, convenience methods, and overlapping prevention.

## Defining Schedules

```rust
use rok_schedule::{Scheduler, Schedule};
use std::time::Duration;

let scheduler = Scheduler::new();

// Cron expression
scheduler.schedule(
    Schedule::cron("0 */6 * * *")?,
    || async {
        regenerate_sitemaps().await;
    }
);

// Convenience methods
scheduler.every_minute(|| async {
    cleanup_expired_sessions().await;
});

scheduler.every_five_minutes(|| async {
    refresh_materialized_views().await;
});

scheduler.every_ten_minutes(|| async {
    sync_external_data().await;
});

scheduler.every_fifteen_minutes(|| async {
    aggregate_analytics().await;
});

scheduler.every_thirty_minutes(|| async {
    rotate_logs().await;
});

scheduler.hourly(|| async {
    generate_digest_emails().await;
});

scheduler.hourly_at(15, || async {
    // Run at :15 past every hour
    check_health().await;
});

scheduler.daily(|| async {
    // Run at midnight
    backup_database().await;
});

scheduler.daily_at("02:00", || async {
    // Run at 2 AM
    purge_old_records().await;
});

scheduler.daily_at("14:30", || async {
    // Run at 2:30 PM
    send_daily_report().await;
});

scheduler.weekly(|| async {
    // Run Monday at midnight
    generate_weekly_stats().await;
});

scheduler.weekly_on(Weekday::Mon, "03:00", || async {
    // Run Monday at 3 AM
    send_weekly_newsletter().await;
});

scheduler.monthly(|| async {
    // Run 1st of month at midnight
    generate_monthly_billing().await;
});

scheduler.monthly_on(1, "04:00", || async {
    // Run 1st of month at 4 AM
    archive_last_month_data().await;
});
```

## Starting the Scheduler

```rust
scheduler.start().await;

// The scheduler runs on the current Tokio runtime.
// It does not block — tasks are spawned as Tokio tasks.
```

## Schedule Methods Reference

| Method | Cron Equivalent | Description |
|--------|----------------|-------------|
| `cron(expr)` | Custom | Any valid cron expression |
| `every_minute()` | `* * * * *` | Every minute |
| `every_five_minutes()` | `*/5 * * * *` | Every 5 minutes |
| `every_ten_minutes()` | `*/10 * * * *` | Every 10 minutes |
| `every_fifteen_minutes()` | `*/15 * * * *` | Every 15 minutes |
| `every_thirty_minutes()` | `*/30 * * * *` | Every 30 minutes |
| `hourly()` | `0 * * * *` | Every hour at :00 |
| `hourly_at(min)` | `min * * * *` | At minute of every hour |
| `daily()` | `0 0 * * *` | Daily at midnight |
| `daily_at(time)` | `min hour * * *` | Daily at specified time |
| `weekly()` | `0 0 * * 1` | Weekly Monday midnight |
| `weekly_on(day, time)` | Custom | Weekly on specified day |
| `monthly()` | `0 0 1 * *` | Monthly 1st midnight |
| `monthly_on(day, time)` | Custom | Monthly on specified day |

## Overlapping Prevention

Tasks are protected from overlapping by default. If a task is still running when its next execution is due, the new execution is skipped:

```rust
// This task takes ~5 minutes but runs every minute
// → only one instance runs at a time
scheduler.every_minute(|| async {
    process_large_batch().await; // Takes 5 minutes
});
```

## Timezone

The scheduler operates in UTC by default. For timezone-specific scheduling, convert to UTC before passing times to `daily_at()` or `weekly_on()`.

## Error Handling

Task panics or errors are caught and logged. The scheduler continues running other tasks. Use structured logging to monitor task failures:

```rust
scheduler.every_minute(|| async {
    if let Err(e) = cleanup_expired_sessions().await {
        tracing::error!("Scheduled task failed: {e}");
    }
});
```
