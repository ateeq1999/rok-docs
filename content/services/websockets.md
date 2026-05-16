---
title: WebSockets
description: Add real-time capabilities with WebSocket channels and broadcasting.
---

## Overview

Rok's `rok-websocket` crate provides WebSocket support with a channel-based pub/sub system.

## WebSocket Route

```rust
use rok_websocket::{WebSocket, Channel};

async fn ws_handler(
    ws: WebSocket,
) -> Result<Response, RokError> {
    ws.on_upgrade(|socket| async {
        let channel = Channel::new("chat");
        channel.join(socket).await;
    }).await
}
```

## Channel Pub/Sub

```rust
// Publish to a channel
Channel::new("notifications")
    .broadcast(serde_json::json!({
        "type": "new_post",
        "data": { "title": "Hello!" }
    }))
    .await?;

// Subscribe in route
Channel::new("notifications")
    .subscribe(socket)
    .await;
```

## Presence Channels

Private channels with user awareness:

```rust
let channel = Channel::new("presence:chat")
    .presence(true)
    .authorize(|token, channel| {
        // Verify user can join
        Ok(())
    });

channel.join(socket).await;
```

## Authentication Integration

WebSocket channels integrate with `rok-auth` for user context:

```rust
let ctx: Ctx = socket.extensions().get().unwrap();
let user = ctx.user();
```
