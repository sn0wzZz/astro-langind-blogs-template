import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'
import { authorSchema, blogSchema, categorySchema } from './schemas'

const blogs = defineCollection({
  loader: glob({ base: './src/content/blogs', pattern: '**/*.{md,mdx}'}),
  schema: blogSchema,
})

const authors = defineCollection({
  loader: glob({ base: './src/content/authors', pattern: '**/*.{md,mdx}' }),
  schema: authorSchema,
})

const categories = defineCollection({
  loader: glob({ base: './src/content/categories', pattern: '**/*.{md,mdx}' }),
  schema: categorySchema
})

export const collections = { blogs, authors, categories }
