---
title: Queue
description: Process background jobs asynchronously with Rok's queue system.
---

## Overview

Rok provides a queue system for deferring time-consuming tasks (email sending, data processing, etc.) to background workers.

## Defining Jobs

Use `#[derive(Job)]` to define a background job:

```rust
use rok_queue::{Job, Runnable, Queue};
use rok_queue_macros::Job;

#[derive(Job)]
struct SendWelcomeEmail {
    user_id: i64,
}

impl Runnable for SendWelcomeEmail {
    async fn run(&self) -> Result<(), RokError> {
        let user = User::find(self.user_id).await?;
        Mail::send(WelcomeEmail::for_user(&user)).await?;
        Ok(())
    }
}
```

## Dispatching Jobs

```rust
// Dispatch a single job
Queue::dispatch(SendWelcomeEmail { user_id: 1 }).await?;

// Chain jobs
Queue::chain([
    SendWelcomeEmail { user_id: 1 },
    SendWelcomeEmail { user_id: 2 },
]).await?;

// Batch jobs
Queue::batch(jobs).await?;
```

## Running the Worker

```bash
# Start the queue worker
rok queue:work

# Check queue status
rok queue:status

# Retry failed jobs
rok queue:retry --job-id 42

# Clear failed jobs
rok queue:flush
```

## Drivers

| Driver | Backend | Description |
|--------|---------|-------------|
| `postgres` | PostgreSQL | Uses SKIP LOCKED for job claiming |
| `redis` | Redis | Fast, ephemeral queue |

## Job Features

- **Automatic retries** with exponential backoff
- **Dead-letter queue** for persistently failing jobs
- **Job chaining** for sequential execution
- **Batch processing** for parallel execution
