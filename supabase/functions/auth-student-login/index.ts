// Edge Function: 実習生ログイン(コード+パスワード)。
// Supabase Authの標準メールフローは使わず、students テーブルに対して
// bcryptで自前検証し、独自JWT(APP_JWT_SECRETで署名)を発行する。
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY はSupabaseが全Edge Functionに
// 自動的に注入するため、ここでの追加設定は不要。
// APP_JWT_SECRET だけは手動でこの関数のSecretsに設定する必要がある。
//
// このプロジェクトの実行環境は withSupabase ラッパー必須の新方式のため、
// auth: ["publishable"] を指定してanon(publishable)キーでの呼び出しを許可する
// (このエンドポイント自体がログイン用で、呼び出し側はまだ誰の認証も持たないため)。
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from 'jsr:@supabase/server@^1'
import { createClient } from 'npm:@supabase/supabase-js@2'
import bcrypt from 'npm:bcryptjs@3.0.3'
import { SignJWT } from 'npm:jose@5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function handle(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  let body: { code?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: '不正なリクエストです' }, 400)
  }

  const code = (body.code ?? '').trim()
  const password = (body.password ?? '').trim()
  if (!code || !password) {
    return json({ error: '受講者コードとパスワードを入力してください' }, 400)
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: student } = await admin
    .from('students')
    .select('id, code, name, password_hash, anonymized_at')
    .ilike('code', code)
    .maybeSingle()

  // 匿名化済み(退会扱い)の実習生はログインできない(Phase 5のデータ保持ポリシー用)
  if (!student || student.anonymized_at) {
    return json({ error: '受講者コードまたはパスワードが違います' }, 401)
  }

  const ok = await bcrypt.compare(password, student.password_hash)
  if (!ok) {
    return json({ error: '受講者コードまたはパスワードが違います' }, 401)
  }

  const jwtSecret = Deno.env.get('APP_JWT_SECRET')
  if (!jwtSecret) {
    return json({ error: 'サーバー設定エラー(APP_JWT_SECRET未設定)' }, 500)
  }

  const token = await new SignJWT({ role: 'student', code: student.code })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(student.id)
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(new TextEncoder().encode(jwtSecret))

  return json({
    token,
    student: { id: student.id, code: student.code, name: student.name },
  })
}

export default {
  fetch: withSupabase({ auth: ['publishable'] }, async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
    return handle(req)
  }),
}
