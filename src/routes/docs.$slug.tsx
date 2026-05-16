import { createFileRoute, notFound, Link } from "@tanstack/react-router"
import { useState } from "react"
import { allDocs } from "content-collections"
import { Markdown } from "../components/Markdown"
import { DocLayout } from "../components/DocLayout"
import type { MarkdownHeading } from "../utils/markdown"

function NotFoundContent() {
  return (
    <DocLayout>
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Documentation not found.</p>
        <Link
          to="/"
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Go home
        </Link>
      </div>
    </DocLayout>
  )
}

export const Route = createFileRoute("/docs/$slug")({
  loader: ({ params }) => {
    const doc = allDocs.find((d) => d.slug === params.slug)
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
    <DocLayout headings={headings}>
      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{doc.title}</h1>
          {doc.description && (
            <p className="mt-2 text-lg text-muted-foreground">
              {doc.description}
            </p>
          )}
        </header>
        <Markdown
          content={doc.content}
          onHeadings={setHeadings}
        />
      </article>
    </DocLayout>
  )
}
