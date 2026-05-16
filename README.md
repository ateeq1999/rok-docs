# Rok Docs

Comprehensive documentation site for the [Rok Framework](https://github.com/ateeq1999/axum-rok-http) — a Laravel-grade full-stack Rust web framework built on Axum and SQLx.

Built with [TanStack Start](https://tanstack.com/start/latest), React 19, TypeScript, and [shadcn/ui](https://ui.shadcn.com/).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start (SSR) |
| UI | React 19 + TypeScript |
| Routing | TanStack Router (file-based) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Content | Markdown via content-collections (build-time) |
| Markdown Processing | unified / remark / rehype pipeline |
| Syntax Highlighting | Custom prose styles |
| Icons | lucide-react |
| Package Manager | bun |

## Project Structure

```
rok-docs/
├── content/                      # Documentation markdown files
│   ├── getting-started/          # 4 docs: installation, config, structure, first app
│   ├── guide/                    # 7 docs: routing, controllers, models, middleware, validation, errors, testing
│   ├── orm/                      # 6 docs: overview, queries, relationships, migrations, seeders, factories
│   ├── auth/                     # 7 docs: overview, jwt, session, social, magic-link, authorization, acl
│   ├── services/                 # 7 docs: mail, cache, queue, storage, notifications, scheduling, websockets
│   ├── security/                 # 5 docs: encryption, hashing, cors, rate-limiting, security-headers
│   ├── dig-deeper/               # 7 docs: events, ids, i18n, feature-flags, search, telemetry, cli
│   └── deployment/               # 3 docs: docker, environment, production
├── src/
│   ├── routes/                   # TanStack Router file-based routes
│   │   ├── __root.tsx            # Root layout (head, meta, 404)
│   │   ├── index.tsx             # Landing page (hero, features, quick-start)
│   │   └── docs.$.tsx            # Catch-all docs route (splat param)
│   ├── components/
│   │   ├── Markdown.tsx          # Markdown → React renderer (html-react-parser)
│   │   ├── DocLayout.tsx         # Sidebar + content + TOC layout
│   │   ├── Sidebar.tsx           # Collapsible navigation tree
│   │   ├── TableOfContents.tsx    # Sticky right-side TOC
│   │   ├── Header.tsx            # Global header with nav links
│   │   └── ui/                   # shadcn/ui components (55+)
│   ├── utils/
│   │   ├── markdown.ts           # unified/remark/rehype processing pipeline
│   │   └── navigation.ts         # Sidebar nav config (sections → items)
│   └── styles.css                # Tailwind + custom prose styles
├── content-collections.ts        # Build-time markdown collection config
├── vite.config.ts                # Vite + TanStack Start + content-collections
└── package.json
```

## Getting Started

```bash
# Install dependencies
bun install

# Start development server (port 3000)
bun run dev

# Production build
bun run build

# Preview production build
bun run preview
```

## Content

Documentation is written as markdown files in `content/` with YAML frontmatter:

```markdown
---
title: Installation
description: Get started with Rok by installing the CLI and scaffolding your first project.
---

## Prerequisites

Before installing Rok...
```

Frontmatter fields:
- `title` (required) — Page title displayed in the heading
- `description` (optional) — Subtitle shown below the heading

### Adding a New Doc

1. Create a `.md` file in the appropriate `content/<section>/` directory
2. Add YAML frontmatter with `title` and optional `description`
3. Add the page to the navigation in `src/utils/navigation.ts`

## Navigation

The sidebar navigation is defined in `src/utils/navigation.ts` as a hierarchical structure of sections and items:

```ts
export const navigation: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Installation", slug: "getting-started/installation" },
      // ...
    ],
  },
]
```

The slug path corresponds to the file's location under `content/`.

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server on port 3000 |
| `bun run build` | Production build to `.output/` |
| `bun run preview` | Preview production build |
| `bun run lint` | ESLint check |
| `bun run format` | Prettier formatting |
| `bun run typecheck` | TypeScript type check |

## Deployment

The site builds to `.output/` and can be deployed to any Node.js server. The output includes:

- `.output/public/` — Static assets (CSS, JS, fonts)
- `.output/server/` — Nitro server bundle for SSR

```bash
bun run build
node .output/server/index.mjs
```
