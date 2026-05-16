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

function CopyButton({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="absolute right-2 top-2 rounded-md border bg-background px-2 py-1 text-xs font-medium text-muted-foreground opacity-0 transition-all hover:bg-accent hover:text-foreground group-hover:opacity-100"
    >
      {copied ? "Copied!" : label || "Copy"}
    </button>
  )
}

function AIChatButton({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      <span className="text-xs">{icon}</span>
      {label}
    </a>
  )
}

export function Markdown({ content, className, onHeadings, title, slug }: MarkdownProps) {
  const [result, setResult] = useState<MarkdownResult | null>(null)
  const mounted = useRef(true)

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

  const [copiedDoc, setCopiedDoc] = useState(false)

  const copyDocAsMarkdown = useCallback(() => {
    navigator.clipboard.writeText(content)
    setCopiedDoc(true)
    setTimeout(() => setCopiedDoc(false), 1500)
  }, [content])

  const pageUrl = slug
    ? `https://rok.rs/docs/${slug}`
    : "https://rok.rs"

  if (!result) {
    return (
      <div className={cn("animate-pulse space-y-4", className)}>
        <div className="h-6 w-3/4 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
      </div>
    )
  }

  const extractCode = (domNode: Element): string => {
    const parts: string[] = []
    for (const child of domNode.children) {
      if (child instanceof Element) {
        parts.push(extractCode(child))
      } else if (child.type === "text") {
        parts.push(child.data)
      }
    }
    return parts.join("")
  }

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element) {
        if (domNode.name === "a") {
          const href = domNode.attribs.href
          if (href?.startsWith("/")) {
            return (
              <a href={href} className="text-primary underline underline-offset-2 hover:text-primary/80">
                {domToReact(domNode.children, options)}
              </a>
            )
          }
          if (href?.startsWith("http")) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                {domToReact(domNode.children, options)}
                <span className="ml-1 text-xs">↗</span>
              </a>
            )
          }
        }

        if (domNode.name === "img") {
          return (
            <img
              {...domNode.attribs}
              loading="lazy"
              className="rounded-lg border shadow-sm"
            />
          )
        }

        if (domNode.name === "table") {
          return (
            <div className="my-6 overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                {domToReact(domNode.children, options)}
              </table>
            </div>
          )
        }

        if (domNode.name === "pre") {
          const codeEl = domNode.children.find(
            (child): child is Element =>
              child instanceof Element && child.name === "code",
          )
          if (codeEl) {
            const lang = (codeEl.attribs.class || "").replace(/^language-/, "")
            const codeText = extractCode(codeEl)
            return (
              <div className="group relative my-4">
                <div className="flex items-center justify-between rounded-t-lg border-x border-t bg-muted px-4 py-1.5 text-xs text-muted-foreground">
                  <span>{lang || "code"}</span>
                  <div className="flex items-center gap-1.5">
                    <CopyButton code={codeText} />
                  </div>
                </div>
                <pre className="overflow-x-auto rounded-b-lg border bg-muted/50 p-4 text-sm leading-relaxed">
                  <code>{domToReact(codeEl.children, options)}</code>
                </pre>
              </div>
            )
          }
        }
      }
    },
  }

  return (
    <div className={cn("prose-custom", className)}>
      {(title || slug) && (
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b pb-4">
          <CopyButton code={content} label={copiedDoc ? "Copied!" : "Copy as Markdown"} />
          <AIChatButton
            href={`https://chatgpt.com/?q=Explain+rok+docs%3A+${encodeURIComponent(title || "")}`}
            label="ChatGPT"
            icon="🤖"
          />
          <AIChatButton
            href={`https://claude.ai/new?q=${encodeURIComponent(`I'm reading the rok docs page "${title}". The URL is ${pageUrl}. Can you help me understand this?`)}`}
            label="Claude"
            icon="🦊"
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
