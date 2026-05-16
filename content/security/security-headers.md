---
title: Security Headers
description: Harden your application with security-related HTTP headers.
---

## Overview

`rok-shield` provides a middleware layer that sets security-related HTTP headers to protect against common web vulnerabilities.

## Default Headers

```rust
use rok_shield::ShieldLayer;

let shield = ShieldLayer::new();
```

This sets:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-XSS-Protection` | `1; mode=block` | XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer control |
| `Permissions-Policy` | Restrictive defaults | Feature restriction |

## Content Security Policy

```rust
use rok_shield::CspPolicy;

let shield = ShieldLayer::new()
    .csp(CspPolicy::new()
        .default_src("'self'")
        .script_src("'self' 'unsafe-inline'")
        .style_src("'self' 'unsafe-inline'")
        .img_src("'self' https:")
        .connect_src("'self'"));
```

## HSTS

```rust
let shield = ShieldLayer::new()
    .hsts(true)
    .hsts_max_age(31536000)
    .hsts_include_subdomains(true);
```
