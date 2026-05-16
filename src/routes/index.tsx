import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowRight, Box, Terminal, Shield, Zap } from "lucide-react"

export const Route = createFileRoute("/")({ component: HomePage })

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pb-20 pt-24 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <span className="text-3xl font-bold text-primary-foreground">R</span>
        </div>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Full-Stack Rust Web Framework
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Laravel-grade developer experience in Rust. Powerful CLI, fluent ORM,
          JWT auth, queues, caching, and 50+ crates — all built on Axum and
          SQLx.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/docs/$slug"
            params={{ slug: "getting-started/installation" }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://github.com/ateeq1999/axum-rok-http"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-6 py-3 font-medium hover:bg-accent transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="mb-2 font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Quick Start */}
      <section className="border-t bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Quick Start</h2>
          <p className="mt-2 text-muted-foreground">
            Get a production-ready API running in minutes.
          </p>
          <div className="mt-8 rounded-xl border bg-background p-6 text-left">
            <pre className="overflow-x-auto text-sm">
              <code>{`# Install the CLI
cargo install rok-cli

# Create a new project
rok new my-app

# Configure & run
cd my-app
cp .env.example .env
rok db:migrate
rok dev`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>Rok Framework — MIT License</p>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: Terminal,
    title: "Powerful CLI",
    description:
      "Scaffold projects, generate code, run migrations, manage queues, and more with the `rok` CLI — 50+ commands.",
  },
  {
    icon: Box,
    title: "Fluent ORM",
    description:
      "Eloquent-inspired ORM with relationships, pagination, soft deletes, scopes, model factories, and read replicas.",
  },
  {
    icon: Shield,
    title: "Auth & Security",
    description:
      "JWT, session, social, and magic-link auth. ACL, policies, rate limiting, CORS, CSP, and encryption built in.",
  },
  {
    icon: Zap,
    title: "High Performance",
    description:
      "Built on Axum 0.8 and SQLx with zero-cost abstractions, async throughout, and single-binary deployment.",
  },
  {
    icon: Box,
    title: "50+ Crates",
    description:
      "Mail, cache, queue, storage, websockets, search, i18n, feature flags, telemetry, events, scheduling, and more.",
  },
  {
    icon: Shield,
    title: "AI-Ready",
    description:
      "Built-in AI agent integration with `plan:*` and `agent:*` commands. Feature roadmap and coding conventions included.",
  },
]
