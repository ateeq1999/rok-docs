---
title: Queue
description: Process background jobs asynchronously with Rok's queue system, supporting chaining, batching, and retries.
---

## Overview

Rok provides a queue system for deferring time-consuming tasks (email sending, data processing, image resizing, etc.) to background workers. It supports PostgreSQL and Redis backends with configurable job pipelines.

## Defining Jobs

Use `#[derive(Job)]` and implement `Runnable`:

```rust
use rok_queue::{Job, Runnable, JobContext, JobResult, Queue};
use rok_queue_macros::Job;
use async_trait::async_trait;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Job)]
#[job(queue = "emails", max_attempts = 3)]
struct SendWelcomeEmail {
    user_id: i64,
    email: String,
    name: String,
}

#[async_trait]
impl Runnable for SendWelcomeEmail {
    async fn run(&self, _ctx: &JobContext) -> JobResult {
        let user = User::find(self.user_id).await?;
        Mail::send(WelcomeEmail::for_user(&user)).await?;
        Ok(())
    }
}
```

### Job Attributes

| Attribute | Description | Default |
|-----------|-------------|---------|
| `queue` | Queue name for routing | `"default"` |
| `max_attempts` | Max retry attempts before dead-letter | `3` |
| `backoff` | Backoff strategy (`fixed`, `exponential`) | `fixed` |

## Registry

Register all job types:

```rust
use rok_queue::JobRegistry;

let mut registry = JobRegistry::new();
registry.register::<SendWelcomeEmail>();
registry.register::<ProcessImage>();
registry.register::<GenerateReport>();
let registry = registry.into_arc();
```

## Dispatching Jobs

```rust
// Single job
Queue::dispatch(SendWelcomeEmail {
    user_id: 1,
    email: "user@example.com".to_string(),
    name: "Alice".to_string(),
}).await?;

// Delayed job (run after 30 minutes)
Queue::dispatch_in(
    SendWelcomeEmail { user_id: 1, email: "...".into(), name: "Bob".into() },
    std::time::Duration::from_secs(1800)
).await?;

// Job chain (sequential execution)
Queue::chain()
    .push(GenerateInvoice { order_id: 42 })?
    .push(SendInvoiceEmail { order_id: 42 })?
    .push(UpdateInventory { order_id: 42 })?
    .dispatch()
    .await?;

// Job batch (parallel execution) with callback
Queue::batch()
    .add(ResizeImage { path: "img1.jpg".into() })?
    .add(ResizeImage { path: "img2.jpg".into() })?
    .add(ResizeImage { path: "img3.jpg".into() })?
    .then(NotifyAdmin { batch_id: "batch_1".into() })?  // Runs after all complete
    .dispatch()
    .await?;
```

## Running the Worker

```bash
# Start the queue worker (blocking, runs forever)
rok queue:work

# Start with specific queues
rok queue:work --queue emails,images,default

# Start multiple workers
rok queue:work --workers 4

# Process N jobs then exit
rok queue:work --max-jobs 100

# Check queue status
rok queue:status

# Retry failed jobs
rok queue:retry --job-id 42
rok queue:retry --all

# Clear pending jobs
rok queue:flush

# Clear failed jobs
rok queue:flush --failed
```

Programmatic worker:

```rust
use rok_queue::{Worker, WorkerConfig, drivers::memory::MemoryDriver};

let driver = MemoryDriver::new();
let queue = Queue::new(driver.clone());

let worker = Worker::new(
    driver.into_arc(),
    registry,
    WorkerConfig::default()
        .poll_interval(std::time::Duration::from_secs(1))
        .max_jobs_per_tick(10)
        .queues(&["emails", "default"]),
);

// Run forever
worker.run().await;

// Or drain N jobs
let processed = rok_queue::drain_jobs(driver, registry, &["emails"], 10, 0).await?;
```

## Drivers

| Driver | Backend | Description |
|--------|---------|-------------|
| `MemoryDriver` | In-memory | Development, testing |
| `PostgresDriver` | PostgreSQL | **Production** — uses `SKIP LOCKED` for safe concurrent claiming |

PostgreSQL driver uses `SELECT ... FOR UPDATE SKIP LOCKED` to safely claim jobs across multiple worker processes without locking contention.

## Job Features

- **Automatic retries** with configurable max attempts
- **Backoff strategies** — fixed delay or exponential backoff
- **Dead-letter queue** — persistently failed jobs are moved to failed state for inspection
- **Job chaining** — sequential execution pipeline
- **Batch processing** — parallel execution with optional completion callback
- **Delayed dispatch** — schedule jobs for future execution
- **Queue routing** — organize jobs into named queues for worker specialization
