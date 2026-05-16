import { Link, useLocation } from "@tanstack/react-router"
import { navigation, type NavSection } from "../utils/navigation"
import { ChevronDown } from "lucide-react"

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 border-r bg-sidebar p-4 overflow-y-auto
          transition-transform duration-200 lg:sticky lg:top-16 lg:z-0 lg:block lg:h-[calc(100vh-4rem)]
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <nav className="space-y-1">
          {navigation.map((section) => (
            <SidebarSection key={section.title} section={section} onClose={onClose} />
          ))}
        </nav>
      </aside>
    </>
  )
}

function SidebarSection({
  section,
  onClose,
}: {
  section: NavSection
  onClose: () => void
}) {
  const location = useLocation()
  const isActive = section.items.some(
    (item) => location.pathname === `/docs/${item.slug}`,
  )

  return (
    <details open={isActive} className="group">
      <summary className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent">
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-0 -rotate-90" />
        {section.title}
      </summary>
      <div className="ml-2 mt-1 space-y-0.5 border-l pl-2">
        {section.items.map((item) => {
          const active = location.pathname === `/docs/${item.slug}`
          return (
            <Link
              key={item.slug}
              to="/docs/$"
              params={{ _splat: item.slug }}
              onClick={onClose}
              className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              {item.title}
            </Link>
          )
        })}
      </div>
    </details>
  )
}
