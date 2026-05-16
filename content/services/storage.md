---
title: Storage
description: Manage file uploads and storage with a unified API supporting local and S3-compatible backends.
---

## Overview

The `Storage` facade provides a driver-based file storage system with a unified API. It supports local filesystem and S3-compatible backends with features like path traversal protection, MIME validation, and size limits.

## Drivers

| Driver | Cargo Feature | Backend | Use Case |
|--------|--------------|---------|----------|
| `LocalDriver` | default | Local filesystem | Development, single-server |
| `S3Driver` | `s3` | S3-compatible (AWS S3, Cloudflare R2, Google GCS, MinIO) | Production, distributed |

## Basic Usage

```rust
use rok_storage::Storage;
use bytes::Bytes;

// Store a file
Storage::disk("local")
    .put("avatars/user1.jpg", Bytes::from(file_data))
    .await?;

// Retrieve a file
let bytes: Bytes = Storage::disk("local")
    .get("avatars/user1.jpg")
    .await?;

// Get public URL
let url = Storage::disk("s3")
    .url("avatars/user1.jpg")
    .await?;

// Check if file exists
let exists = Storage::disk("local")
    .exists("avatars/user1.jpg")
    .await?;

// Delete a file
Storage::disk("local")
    .delete("avatars/user1.jpg")
    .await?;

// Get file metadata
let metadata = Storage::disk("s3")
    .metadata("reports/daily.csv")
    .await?;
// metadata.size, metadata.mime_type, metadata.last_modified
```

## Upload Builder

For fine-grained upload control with validation:

```rust
use rok_storage::UploadBuilder;
use bytes::Bytes;

// Basic upload
let path = Storage::disk("s3")
    .upload("photo.jpg", Bytes::from(data))
    .await?;

// With options
let path = UploadBuilder::from_bytes(
    Bytes::from(file_bytes),
    Some("image/png".to_string()),
)
.directory("uploads/images")
.name("profile_photo.png")
.visibility("public")           // S3: public-read vs private
.max_size(5 * 1024 * 1024)     // 5 MB limit
.allowed_mimes(&["image/png", "image/jpeg", "image/webp"])
.store()
.await?;
```

### UploadBuilder Methods

| Method | Description |
|--------|-------------|
| `directory(path)` | Subdirectory within disk root |
| `name(filename)` | Custom filename (auto-generated ULID if omitted) |
| `visibility(v)` | `"public"` or `"private"` (S3 canned ACL) |
| `max_size(bytes)` | Reject files larger than this |
| `allowed_mimes(list)` | Reject files with disallowed MIME types |
| `store()` | Execute the upload |

## Auto-Naming

When `name()` is not specified, the system auto-generates a ULID-based filename while preserving the extension:

```rust
let path = Storage::disk("local")
    .put_auto("avatars", Bytes::from(img_data), "image/png")
    .await?;
// → "avatars/01ARZ3NDEKTSV4RRFFQ69G5FAV.png"
```

## Multiple Disks

Configure multiple named disks:

```rust
use rok_storage::{StorageManager, drivers::{LocalDriver, S3Driver}};

let mut manager = StorageManager::new("local");
manager.add_disk("local", LocalDriver::new("./storage", "http://localhost:3000/storage"));
manager.add_disk("s3", S3Driver::new("my-bucket", "us-east-1")?);
manager.add_disk("backups", S3Driver::new("backup-bucket", "us-west-2")?);

// Switch disks
Storage::disk("local").put("file.txt", data).await?;
Storage::disk("s3").put("file.txt", data).await?;
Storage::disk("backups").put("backup.tar.gz", data).await?;
```

## Path Traversal Protection

The system rejects paths containing `..` to prevent directory traversal attacks:

```rust
// This will return Err(StorageError::PathTraversal)
Storage::disk("local")
    .put("../../etc/passwd", Bytes::from("evil"))
    .await?;
```

## Layer-Based Access

```rust
use rok_storage::{StorageLayer, Storage};

let app = Router::new()
    .route("/upload", post(upload_handler))
    .layer(StorageLayer::new(manager));
```

## Configuration

```env
# Default disk
STORAGE_DRIVER=local

# Local disk
STORAGE_LOCAL_PATH=./storage
STORAGE_LOCAL_URL=http://localhost:3000/storage

# S3-compatible
S3_KEY=your-aws-key
S3_SECRET=your-aws-secret
S3_REGION=us-east-1
S3_BUCKET=my-app-uploads
S3_ENDPOINT=https://s3.amazonaws.com
S3_URL_PREFIX=https://cdn.example.com/files
```

## StorageError

```rust
pub enum StorageError {
    DiskNotFound(String),    // Referenced disk not configured
    PathTraversal(String),   // Path contains ".."
    FileTooLarge { max: usize, actual: usize },
    MimeNotAllowed { allowed: Vec<String>, actual: String },
    Io(String),              // I/O error
    S3(String),              // AWS SDK error
}
```
