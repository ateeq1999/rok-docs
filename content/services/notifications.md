---
title: Notifications
description: Send multi-channel notifications to users with a single unified API.
---

## Overview

Notifications allow sending messages across multiple channels (email, SMS, database, push, Slack, webhook) through a unified API. Each notification defines its own channel routing and message content per channel.

## Channels

| Channel | Description | Delivery |
|---------|-------------|----------|
| `email` | Email via `rok-mail` | SMTP/Resend/Log |
| `database` | Stored in `notifications` table | In-app notification center |
| `sms` | SMS (extensible driver) | Log driver included |
| `slack` | Slack webhook messages | `features = ["slack"]` |
| `webhook` | Custom webhook calls | `features = ["webhook"]` |

## Defining Notifications

```rust
use rok_notification::{Notification, Notifiable, MailMessage, SmsMessage};

struct PostPublished {
    post_id: i64,
    author_name: String,
    title: String,
}

impl Notifiable for PostPublished {
    // Which channels to send on
    fn via(&self, _recipient_id: i64) -> Vec<Channel> {
        vec![Channel::Email, Channel::Database]
    }

    // Email content
    fn to_mail(&self) -> MailMessage {
        MailMessage::new()
            .subject(format!("New post: {}", self.title))
            .greeting("Hi,")
            .line(format!("{} published a new post: {}", self.author_name, self.title))
            .action("Read Now", format!("https://example.com/posts/{}", self.post_id))
    }

    // Database notification content
    fn to_database(&self) -> serde_json::Value {
        serde_json::json!({
            "type": "post_published",
            "post_id": self.post_id,
            "title": self.title,
            "author": self.author_name,
        })
    }

    // SMS content (if Channel::Sms is in via())
    fn to_sms(&self) -> SmsMessage {
        SmsMessage::new(format!("New post by {}: {}", self.author_name, self.title))
    }
}
```

## Notifiable Trait (Recipients)

Implement `HasNotifications` on your user model:

```rust
use rok_notification::HasNotifications;

impl HasNotifications for User {
    fn notifiable_id(&self) -> i64 {
        self.id
    }
    fn notifiable_email(&self) -> Option<&str> {
        Some(&self.email)
    }
    fn notifiable_phone(&self) -> Option<&str> {
        self.phone.as_deref()
    }
}
```

## Sending Notifications

```rust
use rok_notification::Notify;

// Send to a single user
Notify::send(&user, PostPublished {
    post_id: 42,
    author_name: "Alice".to_string(),
    title: "Hello World".to_string(),
}).await?;

// Send to multiple users
let subscribers = get_subscribers().await;
Notify::send_to(&subscribers, PostPublished {
    post_id: 42,
    author_name: "Alice".to_string(),
    title: "Hello World".to_string(),
}).await?;

// Direct method on notifiable
user.notify(PostPublished {
    post_id: 42,
    author_name: "Alice".to_string(),
    title: "Hello World".to_string(),
}).await?;
```

## Database Notifications

The `database` channel stores notifications in a `notifications` table for in-app display:

```rust
use rok_notification::NotificationQuery;

// Get unread notifications for a user
let unread = NotificationQuery::unread_for(user.id).await?;

// Mark as read
NotificationQuery::mark_read(notification_id).await?;
NotificationQuery::mark_all_read(user.id).await?;

// Get paginated notifications
let notifications = NotificationQuery::for_user(user.id)
    .limit(20)
    .get()
    .await?;
```

## Slack Notifications

```rust
// Cargo.toml
// rok-notification = { version = "0.1", features = ["slack"] }

impl Notifiable for ErrorAlert {
    fn via(&self, _id: i64) -> Vec<Channel> {
        vec![Channel::Slack]
    }

    fn to_slack(&self) -> SlackMessage {
        SlackMessage::new()
            .channel("#alerts")
            .text(format!("Error on server {}: {}", self.server, self.message))
            .color("danger")
    }
}
```

## Webhook Notifications

```rust
// rok-notification = { version = "0.1", features = ["webhook"] }

impl Notifiable for OrderPlaced {
    fn via(&self, _id: i64) -> Vec<Channel> {
        vec![Channel::Webhook]
    }

    fn to_webhook(&self) -> WebhookMessage {
        WebhookMessage::new("https://hooks.example.com/order")
            .method("POST")
            .json(serde_json::json!({
                "event": "order.placed",
                "order_id": self.order_id,
            }))
    }
}
```

## NotificationLayer Middleware

```rust
use rok_notification::{NotificationLayer, NotificationContext};

let ctx = NotificationContext::new(config);
let app = Router::new()
    .layer(NotificationLayer::new(ctx));
```
