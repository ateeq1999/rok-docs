---
title: Events
description: Decouple application logic with an async event system.
---

## Overview

Rok's event system allows you to decouple different parts of your application by emitting events that are handled by listeners.

## Defining Events

```rust
use rok_events::Event;
use rok_events_macros::Event;

#[derive(Event)]
struct UserRegistered {
    user_id: i64,
    email: String,
}
```

## Defining Listeners

```rust
use rok_events::Listener;

struct SendWelcomeEmail;

#[async_trait]
impl Listener<UserRegistered> for SendWelcomeEmail {
    async fn handle(&self, event: &UserRegistered) -> Result<(), RokError> {
        let user = User::find(event.user_id).await?;
        Mail::send(WelcomeEmail::for_user(&user)).await?;
        Ok(())
    }
}
```

## Registering Listeners

```rust
events::listen::<UserRegistered, SendWelcomeEmail>().await;
```

## Emitting Events

```rust
events::emit(UserRegistered {
    user_id: user.id,
    email: user.email.clone(),
}).await?;
```

## Queue-Backed Events

Events can be dispatched through the queue for asynchronous processing by registering a queue-backed dispatcher.
