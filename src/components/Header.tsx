import { Link } from "@tanstack/react-router"
import { Menu, Moon, Sun, Search, ExternalLink } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

type HeaderProps = {
  onMenuClick: () => void
  onSearchClick?: () => void
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-9 w-9" />
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

export function Header({ onMenuClick, onSearchClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-3 px-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuClick}
          className="lg:hidden -ml-1 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo + wordmark */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <img src="/logo.svg" alt="Rok" className="h-7 w-7 rounded-lg transition-transform group-hover:scale-105" />
          <span className="font-bold text-base tracking-tight">Rok</span>
          <span className="hidden sm:inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            v0.2
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-0.5 ml-3">
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
          <a
            href="https://crates.io/search?q=rok"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            Crates
          </a>
        </nav>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-1">
          {/* Search */}
          <button
            onClick={onSearchClick}
            className="hidden sm:flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Search docs"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden lg:inline text-xs">Search docs</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border bg-background px-1 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>
          <button
            onClick={onSearchClick}
            className="sm:hidden flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent transition-colors"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Dark mode toggle */}
          <ThemeToggle />

          {/* GitHub link */}
          <a
            href="https://github.com/ateeq1999/axum-rok-http"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="View on GitHub"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  )
}
