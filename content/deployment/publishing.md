---
title: Publishing
description: Publish your rok crates to crates.io and create GitHub releases with automated CLI commands.
---

## Overview

Rok provides automated CLI commands for publishing crates to crates.io and creating GitHub releases. The `rok publish` and `rok release` commands handle the entire workflow:

- **Acceptance gates** — fmt, clippy, tests, docs, clean working tree
- **Dependency-ordered publishing** — 44 crates across 6 layers, published in the correct order
- **Rate-limit handling** — automatic 60-second spacing + HTTP 429 retry with UTC timestamp parsing
- **Git tags** — per-crate version tags
- **GitHub Releases** — auto-generated changelog notes

## Quick Start

```bash
# Dry run — verify gates + show order without uploading
rok publish --dry-run

# Publish all crates
rok publish

# Publish a single crate
rok publish --crate-name rok-auth

# Full release: version bump + publish
rok release patch
rok release minor
rok release major

# Single crate release
rok release patch --crate-name rok-auth

# Version bump only (skip publish)
rok release patch --skip-publish

# Preview unreleased commits
rok changelog
```

## What `rok publish` Does

1. **Check working tree** — aborts if there are uncommitted changes
2. **Run acceptance gates:**
   - `cargo fmt --all -- --check`
   - `cargo clippy --workspace -- -D warnings`
   - `cargo test --workspace`
   - `cargo doc --workspace --no-deps`
3. **Publish each crate** in dependency order (6 layers):
   - Layer 0: proc-macro crates (9)
   - Layer 1: leaf runtime crates (20)
   - Layer 2: dependent runtime crates (11)
   - Layer 3: auth-dependent crates (7)
   - Layer 4: binary crates (2)
   - Layer 5: CLI (1)
4. **Wait 60 seconds** between each publish (crates.io rate limit)
5. **Handle HTTP 429** — parses the UTC timestamp, waits, retries once
6. **Create git tags** — e.g., `rok-auth-v0.1.0`

## What `rok release` Adds

1. **Version bump** — updates `version` in all workspace `Cargo.toml` files
2. **Dependency sync** — updates inter-crate `version = "x.y"` references
3. **Git commit** — `git commit -am "bump version to X.Y.Z"`
4. **Git tag** — `git tag vX.Y.Z`
5. **Git push** — `git push --tags`
6. **GitHub Release** — `gh release create vX.Y.Z --generate-notes`
7. **Publish** — delegates to `rok publish`

## CI/CD

A GitHub Actions workflow is available at `.github/workflows/publish.yml`:

```yaml
# Triggered by:
#   - Pushing a tag matching v*
#   - Manual workflow_dispatch with optional dry_run and crate inputs
```

The workflow:
1. **gates** job — runs all acceptance gates on ubuntu-latest with PostgreSQL service container
2. **publish** job — runs `rok publish` (only if gates pass)
3. **release** job — creates GitHub Release on tag push

## Changelog Preview

```bash
rok changelog
```

Shows unreleased commits since the last tag, grouped by type:

```
  Added:
    abc1234  Add publishing workflow  (author)
    def5678  Implement release command  (author)

  Fixed:
    ghi9012  Fix rate-limit retry logic  (author)

  Summary: 8 unreleased commits
  Date range: 2026-05-10 — 2026-05-16
```

## Manual Publishing (Fallback)

If the automated commands are unavailable, see `PUBLISH.md` in the project root for the manual 37-step sequence with publish order reference and troubleshooting.
