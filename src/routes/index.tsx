import { useState } from "react"
import type React from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArrowRight,
  Box,
  Terminal,
  Shield,
  Zap,
  Database,
  Mail,
  Globe,
  Layers,
  RefreshCw,
  Search,
  Lock,
  BarChart3,
  CheckCircle2,
  ExternalLink,
} from "lucide-react"

export const Route = createFileRoute("/")({ component: HomePage })

const QUICK_START = `# Install the CLI
cargo install rok-cli

# Scaffold a new project
rok new my-app && cd my-app

# Configure & run
cp .env.example .env && rok secrets:generate
rok db:migrate
rok dev`

const ORM_SNIPPET = `// Eloquent-style query builder
let users = User::filter("active", true)
    .order_by_desc("created_at")
    .limit(20)
    .get()
    .await?;

// Relationships
let posts = User::has_many::<Post>("user_id")
    .get().await?;

// Soft deletes, scopes, pagination
let page = Post::filter("published", true)
    .with_trashed()
    .paginate(20, page)
    .await?;`

const AUTH_SNIPPET = `// JWT guard via proc-macro
#[require_auth]
pub async fn profile(ctx: Ctx) -> impl IntoResponse {
    Json(ctx.user)
}

// Role gate
#[require_role("admin")]
pub async fn destroy(ctx: Ctx, Path(id): Path<i64>)
    -> impl IntoResponse { ... }

// Policy-based authorization
ctx.authorize::<PostPolicy, Post>(&post).await?;`

const VALIDATION_SNIPPET = `#[derive(Deserialize, Validate)]
pub struct CreateUserRequest {
    #[validate(required, email, max = 255)]
    pub email: String,

    #[validate(required, min = 8, max = 128)]
    pub password: String,

    #[validate(confirmed)]
    pub password_confirmation: String,
}

// Deserialization + validation in one step
pub async fn store(
    Valid(body): Valid<CreateUserRequest>,
) -> impl IntoResponse { ... }`

const codeSnippets: Record<string, { label: string; lang: string; code: string }> = {
  orm: { label: "ORM", lang: "rust", code: ORM_SNIPPET },
  auth: { label: "Auth", lang: "rust", code: AUTH_SNIPPET },
  validate: { label: "Validation", lang: "rust", code: VALIDATION_SNIPPET },
}

function CodeShowcase() {
  const [active, setActive] = useState<keyof typeof codeSnippets>("orm")
  const snippet = codeSnippets[active]

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-lg">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b bg-muted/50 px-4 py-2">
        {Object.entries(codeSnippets).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setActive(key as keyof typeof codeSnippets)}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              active === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground font-mono">{snippet.lang}</span>
      </div>
      {/* Code */}
      <pre className="overflow-x-auto p-5 text-sm leading-relaxed">
        <code className="text-foreground">{snippet.code}</code>
      </pre>
    </div>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-primary">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  badge,
}: {
  icon: React.ElementType
  title: string
  description: string
  badge?: string
}) {
  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md">
      {badge && (
        <span className="absolute right-4 top-4 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
          {badge}
        </span>
      )}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="mb-1 font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function ComparisonRow({ feature, rok, other }: { feature: string; rok: boolean; other: boolean }) {
  return (
    <tr className="border-b last:border-0">
      <td className="py-3 px-4 text-sm text-muted-foreground">{feature}</td>
      <td className="py-3 px-4 text-center">
        {rok ? (
          <CheckCircle2 className="mx-auto h-4 w-4 text-primary" />
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>
      <td className="py-3 px-4 text-center">
        {other ? (
          <CheckCircle2 className="mx-auto h-4 w-4 text-muted-foreground" />
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>
    </tr>
  )
}

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-4 pb-24 pt-20 text-center">
        {/* Gradient background blob */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.555 0.163 48.998 / 12%), transparent)",
          }}
        />

        {/* Logo badge */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
          <img src="/logo.svg" alt="Rok" className="h-14 w-14" />
        </div>

        {/* Badge */}
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border bg-muted/60 px-4 py-1.5 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          v0.2.0 — Phase 42–43 in progress
        </div>

        <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Full-Stack Rust.{" "}
          <span className="text-primary">Laravel ergonomics.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
          Rok gives you everything for production web apps: a fluent ORM, JWT auth,
          background jobs, caching, mail, WebSockets, search, i18n, feature flags,
          telemetry, and an interactive CLI — all on Axum 0.8 and SQLx 0.8.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/docs/$"
            params={{ _splat: "getting-started/installation" }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://github.com/ateeq1999/axum-rok-http"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-7 py-3 font-semibold hover:bg-accent transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y bg-muted/30 px-4 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          <StatCard value="50+" label="Crates" />
          <StatCard value="3" label="SQL backends" />
          <StatCard value="0" label="Framework lock-in" />
          <StatCard value="MIT" label="License" />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything production needs
            </h2>
            <p className="mt-3 text-muted-foreground">
              One workspace. Zero glue code.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Terminal}
              title="Powerful CLI"
              description="50+ commands: scaffold projects, generate code, run migrations, manage queues, launch TUI dashboards, and integrate AI agents."
              badge="DX"
            />
            <FeatureCard
              icon={Database}
              title="Fluent ORM"
              description="Eloquent-inspired query builder with relationships, pagination, soft deletes, scopes, factories, and PostgreSQL / MySQL / SQLite support."
            />
            <FeatureCard
              icon={Shield}
              title="Auth Suite"
              description="JWT, session, social OAuth (Google, GitHub, Discord), magic-link, RBAC, ACL, policies — all wired with proc-macro guards."
            />
            <FeatureCard
              icon={Zap}
              title="Zero-Cost Performance"
              description="Built on Axum 0.8 with async throughout, compile-time checked SQL via SQLx, and single-binary deployment."
            />
            <FeatureCard
              icon={Mail}
              title="Mail & Notifications"
              description="SMTP, Postmark, Resend drivers. Multi-channel notifications (email, Slack, webhook) with an elegant Mailable trait."
            />
            <FeatureCard
              icon={Layers}
              title="Background Jobs"
              description="PostgreSQL and Redis-backed queue with retries, delays, dead-letter queues, and cron scheduling."
            />
            <FeatureCard
              icon={Box}
              title="File Storage"
              description="Driver-swappable storage (Local, S3) with model-attached media, streaming uploads, and signed URLs."
            />
            <FeatureCard
              icon={Globe}
              title="WebSockets"
              description="Real-time pub/sub with built-in presence channels and room management on top of Axum WebSocket."
            />
            <FeatureCard
              icon={Search}
              title="Full-Text Search"
              description="Unified search API for PostgreSQL FTS, Meilisearch, and Typesense with derive-based indexing."
            />
            <FeatureCard
              icon={Lock}
              title="Security"
              description="AES-256-GCM encryption, Argon2/Bcrypt/Scrypt hashing, CORS, CSP/HSTS headers, rate limiting, and distributed locks."
            />
            <FeatureCard
              icon={BarChart3}
              title="Observability"
              description="OpenTelemetry traces, metrics, and structured logs with OTLP exporter and Prometheus scrape endpoint."
            />
            <FeatureCard
              icon={RefreshCw}
              title="Feature Flags"
              description="Database-backed flags with percentage rollout, user targeting, and segment rules — flip features without deploys."
              badge="New"
            />
          </div>
        </div>
      </section>

      {/* ── Code showcase ── */}
      <section className="border-y bg-muted/20 px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Expressive APIs,<br />Rust's guarantees.
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Rok's proc-macros and fluent builders give you Rails-/Laravel-style
                developer happiness without sacrificing type safety, memory safety,
                or performance.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Compile-time SQL checking via SQLx macros",
                  "Proc-macro auth guards (#[require_auth], #[require_role])",
                  "Derive-based validation and serialization",
                  "Single-binary, zero-dependency deployment",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  to="/docs/$"
                  params={{ _splat: "guide/controllers" }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Read the guide <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <CodeShowcase />
          </div>
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Why Rok?</h2>
            <p className="mt-3 text-muted-foreground">
              Compared to rolling your own Axum stack.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">Feature</th>
                  <th className="py-3 px-4 text-center font-semibold">Rok</th>
                  <th className="py-3 px-4 text-center font-medium text-muted-foreground">Bare Axum</th>
                </tr>
              </thead>
              <tbody>
                <ComparisonRow feature="Fluent ORM with relationships" rok other={false} />
                <ComparisonRow feature="JWT + Session + Social auth" rok other={false} />
                <ComparisonRow feature="Proc-macro route guards" rok other={false} />
                <ComparisonRow feature="Background job queue" rok other={false} />
                <ComparisonRow feature="Cron task scheduler" rok other={false} />
                <ComparisonRow feature="Derive-based validation" rok other={false} />
                <ComparisonRow feature="Multi-driver file storage" rok other={false} />
                <ComparisonRow feature="Interactive CLI scaffold" rok other={false} />
                <ComparisonRow feature="OpenTelemetry built-in" rok other={false} />
                <ComparisonRow feature="Zero framework lock-in" rok other />
                <ComparisonRow feature="MIT licensed" rok other />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Quick start ── */}
      <section className="border-t bg-muted/30 px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Up and running in 60 seconds.
          </h2>
          <p className="mt-3 text-muted-foreground">
            One CLI, one command, a production-ready application.
          </p>
          <div className="mt-8 overflow-hidden rounded-xl border bg-background text-left shadow-md">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <span className="ml-2 text-xs text-muted-foreground font-mono">bash</span>
            </div>
            <pre className="overflow-x-auto p-6 text-sm leading-relaxed font-mono">
              <code>{QUICK_START}</code>
            </pre>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/docs/$"
              params={{ _splat: "getting-started/installation" }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Read the docs
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/docs/$"
              params={{ _splat: "dig-deeper/cli" }}
              className="inline-flex items-center gap-2 rounded-lg border bg-background px-6 py-2.5 font-semibold hover:bg-accent transition-colors"
            >
              CLI reference
            </Link>
          </div>
        </div>
      </section>

      {/* ── Roadmap strip ── */}
      <section className="border-t px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-xl font-semibold">Framework progress</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Core MVC, Auth, ORM", status: "done", phases: "1–10" },
              { label: "Queue, Storage, WebSockets, Telemetry", status: "done", phases: "11–24" },
              { label: "ORM v4/5, Audit, ACL, Media, TUI", status: "done", phases: "25–41" },
              { label: "Redis/MySQL/Typesense drivers", status: "progress", phases: "42–43" },
            ].map((item) => (
              <div
                key={item.phases}
                className={`rounded-lg border p-4 ${
                  item.status === "done"
                    ? "border-primary/20 bg-primary/5"
                    : "border-amber-400/30 bg-amber-50/50 dark:bg-amber-950/20"
                }`}
              >
                <div className="mb-1 text-xs font-medium text-muted-foreground">
                  Phases {item.phases}
                </div>
                <div className="text-sm font-medium">{item.label}</div>
                <div
                  className={`mt-2 text-xs font-semibold ${
                    item.status === "done" ? "text-primary" : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {item.status === "done" ? "✓ Complete" : "⟳ In progress"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-10 text-center">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.svg" alt="Rok" className="h-6 w-6 rounded-md" />
            <span className="font-bold">Rok Framework</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
            <Link to="/docs/$" params={{ _splat: "getting-started/installation" }} className="hover:text-foreground transition-colors">Docs</Link>
            <a href="https://github.com/ateeq1999/axum-rok-http" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
            <a href="https://crates.io/search?q=rok" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">crates.io</a>
          </div>
          <p className="text-sm text-muted-foreground">MIT License · Built with Axum 0.8 + SQLx 0.8</p>
        </div>
      </footer>
    </div>
  )
}

