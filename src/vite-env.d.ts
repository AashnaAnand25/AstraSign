/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend origin. Leave unset in dev to use the Vite `/api` proxy. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
