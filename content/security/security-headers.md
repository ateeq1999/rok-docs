---
title: Security Headers
description: Harden your application with security-related HTTP headers using rok-shield.
---

## Overview

`rok-shield` provides a middleware layer that sets security-related HTTP headers to protect against common web vulnerabilities including XSS, clickjacking, MIME sniffing, and data injection.

## Default Headers

```rust
use rok_shield::ShieldLayer;

let shield = ShieldLayer::new();
```

This sets secure defaults:

| Header | Default Value | Purpose |
|--------|--------------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking in iframes |
| `X-XSS-Protection` | `1; mode=block` | Enables browser XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer header |
| `Permissions-Policy` | Restrictive defaults | Limits browser API access |
| `Cross-Origin-Embedder-Policy` | `require-corp` | COEP for process isolation |
| `Cross-Origin-Opener-Policy` | `same-origin` | COOP for cross-origin isolation |
| `Cross-Origin-Resource-Policy` | `same-origin` | CORP for resource isolation |

## Content Security Policy

```rust
use rok_shield::{ShieldLayer, CspPolicy};

let shield = ShieldLayer::new()
    .csp(CspPolicy::new()
        .default_src("'self'")
        .script_src("'self' 'unsafe-inline'")
        .style_src("'self' 'unsafe-inline'")
        .img_src("'self' https: data:")
        .font_src("'self' https: data:")
        .connect_src("'self' https://api.example.com")
        .frame_src("'none'")
        .object_src("'none'")
        .base_uri("'self'")
        .form_action("'self'")
        .report_uri("/csp-report"));
```

### CSP Directives

| Method | Purpose |
|--------|---------|
| `default_src(src)` | Fallback for all resource types |
| `script_src(src)` | Allowed script sources |
| `style_src(src)` | Allowed stylesheet sources |
| `img_src(src)` | Allowed image sources |
| `font_src(src)` | Allowed font sources |
| `connect_src(src)` | Allowed fetch/XMLHttpRequest targets |
| `frame_src(src)` | Allowed iframe sources |
| `frame_ancestors(src)` | Allowed parent frames (clickjacking) |
| `object_src(src)` | Allowed plugin sources |
| `media_src(src)` | Allowed audio/video sources |
| `base_uri(uri)` | Allowed `<base>` tag targets |
| `form_action(uri)` | Allowed form submission targets |
| `report_uri(uri)` | CSP violation report endpoint |

## HSTS (HTTP Strict Transport Security)

```rust
let shield = ShieldLayer::new()
    .hsts(true)
    .hsts_max_age(31536000)          // 1 year in seconds
    .hsts_include_subdomains(true)    // Apply to all subdomains
    .hsts_preload(true);             // Submit to browser preload list
```

## Custom Headers

Add arbitrary custom headers:

```rust
let shield = ShieldLayer::new()
    .header("X-Frame-Options", "SAMEORIGIN")
    .header("X-DNS-Prefetch-Control", "off")
    .header("X-Download-Options", "noopen")
    .header("X-Permitted-Cross-Domain-Policies", "none");
```

## Production Configuration

```rust
let shield = ShieldLayer::new()
    .hsts(true)
    .hsts_max_age(31536000)
    .hsts_include_subdomains(true)
    .csp(CspPolicy::new()
        .default_src("'self'")
        .script_src("'self'")
        .style_src("'self'")
        .img_src("'self'")
        .connect_src("'self'")
        .report_uri("/csp-report"));
```
