import { Link } from "@tanstack/react-router"
import { Menu, ExternalLink } from "lucide-react"

type HeaderProps = {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-4 px-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden -ml-2 rounded-md p-2 text-muted-foreground hover:bg-accent"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono text-sm font-bold">
            R
          </span>
          Rok
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          <Link
            to="/"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            to="/docs/$"
            params={{ _splat: "getting-started/installation" }}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            Docs
          </Link>
          <a
            href="https://github.com/ateeq1999/axum-rok-http"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://github.com/ateeq1999/axum-rok-http"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md p-2 text-muted-foreground hover:bg-accent transition-colors"
            aria-label="GitHub"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </div>
    </header>
  )
}
