---
title: Events
description: Decouple application logic with an async event system supporting sync and queue-backed listeners.
---

## Overview

Rok's event system allows you to decouple different parts of your application by emitting events that are handled by listeners. It supports both synchronous (in-process) and asynchronous (queue-backed) dispatching.

## Defining Events

```rust
use rok_events::Event;
use rok_events_macros::Event;

#[derive(Event)]
struct UserRegistered {
    user_id: i64,
    email: String,
    name: String,
}

#[derive(Event)]
struct OrderPlaced {
    order_id: i64,
    customer_id: i64,
    total: f64,
}

#[derive(Event)]
struct PostPublished {
    post_id: i64,
    author_id: i64,
    title: String,
}
```

## Defining Listeners

```rust
use rok_events::Listener;
use async_trait::async_trait;

struct SendWelcomeEmail;

#[async_trait]
impl Listener<UserRegistered> for SendWelcomeEmail {
    async fn handle(&self, event: &UserRegistered) -> Result<(), RokError> {
        let user = User::find(event.user_id).await?;
        Mail::send(WelcomeEmail::for_user(&user)).await?;
        Ok(())
    }
}

struct AwardSignupBadge;

#[async_trait]
impl Listener<UserRegistered> for AwardSignupBadge {
    async fn handle(&self, event: &UserRegistered) -> Result<(), RokError> {
        Badge::award(event.user_id, "new-member").await?;
        Ok(())
    }
}
```

## Registering Listeners

```rust
// Register listeners for an event
register_listeners!(UserRegistered => [SendWelcomeEmail, AwardSignupBadge]);
register_listeners!(OrderPlaced   => [ProcessPayment, UpdateInventory, SendOrderConfirmation]);

// Or individually
events::listen::<UserRegistered, SendWelcomeEmail>().await;
events::listen::<UserRegistered, AwardSignupBadge>().await;
```

## Emitting Events

```rust
// Emit synchronously (all listeners run in-process)
events::emit(UserRegistered {
    user_id: user.id,
    email: user.email.clone(),
    name: user.name.clone(),
}).await?;

// Listeners run in order of registration.
// If one listener fails, subsequent listeners still run.
```

## ORM Lifecycle Events

Event hooks are automatically emitted on ORM operations:

| Event | Trigger |
|-------|---------|
| `ModelCreating` | Before `Model::create()` |
| `ModelCreated` | After `Model::create()` |
| `ModelUpdating` | Before `Model::update()` |
| `ModelUpdated` | After `Model::update()` |
| `ModelDeleting` | Before `Model::delete()` |
| `ModelDeleted` | After `Model::delete()` |
| `ModelRestoring` | Before soft-delete restore |
| `ModelRestored` | After soft-delete restore |
| `ModelForceDeleting` | Before force delete |
| `ModelForceDeleted` | After force delete |

```rust
// Listen for ORM events
struct LogUserChanges;

#[async_trait]
impl Listener<ModelCreated<User>> for LogUserChanges {
    async fn handle(&self, event: &ModelCreated<User>) -> Result<(), RokError> {
        tracing::info!("User created: {}", event.model.email);
        Ok(())
    }
}
```

## Auth Events

| Event | Trigger |
|-------|---------|
| `UserLogin` | Successful login |
| `UserLogout` | Logout |
| `UserRegistered` | Registration |
| `PasswordReset` | Password reset completed |
| `EmailVerified` | Email verification completed |

## Queue-Backed Events

Events can be dispatched through the queue for asynchronous processing:

```rust
// This event's listeners will run via the queue worker
events::queue::emit(UserRegistered {
    user_id: user.id,
    email: user.email.clone(),
    name: user.name.clone(),
}).await?;
```

To use queue-backed events, register a queue dispatcher:

```rust
events::queue::register_dispatcher(queue_handle).await?;
```

## Best Practices

- **Events** should be named in the past tense (`UserRegistered`, not `RegisterUser`)
- **Listeners** should be single-responsibility (one listener = one side effect)
- **Use queue-backed events** for slow operations (email, API calls, image processing)
- **Use sync events** for operations that must complete before the response (audit logs, cache invalidation)
- **Keep event data immutable** — events represent facts that happened, not commands
