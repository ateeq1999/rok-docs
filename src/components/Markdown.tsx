import { useEffect, useState, useRef, useCallback } from "react"
import parse, {
  type HTMLReactParserOptions,
  Element,
  domToReact,
} from "html-react-parser"
import {
  renderMarkdown,
  type MarkdownResult,
  type MarkdownHeading,
} from "../utils/markdown"

type MarkdownProps = {
  content: string
  className?: string
  onHeadings?: (headings: MarkdownHeading[]) => void
  title?: string
  slug?: string
}

/* ── Copy button ── */
function CopyButton({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="rounded-md border bg-background px-2 py-1 text-xs font-medium text-muted-foreground opacity-0 transition-all hover:bg-accent hover:text-foreground group-hover:opacity-100"
    >
      {copied ? "✓ Copied" : label ?? "Copy"}
    </button>
  )
}

/* ── AI chat helper ── */
function AIChatButton({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
    >
      <span>{icon}</span>
      {label}
    </a>
  )
}

/* ── Callout / admonition ── */
const CALLOUT_TYPES: Record<string, { icon: string; title: string; cls: string }> = {
  NOTE: { icon: "ℹ️", title: "Note", cls: "callout-note" },
  TIP: { icon: "💡", title: "Tip", cls: "callout-tip" },
  WARNING: { icon: "⚠️", title: "Warning", cls: "callout-warning" },
  DANGER: { icon: "🚨", title: "Danger", cls: "callout-danger" },
  INFO: { icon: "📌", title: "Info", cls: "callout-info" },
}

function parseCallout(text: string): { type: string; body: string } | null {
  const match = text.match(/^\[!(NOTE|TIP|WARNING|DANGER|INFO)\]\s*\n?([\s\S]*)$/i)
  if (!match) return null
  return { type: match[1].toUpperCase(), body: match[2].trim() }
}

/* ── Code block ── */
function CodeBlock({
  lang,
  code,
  children,
}: {
  lang: string
  code: string
  children: React.ReactNode
}) {
  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b bg-muted/70 px-4 py-2">
        <span className="font-mono text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {lang || "code"}
        </span>
        <CopyButton code={code} />
      </div>
      {/* Code area */}
      <pre className="overflow-x-auto bg-muted/30 p-5 text-sm leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  )
}

/* ── Heading with anchor ── */
function HeadingWithAnchor({
  level,
  id,
  children,
}: {
  level: 1 | 2 | 3 | 4 | 5 | 6
  id: string
  children: React.ReactNode
}) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  const cls: Record<number, string> = {
    1: "prose-custom-h1 group flex items-center gap-1",
    2: "prose-custom-h2 group flex items-center gap-1",
    3: "prose-custom-h3 group flex items-center gap-1",
    4: "prose-custom-h4 group flex items-center gap-1",
    5: "prose-custom-h5 group flex items-center gap-1",
    6: "prose-custom-h6 group flex items-center gap-1",
  }
  return (
    <Tag id={id} className={cls[level]}>
      {children}
      <a
        href={`#${id}`}
        className="heading-anchor ml-1 text-muted-foreground opacity-0 group-hover:opacity-100 no-underline transition-opacity"
        aria-label="Anchor link"
      >
        #
      </a>
    </Tag>
  )
}

/* ── Extract text from dom node ── */
function extractCode(domNode: Element): string {
  const parts: string[] = []
  for (const child of domNode.children) {
    if (child instanceof Element) {
      parts.push(extractCode(child))
    } else if (child.type === "text") {
      parts.push((child as { data: string }).data)
    }
  }
  return parts.join("")
}

export function Markdown({
  content,
  className,
  onHeadings,
  title,
  slug,
}: MarkdownProps) {
  const [result, setResult] = useState<MarkdownResult | null>(null)
  const mounted = useRef(true)
  const [copiedDoc, setCopiedDoc] = useState(false)

  useEffect(() => {
    mounted.current = true
    renderMarkdown(content).then((res) => {
      if (mounted.current) {
        setResult(res)
        onHeadings?.(res.headings)
      }
    })
    return () => {
      mounted.current = false
    }
  }, [content, onHeadings])

  const copyDocAsMarkdown = useCallback(() => {
    navigator.clipboard.writeText(content)
    setCopiedDoc(true)
    setTimeout(() => setCopiedDoc(false), 1500)
  }, [content])

  const pageUrl = slug ? `https://rok.rs/docs/${slug}` : "https://rok.rs"

  /* Loading skeleton */
  if (!result) {
    return (
      <div className={cn("animate-pulse space-y-4", className)}>
        <div className="h-8 w-1/2 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-4 w-4/5 rounded bg-muted" />
        <div className="mt-6 h-32 w-full rounded bg-muted" />
      </div>
    )
  }

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (!(domNode instanceof Element)) return

      /* External / internal links */
      if (domNode.name === "a") {
        const href = domNode.attribs.href
        const inner = domToReact(domNode.children, options)
        if (href?.startsWith("/")) {
          return (
            <a href={href} className="text-primary underline underline-offset-2 hover:text-primary/80">
              {inner}
            </a>
          )
        }
        if (href?.startsWith("http")) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:text-primary/80 inline-flex items-baseline gap-0.5"
            >
              {inner}
              <span className="text-xs">↗</span>
            </a>
          )
        }
      }

      /* Headings with anchor links */
      if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(domNode.name)) {
        const level = Number(domNode.name[1]) as 1 | 2 | 3 | 4 | 5 | 6
        const id = domNode.attribs.id ?? ""
        return (
          <HeadingWithAnchor level={level} id={id}>
            {domToReact(domNode.children, options)}
          </HeadingWithAnchor>
        )
      }

      /* Images */
      if (domNode.name === "img") {
        return (
          <img
            {...domNode.attribs}
            loading="lazy"
            className="my-6 rounded-lg border shadow-sm max-w-full"
          />
        )
      }

      /* Tables */
      if (domNode.name === "table") {
        return (
          <div className="my-6 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              {domToReact(domNode.children, options)}
            </table>
          </div>
        )
      }

      /* Blockquote → callout */
      if (domNode.name === "blockquote") {
        const rawText = extractCode(domNode).trim()
        const callout = parseCallout(rawText)
        if (callout) {
          const meta = CALLOUT_TYPES[callout.type] ?? CALLOUT_TYPES.NOTE
          return (
            <div className={`callout ${meta.cls}`}>
              <span className="callout-icon">{meta.icon}</span>
              <div className="callout-body">
                <div className="callout-title">{meta.title}</div>
                <div>{callout.body}</div>
              </div>
            </div>
          )
        }
        /* Regular blockquote */
        return (
          <blockquote className="my-4 border-l-4 border-primary/30 pl-4 italic text-muted-foreground">
            {domToReact(domNode.children, options)}
          </blockquote>
        )
      }

      /* Code blocks */
      if (domNode.name === "pre") {
        const codeEl = domNode.children.find(
          (child): child is Element =>
            child instanceof Element && child.name === "code",
        )
        if (codeEl) {
          const lang = (codeEl.attribs.class ?? "").replace(/^language-/, "")
          const codeText = extractCode(codeEl)
          return (
            <CodeBlock lang={lang} code={codeText}>
              {domToReact(codeEl.children, options)}
            </CodeBlock>
          )
        }
      }
    },
  }

  return (
    <div className={cn("prose-custom page-enter", className)}>
      {/* Page-level actions */}
      {(title || slug) && (
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b pb-4">
          <button
            onClick={copyDocAsMarkdown}
            className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            {copiedDoc ? "✓ Copied" : "Copy markdown"}
          </button>
          <AIChatButton
            href={`https://chatgpt.com/?q=${encodeURIComponent(`Explain rok docs: ${title ?? ""}`)}`}
            label="ChatGPT"
            icon="🤖"
          />
          <AIChatButton
            href={`https://claude.ai/new?q=${encodeURIComponent(
              `I'm reading the rok docs page "${title}". The URL is ${pageUrl}. Can you help me understand this?`,
            )}`}
            label="Claude"
            icon="✦"
          />
        </div>
      )}
      {parse(result.markup, options)}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ")
}
