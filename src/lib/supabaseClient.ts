import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Phase 0時点ではまだ .env.local が未設定でも `npm run dev` 自体は落とさない
  // (VITE_BACKEND_MODE=mock の間はこのクライアントは使われない)。
  // Phase 1で supabase モードを使い始めたら、ここで例外にする。
  console.warn(
    '[supabaseClient] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY が未設定です。' +
      '.env.local.example を .env.local にコピーし、値を設定してください。',
  )
}

/**
 * anon key で初期化したクライアント。
 * 認証は Supabase Auth を使わず自前の Edge Function(auth-student-login 等)で行うため、
 * ログイン後は毎リクエスト `Authorization: Bearer <独自JWT>` を付与する運用にする
 * (Phase 2で `supabase.auth.setSession` 相当の仕組みを実装する際にここを拡張する)。
 */
export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    // 独自JWT運用のため、Supabase Auth標準のセッション永続化/自動リフレッシュは使わない
    persistSession: false,
    autoRefreshToken: false,
  },
})
