import type { MarkdownHeading } from "../utils/markdown"

type TOCProps = {
  headings: MarkdownHeading[]
}

export function TableOfContents({ headings }: TOCProps) {
  if (headings.length === 0) return null

  const minLevel = Math.min(...headings.map((h) => h.level))

  return (
    <nav className="sticky top-20 w-56 shrink-0 hidden xl:block">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </h3>
      <ul className="space-y-1 text-sm">
        {headings.map((h, i) => (
          <li key={i}>
            <a
              href={`#${h.id}`}
              className={`block rounded px-3 py-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground ${
                h.level > minLevel ? "ml-3" : ""
              } ${h.level > minLevel + 1 ? "ml-6" : ""}`}
              style={{ fontSize: `${Math.max(0.8, 1 - (h.level - minLevel) * 0.05)}rem` }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
