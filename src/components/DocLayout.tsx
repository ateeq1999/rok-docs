import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { ChevronLeft, ChevronRight, ExternalLink, Home } from "lucide-react"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { TableOfContents } from "./TableOfContents"
import { navigation } from "../utils/navigation"
import type { MarkdownHeading } from "../utils/markdown"
import type { NavItem } from "../utils/navigation"

type DocLayoutProps = {
  children: React.ReactNode
  headings?: MarkdownHeading[]
  slug?: string
}

/* Flatten all nav items in order so we can build prev/next */
const allNavItems: NavItem[] = navigation.flatMap((s) => s.items)

function getAdjacentDocs(slug: string) {
  const idx = allNavItems.findIndex((item) => item.slug === slug)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: idx > 0 ? allNavItems[idx - 1] : null,
    next: idx < allNavItems.length - 1 ? allNavItems[idx + 1] : null,
  }
}

function getBreadcrumbs(slug: string) {
  for (const section of navigation) {
    const item = section.items.find((i) => i.slug === slug)
    if (item) return [section.title, item.title]
  }
  return []
}

const GITHUB_REPO = "https://github.com/ateeq1999/axum-rok-http"

export function DocLayout({ children, headings, slug }: DocLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const breadcrumbs = slug ? getBreadcrumbs(slug) : []
  const { prev, next } = slug ? getAdjacentDocs(slug) : { prev: null, next: null }

  const editUrl = slug
    ? `${GITHUB_REPO}/edit/main/rok-docs/content/${slug}.md`
    : null

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        onSearchClick={() => setSearchOpen(true)}
      />
      <div className="mx-auto flex max-w-screen-2xl">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-foreground transition-colors">
                  <Home className="h-3.5 w-3.5" />
                </Link>
                <span>/</span>
                <span>{breadcrumbs[0]}</span>
                <span>/</span>
                <span className="text-foreground font-medium">{breadcrumbs[1]}</span>
              </nav>
            )}

            {/* Page content */}
            {children}

            {/* Edit on GitHub */}
            {editUrl && (
              <div className="mt-10 border-t pt-6">
                <a
                  href={editUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Edit this page on GitHub
                </a>
              </div>
            )}

            {/* Prev / Next navigation */}
            {(prev || next) && (
              <div className="mt-8 grid grid-cols-2 gap-4">
                {prev ? (
                  <Link
                    to="/docs/$"
                    params={{ _splat: prev.slug }}
                    className="group flex flex-col gap-1 rounded-lg border bg-card p-4 hover:border-primary/30 hover:bg-accent transition-all"
                  >
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ChevronLeft className="h-3.5 w-3.5" /> Previous
                    </span>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      {prev.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
                {next ? (
                  <Link
                    to="/docs/$"
                    params={{ _splat: next.slug }}
                    className="group flex flex-col items-end gap-1 rounded-lg border bg-card p-4 hover:border-primary/30 hover:bg-accent transition-all"
                  >
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      Next <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      {next.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            )}
          </div>
        </main>

        {headings && <TableOfContents headings={headings} />}
      </div>
    </div>
  )
}
