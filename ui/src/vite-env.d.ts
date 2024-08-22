/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FLOW_TRANSLATOR_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
