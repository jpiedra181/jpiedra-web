import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().min(120).max(160),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Javier Piedra'),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    category: z.enum(['normativa', 'tecnico', 'opinion', 'tutorial', 'casos']).default('normativa'),
    draft: z.boolean().default(false),
  }),
})

// Fichas de accesibilidad de los proyectos propios (solo en castellano). El
// original vive en el expediente de cada proyecto, en jpiedra-clientes.
const fichas = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/fichas' }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().max(65),
    description: z.string().min(120).max(160),
    lead: z.string(),
    projectName: z.string(),
    site: z.string().url(),
    siteLang: z.enum(['es', 'en']),
    auditDate: z.coerce.date(),
    verifiedDate: z.coerce.date(),
    ogImage: z.string(),
    verdicts: z.array(z.object({ norm: z.string(), result: z.string(), detail: z.string() })),
    facts: z.array(z.object({ label: z.string(), value: z.string() })),
  }),
})

export const collections = { blog, fichas }