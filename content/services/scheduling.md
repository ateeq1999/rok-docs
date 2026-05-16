---
title: Scheduling
description: Schedule recurring tasks using cron expressions and convenience methods.
---

## Overview

Rok's scheduler runs recurring tasks in-process on the Tokio runtime.

## Defining Schedules

```rust
use rok_schedule::{Scheduler, Schedule};

let scheduler = Scheduler::new();

scheduler.schedule(
    Schedule::cron("0 */6 * * *")?,
    || async {
        // Run every 6 hours
        regenerate_sitemaps().await;
    }
);

scheduler.every_minute(|| async {
    cleanup_expired_sessions().await;
});

scheduler.daily_at("02:00", || async {
    backup_database().await;
});

scheduler.weekly_on(Weekday::Mon, "03:00", || async {
    send_weekly_report().await;
});
```

## Starting the Scheduler

```rust
scheduler.start().await;
```

## Schedule Methods

| Method | Description |
|--------|-------------|
| `cron(expr)` | Custom cron expression |
| `every_minute()` | Every minute |
| `every_five_minutes()` | Every 5 minutes |
| `every_ten_minutes()` | Every 10 minutes |
| `every_fifteen_minutes()` | Every 15 minutes |
| `every_thirty_minutes()` | Every 30 minutes |
| `hourly()` | Every hour |
| `hourly_at(15)` | At minute 15 of every hour |
| `daily()` | Daily at midnight |
| `daily_at("13:00")` | Daily at 1 PM |
| `weekly()` | Weekly on Monday at midnight |
| `monthly()` | First day of month at midnight |

## Overlapping Prevention

Tasks are protected from overlapping by default — if a task is still running when its next execution is due, the new execution is skipped.
