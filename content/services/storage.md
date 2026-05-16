---
title: Storage
description: Manage file uploads and storage with a unified API.
---

## Overview

The `Storage` facade provides a driver-based file storage system.

## Drivers

| Driver | Backend | Use Case |
|--------|---------|----------|
| `local` | Local filesystem | Development, single-server |
| `s3` | S3-compatible (AWS, R2, GCS) | Production, distributed |

## Basic Usage

```rust
use rok_storage::Storage;

// Store a file
Storage::disk("local")
    .put("avatars/user1.jpg", &file_bytes)
    .await?;

// Retrieve a file
let bytes = Storage::disk("local")
    .get("avatars/user1.jpg")
    .await?;

// Get URL
let url = Storage::disk("s3")
    .url("avatars/user1.jpg")
    .await?;

// Delete
Storage::disk("local")
    .delete("avatars/user1.jpg")
    .await?;
```

## Upload Builder

For fine-grained upload control:

```rust
let path = Storage::disk("s3")
    .upload(file)
    .path("images")
    .name("photo.jpg")
    .visibility("public")
    .save()
    .await?;
```

## Configuration

```env
STORAGE_DRIVER=local
S3_KEY=your-aws-key
S3_SECRET=your-aws-secret
S3_REGION=us-east-1
S3_BUCKET=my-app-uploads
S3_ENDPOINT=https://s3.amazonaws.com
```
