import { useState } from "react"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { TableOfContents } from "./TableOfContents"
import type { MarkdownHeading } from "../utils/markdown"

type DocLayoutProps = {
  children: React.ReactNode
  headings?: MarkdownHeading[]
}

export function DocLayout({ children, headings }: DocLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="mx-auto flex max-w-screen-2xl">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            {children}
          </div>
        </main>
        {headings && <TableOfContents headings={headings} />}
      </div>
    </div>
  )
}
