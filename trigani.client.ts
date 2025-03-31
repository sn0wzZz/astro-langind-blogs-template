import { ApiClient, CMSSpaceClient } from '@trigani/api-client'
import { config } from 'dotenv'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
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

const apiClient = new ApiClient({
  domain,
  workspace,
  key,
  version: 1,
  timeout: 180000,
})

export const trigani = new CMSSpaceClient(apiClient, spaceIdentifier)
