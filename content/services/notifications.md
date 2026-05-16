---
title: Notifications
description: Send multi-channel notifications to users.
---

## Overview

Notifications allow sending messages across multiple channels (email, SMS, database, push) through a unified API.

## Defining Notifications

```rust
use rok_notification::{Notification, Notifiable};

#[derive(Notification)]
struct PostPublished {
    post_id: i64,
    author_name: String,
    title: String,
}

impl Notifiable for PostPublished {
    fn channels(&self) -> Vec<String> {
        vec!["mail".to_string(), "database".to_string()]
    }

    fn to_mail(&self) -> Option<MailMessage> {
        Some(MailMessage::new()
            .subject(format!("New post: {}", self.title))
            .line("A new post has been published!"))
    }

    fn to_database(&self) -> Option<DatabaseNotification> {
        Some(DatabaseNotification::new()
            .title("Post Published")
            .body(format!("{} published a new post", self.author_name)))
    }
}
```

## Sending Notifications

```rust
// Notify a single user
notify!(user, PostPublished { post_id, author_name, title });

// Notify multiple users
let users = get_subscribers().await;
notify!(users, PostPublished { post_id, author_name, title });
```

## Channels

| Channel | Description |
|---------|-------------|
| `mail` | Email via rok-mail |
| `database` | Stored in notifications table |
| `sms` | SMS (stub, extensible) |
| `push` | Push notification (stub, extensible) |
