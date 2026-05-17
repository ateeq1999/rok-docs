import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { ThemeProvider } from "next-themes"
import type React from "react"

import appCss from "../styles.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Rok — Full-Stack Rust Web Framework" },
      {
        name: "description",
        content:
          "Rok is a Laravel-grade full-stack Rust web framework built on Axum and SQLx. Powerful CLI, fluent ORM, JWT auth, background jobs, caching, and 50+ crates.",
      },
      { property: "og:title", content: "Rok — Full-Stack Rust Web Framework" },
      {
        property: "og:description",
        content:
          "Laravel-grade developer experience in Rust. Built on Axum 0.8 and SQLx 0.8.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://rok.rs" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Rok — Full-Stack Rust Web Framework" },
      {
        name: "twitter:description",
        content:
          "Laravel-grade developer experience in Rust. Built on Axum 0.8 and SQLx 0.8.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/logo.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary">
        <span className="text-4xl font-bold text-primary-foreground">R</span>
      </div>
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <a
        href="/"
        className="mt-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Go home
      </a>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
