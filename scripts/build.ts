import { convert } from '@catalystic/json-to-yaml'
import { ApiClient, CMSSpaceClient } from '@trigani/api-client'
import { config } from 'dotenv'
import fs from 'fs/promises'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import duration from 'format-duration'
import { parse } from 'node-html-parser'
import beautify from 'js-beautify'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: __dirname + '/.env' })

// Try to load .env file but don't fail if it doesn't exist (for Vercel)
try {
  config({ path: path.resolve(__dirname, '../.env') })
} catch (error) {
  console.log('No .env file found, using environment variables')
}

// Use process.env for all environments
const env = process.env

const domain = env.API_DOMAIN as string
const workspace = env.API_WORKSPACE as string
const spaceIdentifier = env.API_SPACE as string
const key = env.API_KEY as string

// Set page size to maximum allowed (100)
const pageSize = 100
// Only fetch categories
const types = [
  'categories',
  'authors',
  'blogs',
  'pages',
]

const apiClient = new ApiClient({
  domain,
  workspace,
  key,
  version: 1,
  timeout: 30000,
})

const space = new CMSSpaceClient(apiClient, spaceIdentifier)

const contentDirectory = path.resolve(__dirname, '../src/content')

async function build() {
  const now = Date.now()
  console.log('🏁: Starting build')

  await createDirectory(contentDirectory)
  for (const type of types) {
    console.log('Importing ' + type)

    await fetcher(type)
  }
  const finish = Date.now()
  console.log('🏁: Finished build in', duration(finish - now, { ms: true }))
}

async function fetcher(type: (typeof types)[number]) {
  const typePath = path.resolve(contentDirectory, type)
  await createDirectory(typePath)

  // First, get the total count to know how many pages we need
  const countRequest = await space.getRows(type, {
    page: 1,
    pageSize: 1, // Just need the count, not actual data
  })

  const totalItems = countRequest.meta.total
  const totalPages = Math.ceil(totalItems / pageSize)

  console.log(
    `Found ${totalItems} total ${type}. Will fetch in ${totalPages} pages.`
  )

  let allItems: any[] = []
  let handled = 0

  // Now fetch all pages
  for (let page = 1; page <= totalPages; page++) {
    const start = Date.now()
    console.log(
      `Fetching page ${page}/${totalPages} (items ${
        (page - 1) * pageSize + 1
      }-${Math.min(page * pageSize, totalItems)})`
    )

    try {
      const results = await space.getRows(type, {
        page,
        pageSize,
        populate: type === 'authors' ? { avatar: true } : { image: true },
        formatOptions: { richText: 'html' },
      })

      const fetch = Date.now()
      console.log(
        `Fetched page ${page} in ${duration(fetch - start, { ms: true })}`
      )

      // Process each item in this page
      for (const result of results.data) {
        const { content, ...rest } = result
        const formatted = format(rest, content, type)

        await write(typePath, `${rest.id}.mdx`, formatted)
        allItems.push(result)
        handled++
      }

      const written = Date.now()
      console.log(
        `Processed page ${page} in ${duration(written - fetch, { ms: true })}`
      )
      console.log(
        `Progress: ${handled}/${totalItems} ${type} (${Math.round(
          (handled / totalItems) * 100
        )}%)`
      )
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error)
      // Continue with next page even if this one fails
    }
  }

  // Verify we got all items
  console.log(
    `Completed fetching ${type}. Processed ${handled}/${totalItems} items.`
  )

  if (handled < totalItems) {
    console.warn(
      `⚠️ Warning: Only processed ${handled} of ${totalItems} ${type}`
    )
  }
}

function format(
  frontmatter: Record<string, any>,
  content: string | undefined,
  type: (typeof types)[number]
) {
  formatImages(frontmatter)
  if (frontmatter?.slug) {
    let temporal = frontmatter.slug
    delete frontmatter.slug
    frontmatter.handle = temporal
  }

  if (
    type === 'sections' ||
    type === 'blocks' ||
    type === 'pages' ||
    type === 'meta'
  ) {
    delete frontmatter.id
    frontmatter.id = frontmatter.identifier.replace('.', '-')
  }

  const htmlString = content
    ? parse(content, {
        parseNoneClosedTags: true,
        voidTag: { closingSlash: true },
      }).toString()
    : ''

  return `---
${convert(frontmatter)}
---
${beautify.html_beautify(htmlString, {
  indent_size: 2,
  preserve_newlines: true,
  max_preserve_newlines: 1,
  end_with_newline: true,
  indent_body_inner_html: true,
  unformatted: [], // Format all tags
  content_unformatted: [], // Format content in all tags
  extra_liners: ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], // Add extra line before these tags
  wrap_line_length: 0, // Prevent line wrapping
})}`
}

function populate(type: string) {
  switch (type) {
    case 'blogs':
      return { image: true, author: true, category: true }
    default:
      return {}
  }
}
async function write(_path: string, name: string, result: string) {
  const filePath = path.resolve(_path, name)
  await fs.writeFile(filePath, result, {
    encoding: 'utf-8',
    flag: 'w',
  })
}

function formatImages(item: Record<string, any>) {
  const imageKeys = ['avatar', 'image']

  for (const key of imageKeys) {
    if (item?.[key] && item?.[key]?.url) {
      if (item?.[key]?.formats && Array.isArray(item?.[key]?.formats)) {
        item[`${key}_formats`] = (item[key].formats as Array<any>).reduce(
          (acc, format) => {
            acc[format.format] = format.url
            return acc
          },
          {}
        )
      }
      item[key] = item[key].url
    }
  }
}

async function createDirectory(_path: string) {
  await fs.mkdir(_path, { recursive: true })
}

build()
