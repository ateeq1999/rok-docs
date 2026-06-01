export type NavItem = {
  title: string
  slug: string
}

export type NavSection = {
  title: string
  items: NavItem[]
}

export const navigation: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Installation", slug: "getting-started/installation" },
      { title: "Configuration", slug: "getting-started/configuration" },
      { title: "Project Structure", slug: "getting-started/project-structure" },
      { title: "First App", slug: "getting-started/first-app" },
    ],
  },
  {
    title: "Guide",
    items: [
      { title: "Routing", slug: "guide/routing" },
      { title: "Controllers", slug: "guide/controllers" },
      { title: "Models", slug: "guide/models" },
      { title: "Middleware", slug: "guide/middleware" },
      { title: "Validation", slug: "guide/validation" },
      { title: "Error Handling", slug: "guide/error-handling" },
      { title: "Testing", slug: "guide/testing" },
      { title: "API Responses", slug: "guide/api-responses" },
    ],
  },
  {
    title: "ORM",
    items: [
      { title: "Overview", slug: "orm/overview" },
      { title: "Queries", slug: "orm/queries" },
      { title: "Relationships", slug: "orm/relationships" },
      { title: "Migrations", slug: "orm/migrations" },
      { title: "Seeders", slug: "orm/seeders" },
      { title: "Factories", slug: "orm/factories" },
    ],
  },
  {
    title: "Authentication",
    items: [
      { title: "Overview", slug: "auth/overview" },
      { title: "JWT Auth", slug: "auth/jwt" },
      { title: "Session Auth", slug: "auth/session" },
      { title: "Social Auth", slug: "auth/social" },
      { title: "Magic Link", slug: "auth/magic-link" },
      { title: "Authorization", slug: "auth/authorization" },
      { title: "ACL", slug: "auth/acl" },
    ],
  },
  {
    title: "Services",
    items: [
      { title: "Mail", slug: "services/mail" },
      { title: "Cache", slug: "services/cache" },
      { title: "Queue", slug: "services/queue" },
      { title: "Storage", slug: "services/storage" },
      { title: "Notifications", slug: "services/notifications" },
      { title: "Scheduling", slug: "services/scheduling" },
      { title: "WebSockets", slug: "services/websockets" },
    ],
  },
  {
    title: "Security",
    items: [
      { title: "Encryption", slug: "security/encryption" },
      { title: "Hashing", slug: "security/hashing" },
      { title: "CORS", slug: "security/cors" },
      { title: "Rate Limiting", slug: "security/rate-limiting" },
      { title: "Security Headers", slug: "security/security-headers" },
    ],
  },
  {
    title: "Dig Deeper",
    items: [
      { title: "Events", slug: "dig-deeper/events" },
      { title: "IDs", slug: "dig-deeper/ids" },
      { title: "i18n", slug: "dig-deeper/i18n" },
      { title: "Feature Flags", slug: "dig-deeper/feature-flags" },
      { title: "Search", slug: "dig-deeper/search" },
      { title: "Telemetry", slug: "dig-deeper/telemetry" },
      { title: "CLI Reference", slug: "dig-deeper/cli" },
    ],
  },
  {
    title: "Deployment",
    items: [
      { title: "Docker", slug: "deployment/docker" },
      { title: "Environment", slug: "deployment/environment" },
      { title: "Production", slug: "deployment/production" },
      { title: "Publishing", slug: "deployment/publishing" },
    ],
  },
]
