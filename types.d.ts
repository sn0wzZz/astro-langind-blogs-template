declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined
    API_DOMAIN: string
    API_WORKSPACE: string
    API_SPACE: string
    API_KEY: string
  }
}
