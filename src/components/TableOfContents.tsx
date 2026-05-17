import { useEffect, useRef, useState } from "react"
import type { MarkdownHeading } from "../utils/markdown"

type TOCProps = {
  headings: MarkdownHeading[]
}

export function TableOfContents({ headings }: TOCProps) {
  const [activeId, setActiveId] = useState<string>("")
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (headings.length === 0) return

    observerRef.current?.disconnect()

    const handler: IntersectionObserverCallback = (entries) => {
      const visible = entries.filter((e) => e.isIntersecting)
      if (visible.length > 0) {
        setActiveId(visible[0].target.id)
      }
    }

    observerRef.current = new IntersectionObserver(handler, {
      rootMargin: "-64px 0% -60% 0%",
      threshold: 0,
    })

    for (const heading of headings) {
      const el = document.getElementById(heading.id)
      if (el) observerRef.current.observe(el)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [headings])

  if (headings.length === 0) return null

  const minLevel = Math.min(...headings.map((h) => h.level))

  const indentClass = (level: number) => {
    const diff = level - minLevel
    if (diff === 0) return ""
    if (diff === 1) return "pl-3"
    return "pl-6"
  }

  return (
    <nav
      className="sticky top-20 w-60 shrink-0 hidden xl:block self-start py-8 pr-4"
      aria-label="Table of contents"
    >
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10M4 18h6" />
        </svg>
        On this page
      </p>
      <ul className="space-y-0.5 text-sm">
        {headings.map((h) => {
          const isActive = activeId === h.id
          return (
            <li key={h.id} className={indentClass(h.level)}>
              <a
                href={`#${h.id}`}
                onClick={() => setActiveId(h.id)}
                className={`block rounded-md px-2.5 py-1.5 leading-snug transition-all duration-150 ${
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {h.text}
              </a>
            </li>
          )
        })}
      </ul>

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7 7 7" />
        </svg>
        Back to top
      </button>
    </nav>
  )
}
