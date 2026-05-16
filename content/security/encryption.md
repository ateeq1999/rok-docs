---
title: Encryption
description: Encrypt, sign, and verify data using AES-256-GCM with purpose-bound expiring tokens.
---

## Overview

The `rok-encrypt` crate provides encryption and signing primitives for sensitive data. It uses AES-256-GCM for encryption and HMAC-SHA256 for signing, with a unique purpose-binding feature that prevents token reuse across different operations.

## Encryption (AES-256-GCM)

```rust
use rok_encrypt::Encrypt;

// Encrypt data
let ciphertext = Encrypt::encrypt("sensitive-data")?;

// Decrypt data
let plaintext = Encrypt::decrypt(&ciphertext)?;
```

The encryption uses AES-256 in Galois/Counter Mode (GCM), providing both confidentiality and authenticity.

## Signing

```rust
use rok_encrypt::Signer;

// Create a signed token (HMAC-SHA256)
let token = Signer::sign("user-id-123")?;

// Verify and extract the original data
let data = Signer::verify(&token)?;
```

## Purpose-Bound Tokens

Create tokens tied to a specific purpose with automatic expiry:

```rust
// Email verification (expires in 24 hours)
let token = Encrypt::purpose("email-verification")
    .expires_in(Duration::hours(24))
    .sign(user.id.to_string())?;

// Password reset (expires in 1 hour)
let token = Encrypt::purpose("password-reset")
    .expires_in(Duration::hours(1))
    .sign(user.email.clone())?;

// Verification
let data = Encrypt::purpose("email-verification")
    .verify(&token)?;
    // Returns Err if purpose doesn't match or token expired
```

Purpose-bound tokens prevent:
- **Reuse attacks** — a magic link token cannot be used as a password reset token
- **Replay attacks** — tokens are single-use and expiring
- **Forgery** — tokens are encrypted, not just signed

## Internal Usage

Purpose-bound tokens are used internally by:

| Feature | Purpose String | TTL |
|---------|---------------|-----|
| Email verification | `"email-verification"` | 24 hours |
| Password reset | `"password-reset"` | 1 hour |
| Magic link auth | `"magic-link"` | 1 hour (configurable) |
| Device trust | `"device-trust"` | 30 days (configurable) |

## Configuration

Encryption uses `APP_KEY` from the environment:

```env
APP_KEY=your-32-character-hex-secret
```

The key must be exactly 32 bytes (64 hex characters) for AES-256. Use the CLI to generate one:

```bash
rok key:generate
```
