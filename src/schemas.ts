import { reference, z } from 'astro:content'

const common = z.object({
  publishedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  deletedAt: z.string().nullable(),
  folio: z.number(),
  id: z.string(),
})

const blogSchema = common.extend({
  title: z.string(),
  image: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  keywords: z.array(z.string()),
  handle: z.string(),
  author: reference('authors'),
  category: reference('categories'),
})

const authorSchema = common.extend({
  name: z.string(),
})

const categorySchema = common.extend({
  name: z.string(),
  handle: z.string(),
})

export { blogSchema, authorSchema, categorySchema }
