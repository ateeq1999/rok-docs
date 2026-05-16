---
title: WebSockets
description: Add real-time capabilities with WebSocket channels, pub/sub, and presence channels.
---

## Overview

Rok's `rok-websocket` crate provides WebSocket support with a channel-based pub/sub system. It supports public channels, private presence channels, and integrates with the auth system for user context.

## WebSocket Route

```rust
use axum::{Router, routing::get};
use rok_websocket::{WebSocket, Channel};

async fn ws_handler(ws: WebSocket) -> Result<Response, RokError> {
    ws.on_upgrade(|socket| async {
        let channel = Channel::new("chat");
        channel.join(socket).await;
    }).await
}

// Register the route
let app = Router::new()
    .route("/ws", get(ws_handler));
```

## Channel Pub/Sub

```rust
use rok_websocket::Channel;

// Publish a message to all channel members
Channel::new("notifications")
    .broadcast(serde_json::json!({
        "type": "new_post",
        "data": {
            "id": 42,
            "title": "Hello World",
        }
    }))
    .await?;

// Subscribe to a channel (from client-side)
// Client sends: { "type": "subscribe", "channel": "chat:general" }

// Broadcast available in any context (not just WebSocket handlers)
async fn create_post(Json(payload): Json<CreatePost>) -> Result<Json<Post>, RokError> {
    let post = Post::create(&payload).await?;

    // Notify all connected clients
    Channel::new("posts").broadcast(serde_json::json!({
        "type": "post.created",
        "post": post,
    })).await?;

    Ok(Json(post))
}
```

## Presence Channels

Private channels with user awareness that track who's online:

```rust
use rok_websocket::Channel;

let channel = Channel::new("presence:chat")
    .presence(true)
    .authorize(|token, channel_name| {
        // Verify user can join this channel
        // Return Ok(()) to allow, Err to reject
        if token.is_valid() {
            Ok(())
        } else {
            Err("Unauthorized")
        }
    });

channel.join(socket).await;
```

Presence channels automatically broadcast join/leave events to all members:

```json
// Sent when a user joins
{ "type": "presence:join", "user": { "id": 123, "name": "Alice" } }

// Sent when a user leaves
{ "type": "presence:leave", "user": { "id": 123, "name": "Alice" } }

// Current members on subscribe
{ "type": "presence:init", "members": [...] }
```

## Authentication Integration

WebSocket channels integrate with `rok-auth` for user context:

```rust
async fn authenticated_ws(
    ws: WebSocket,
    Ctx(ctx): Ctx<AppState>,
) -> Result<Response, RokError> {
    let user = ctx.require_auth()?;

    ws.on_upgrade(move |socket| async move {
        // Only allow authenticated users
        if ctx.user().is_none() {
            return;
        }

        let channel = Channel::new("private:user:" + &user.sub);
        channel.join(socket).await;
    }).await
}
```

## Channel Types

| Type | Pattern | Description |
|------|---------|-------------|
| Public | `channel-name` | Anyone can subscribe and listen |
| Private | `private:name` | Requires `authorize()` callback |
| Presence | `presence:name` | Private + tracks online users |

## Configuration

```env
# WebSocket connection timeout
WEBSOCKET_TIMEOUT=30

# Max message size (bytes)
WEBSOCKET_MAX_MESSAGE_SIZE=65536
```

## Client Example

```javascript
// Connect
const ws = new WebSocket('ws://localhost:3000/ws');

// Subscribe to channel
ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'chat:general'
}));

// Receive messages
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
};
```
