import { defineCollection, defineConfig } from "@content-collections/core"
import { z } from "zod"

const docs = defineCollection({
  name: "docs",
  directory: "./content",
  include: "**/*.md",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    content: z.string(),
  }),
  transform: ({ content, ...meta }) => {
    return {
      ...meta,
      slug: meta._meta.path,
      content,
    }
  },
})

export default defineConfig({
  content: [docs],
})
