/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  /** 'mock' = 従来どおりインメモリ, 'supabase' = Supabaseバックエンドを使用 (Phase 1で導入) */
  readonly VITE_BACKEND_MODE?: 'mock' | 'supabase'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
