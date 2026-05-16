import { useEffect, useState, useRef } from "react"
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
}

export function Markdown({ content, className, onHeadings }: MarkdownProps) {
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

  if (!result) {
    return (
      <div className={cn("animate-pulse space-y-4", className)}>
        <div className="h-6 w-3/4 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
      </div>
    )
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
            const className = codeEl.attribs.class || ""
            const code = domToReact(codeEl.children, options)
            return (
              <pre className="relative overflow-x-auto rounded-lg border bg-muted p-4 text-sm leading-relaxed">
                <code>{code}</code>
              </pre>
            )
          }
        }
      }
    },
  }

  return (
    <div className={cn("prose-custom", className)}>
      {parse(result.markup, options)}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ")
}
