---
title: Mail
description: Send emails using Rok's mail facade with multiple driver support and the Mailable trait.
---

## Overview

Rok provides a `Mail` facade for sending emails with driver-based implementations. It supports text and HTML emails with attachments via the `Mailable` trait.

## Drivers

| Driver | Backend | Description |
|--------|---------|-------------|
| `log` | built-in | Logs to stdout (development/testing) |
| `smtp` | `lettre` | SMTP with STARTTLS/TLS support |
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
        Some(format!(
            "<h1>Welcome, {}!</h1><p>Thanks for joining.</p>",
            self.name
        ))
    }

    fn text_body(&self) -> Option<String> {
        Some(format!("Welcome, {}!\nThanks for joining.", self.name))
    }

    fn to(&self) -> String {
        self.email.clone()
    }

    fn reply_to(&self) -> Option<String> {
        Some("support@example.com".to_string())
    }

    fn attachments(&self) -> Vec<rok_mail::Attachment> {
        vec![]
    }
}
```

## Sending Mail

```rust
// Send a single email
Mail::send(WelcomeEmail {
    email: "user@example.com".to_string(),
    name: "Jane".to_string(),
}).await?;

// Send with CC/BCC
Mail::send(
    WelcomeEmail { email: "user@example.com".to_string(), name: "Jane".to_string() }
)
.cc("admin@example.com")
.bcc("audit@example.com")
.await?;
```

## MailLayer Middleware

The `MailLayer` middleware installs the mailer into task-local scope:

```rust
use rok_mail::{MailLayer, Mail};

let app = Router::new()
    .route("/register", post(register_handler))
    .layer(MailLayer::new(mailer));
```

## MailMessage Builder (for notifications)

`rok-notification` provides a builder for richer email messages:

```rust
use rok_notification::MailMessage;

let msg = MailMessage::new()
    .subject("Order Confirmed")
    .greeting("Hi Alice,")
    .line("Your order #1234 has been confirmed.")
    .line("We'll notify you when it ships.")
    .action("View Order", "https://example.com/orders/1234")
    .salutation("Thanks,\nThe Team");
```

## Configuration

```env
# Driver selection
MAIL_DRIVER=log

# SMTP configuration
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls           # "tls", "starttls", or "none"

# Default from address
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME="Rok App"

# Resend API
RESEND_API_KEY=re_...
```
