---
title: Mail
description: Send emails using Rok's mail facade with multiple driver support.
---

## Overview

Rok provides a `Mail` facade for sending emails with driver-based implementations.

## Drivers

| Driver | Crate | Description |
|--------|-------|-------------|
| `log` | built-in | Logs to stdout (development) |
| `smtp` | `lettre` | SMTP with STARTTLS/TLS support |
| `postmark` | API | Postmark API integration |
| `resend` | API | Resend API integration |

## Mailable Trait

Create email classes implementing `Mailable`:

```rust
use rok_mail::{Mailable, Mail, MailContent};

struct WelcomeEmail {
    email: String,
    name: String,
}

impl Mailable for WelcomeEmail {
    fn subject(&self) -> String {
        "Welcome to Rok!".to_string()
    }

    fn html_body(&self) -> Option<String> {
        Some(format!("<h1>Welcome, {}!</h1>", self.name))
    }

    fn to(&self) -> String {
        self.email.clone()
    }
}
```

## Sending Mail

```rust
Mail::send(WelcomeEmail {
    email: "user@example.com".to_string(),
    name: "Jane".to_string(),
}).await?;
```

## Configuration

```env
MAIL_DRIVER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME="Rok App"
```
