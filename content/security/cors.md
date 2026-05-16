---
title: CORS
description: Configure Cross-Origin Resource Sharing for your API.
---

## Overview

Rok's `rok-cors` crate provides fine-grained CORS control via a Tower middleware layer.

## Basic Configuration

```rust
use rok_cors::{CorsLayer, CorsOrigin};

let cors = CorsLayer::new()
    .allow_origin("https://myapp.com")
    .allow_methods(["GET", "POST", "PUT", "DELETE"])
    .allow_headers(["Content-Type", "Authorization"])
    .allow_credentials(true)
    .max_age(Duration::from_secs(86400));
```

## Multiple Origins

```rust
let cors = CorsLayer::new()
    .allow_origin(CorsOrigin::list([
        "https://app.example.com",
        "https://admin.example.com",
    ]));
```

## Development Configuration

```rust
let cors = CorsLayer::new()
    .allow_origin(CorsOrigin::any());
```

> **Warning:** Wide-open CORS is suitable only for development. Restrict origins in production.
