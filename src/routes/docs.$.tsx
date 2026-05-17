import { createFileRoute, notFound, Link } from "@tanstack/react-router"
import { useState } from "react"
import { allDocs } from "content-collections"
import { Markdown } from "../components/Markdown"
import { DocLayout } from "../components/DocLayout"
import type { MarkdownHeading } from "../utils/markdown"

function NotFoundContent() {
  return (
    <DocLayout>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 text-5xl">📄</div>
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          This documentation page doesn't exist yet.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go home
        </Link>
      </div>
    </DocLayout>
  )
}

export const Route = createFileRoute("/docs/$")({
  loader: ({ params }) => {
    const slug = params._splat ?? ""
    const doc = allDocs.find((d) => d.slug === slug)
    if (!doc) throw notFound()
    return doc
  },
  component: DocsPage,
  notFoundComponent: NotFoundContent,
})

function DocsPage() {
  const doc = Route.useLoaderData()
  const [headings, setHeadings] = useState<MarkdownHeading[]>([])

  return (
    <DocLayout headings={headings} slug={doc.slug}>
      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{doc.title}</h1>
          {doc.description && (
            <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
              {doc.description}
            </p>
          )}
        </header>
        <Markdown
          content={doc.content}
          onHeadings={setHeadings}
          title={doc.title}
          slug={doc.slug}
        />
      </article>
    </DocLayout>
  )
}
