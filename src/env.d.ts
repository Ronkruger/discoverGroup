/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_ADMIN_API_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}