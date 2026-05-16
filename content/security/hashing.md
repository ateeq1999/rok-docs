---
title: Hashing
description: Hash passwords using industry-standard algorithms.
---

## Overview

The `rok-hash` crate provides password hashing with multiple algorithm support.

## Drivers

| Driver | Algorithm | Use Case |
|--------|-----------|----------|
| `argon2` | Argon2id | Default, most secure |
| `bcrypt` | bcrypt | Legacy compatibility |
| `scrypt` | scrypt | Memory-hard alternative |

## Usage

```rust
use rok_hash::Hash;

// Hash a password
let hash = Hash::make("user-password")?;

// Verify a password
let valid = Hash::check("user-password", &hash)?;

// Check if rehash is needed
let needs_rehash = Hash::needs_rehash(&hash)?;
```

## Configuration

```env
HASH_DRIVER=argon2
HASH_ROUNDS=12
```

The default Argon2id configuration is tuned for a balance of security and performance. Bcrypt is available for systems that need compatibility with existing password hashes.
