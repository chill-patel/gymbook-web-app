/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_FALLBACK_URL: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_SOURCE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
