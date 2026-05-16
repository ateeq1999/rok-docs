---
title: Encryption
description: Encrypt and sign data using AES-256-GCM and HMAC-SHA256.
---

## Overview

The `rok-encrypt` crate provides encryption and signing primitives for sensitive data.

## Encryption

```rust
use rok_encrypt::Encrypt;

// Encrypt data
let ciphertext = Encrypt::encrypt("sensitive-data")?;

// Decrypt data
let plaintext = Encrypt::decrypt(&ciphertext)?;
```

## Signing

```rust
use rok_encrypt::Signer;

// Create a signed token
let token = Signer::sign("user-id-123")?;

// Verify and extract
let data = Signer::verify(&token)?;
```

## Purpose-Bound Tokens

Create tokens tied to a specific purpose with expiry:

```rust
let token = Encrypt::purpose("email-verification")
    .expires_in(Duration::hours(24))
    .sign(user.id.to_string())?;
```

Used internally for:
- Email verification links
- Password reset tokens
- Magic link authentication
