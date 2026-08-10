// Edge Function: スタッフログイン(パスワードのみ、現行モックのUXを踏襲)。
// staff テーブルの全行に対しbcrypt照合し、一致した行から独自JWTを発行する。
//
// このプロジェクトの実行環境は withSupabase ラッパー必須の新方式のため、
// auth: ["publishable"] を指定してanon(publishable)キーでの呼び出しを許可する。
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

  let body: { password?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: '不正なリクエストです' }, 400)
  }

  const password = (body.password ?? '').trim()
  if (!password) {
    return json({ error: 'パスワードを入力してください' }, 400)
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: staffRows } = await admin.from('staff').select('id, name, role, password_hash')

  let matched: { id: string; name: string; role: 'full' | 'ops' } | null = null
  for (const s of staffRows ?? []) {
    if (await bcrypt.compare(password, s.password_hash)) {
      matched = { id: s.id, name: s.name, role: s.role }
      break
    }
  }

  if (!matched) {
    return json({ error: 'パスワードが違います' }, 401)
  }

  const jwtSecret = Deno.env.get('APP_JWT_SECRET')
  if (!jwtSecret) {
    return json({ error: 'サーバー設定エラー(APP_JWT_SECRET未設定)' }, 500)
  }

  const token = await new SignJWT({ role: 'staff', staffRole: matched.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(matched.id)
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(new TextEncoder().encode(jwtSecret))

  return json({ token, staff: matched })
}

export default {
  fetch: withSupabase({ auth: ['publishable'] }, async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
    return handle(req)
  }),
}
