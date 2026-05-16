---
title: Hashing
description: Hash passwords using industry-standard algorithms with configurable drivers.
---

## Overview

The `rok-hash` crate provides password hashing with multiple algorithm support. It wraps the `argon2`, `bcrypt`, and `scrypt` crates behind a unified `Hash` facade.

## Drivers

| Driver | Algorithm | Use Case |
|--------|-----------|----------|
| `argon2` | Argon2id | **Default** — most secure, memory-hard |
| `bcrypt` | bcrypt | Legacy compatibility with existing systems |
| `scrypt` | scrypt | Memory-hard alternative with different params |

## Usage

```rust
use rok_hash::Hash;

// Hash a password (uses default driver)
let hash = Hash::make("user-password")?;

// Verify a password
let valid = Hash::check("user-password", &hash)?;

// Check if rehash is needed (cost parameters changed)
let needs_rehash = Hash::needs_rehash(&hash)?;

// Rehash if needed
if needs_rehash {
    let new_hash = Hash::make("user-password")?;
    // Update stored hash in database
}
```

## Driver-Specific Configuration

```rust
use rok_hash::{Hash, HashDriver};

// Argon2 with custom parameters
Hash::set_driver(HashDriver::Argon2 {
    memory_cost: 19456,     // 19 MB
    time_cost: 2,            // 2 iterations
    parallelism: 1,          // 1 thread
});

// Bcrypt with custom rounds
Hash::set_driver(HashDriver::Bcrypt {
    cost: 12,                // 2^12 rounds (default: 12)
});

// Scrypt with custom parameters
Hash::set_driver(HashDriver::Scrypt {
    log_n: 14,               // 2^14 iterations
    r: 8,                    // block size
    p: 1,                    // parallelism factor
});
```

## Configuration

```env
# Driver selection
HASH_DRIVER=argon2

# Argon2-specific
HASH_MEMORY=19456
HASH_TIME=2
HASH_PARALLELISM=1

# Bcrypt-specific
HASH_ROUNDS=12
```

## Security Considerations

- **Argon2id** is the recommended default — it resists both GPU and side-channel attacks
- **Bcrypt** is suitable for legacy systems but has lower memory-hardness
- **Scrypt** provides configurable memory/CPU trade-offs
- Always use `Hash::needs_rehash()` when verifying to detect parameter upgrades
- Default parameters are tuned for ~100ms verification time on modern hardware
