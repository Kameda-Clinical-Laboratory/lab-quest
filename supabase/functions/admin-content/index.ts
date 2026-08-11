// Edge Function: スタッフ向けコンテンツエディタ(Phase 4)+実習生登録の書き込み経路。
// action ルーター方式で1関数に集約(student-progress/auth-*-loginと同じ設計)。
//
// 認証: withSupabase({auth:["publishable"]})はゲートウェイ通過用(anon/publishableキーの
// 確認のみ)。「誰が/どの権限で」はこの関数自身がボディの独自JWT(APP_JWT_SECRET署名、
// auth-staff-loginが発行)を検証して決定する(student-progressのx-app-token→body.token
// 移行と同じ理由でボディ渡し)。
//
// 権限: role='staff'であることに加え、書き込み系アクションはstaffRole='full'を要求する
// (ops権限は閲覧のみ)。フロント側のボタン無効化はUXに過ぎず、実際の防御はここ。
//
// DB側のfn_*関数はservice_roleにしかEXECUTE権限がないため、このEdge Function経由でしか
// 呼び出せない。
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from 'jsr:@supabase/server@^1'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { jwtVerify } from 'npm:jose@5'
import bcrypt from 'npm:bcryptjs@3.0.3'

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

const BCRYPT_ROUNDS = 10

/** src/mocks/learning.ts の Beat 型と同じ形を素朴に扱う(この関数は型を持ち込まず構造的に処理する)。 */
type BeatLike = {
  id: string
  type: string
  xp?: number
  clueId?: string
  requiredClueIds?: string[]
  [key: string]: unknown
}

/**
 * supabase/seed/seed.ts の beatPayload() と同じロジック。
 * discriminant/DB列に昇格済みのフィールド(type,id,xp,clueId,requiredClueIds)を除いた
 * 残りをそのまま payload として送る。
 */
function beatToRow(beat: BeatLike) {
  const { type, id, xp, clueId, requiredClueIds, ...rest } = beat
  return {
    id,
    type,
    xp: xp ?? null,
    // 空文字は「未選択」を意味するがDBのclue_idはFKなのでnullに正規化する
    // (編集途中の下書き保存が空文字のまま送られてFK違反になるのを防ぐ)。
    clueId: clueId ? clueId : null,
    requiredClueIds: type === 'resolve' ? (requiredClueIds ?? []).filter((id) => id) : undefined,
    payload: rest,
  }
}

const MUTATING_ACTIONS = new Set([
  'create_unit',
  'save_unit_draft',
  'reorder_units',
  'publish_unit',
  'create_clue',
  'upsert_student',
  'reset_student_password',
  'set_retention_days',
])

async function handle(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  let body: { token?: string; action?: string; payload?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return json({ error: '不正なリクエストです' }, 400)
  }

  const token = body.token
  if (!token) return json({ error: '認証が必要です' }, 401)

  const jwtSecret = Deno.env.get('APP_JWT_SECRET')
  if (!jwtSecret) return json({ error: 'サーバー設定エラー(APP_JWT_SECRET未設定)' }, 500)

  let staffId: string
  let staffRole: 'full' | 'ops'
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret))
    if (payload.role !== 'staff' || typeof payload.sub !== 'string') {
      return json({ error: 'スタッフとしての認証が必要です' }, 403)
    }
    staffId = payload.sub
    staffRole = payload.staffRole as 'full' | 'ops'
  } catch {
    return json({ error: 'セッションが無効です。再ログインしてください' }, 401)
  }

  const action = body.action ?? ''
  const p = body.payload ?? {}

  if (MUTATING_ACTIONS.has(action) && staffRole !== 'full') {
    return json({ error: 'フル権限が必要です' }, 403)
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    switch (action) {
      case 'create_unit': {
        const { data, error } = await admin.rpc('fn_create_unit', {
          p_stage_id: p.stageId,
          p_title: p.title,
          p_request_line: p.requestLine,
          p_actor_staff_id: staffId,
        })
        if (error) throw new Error(error.message)
        return json(data)
      }

      case 'save_unit_draft': {
        const beats = ((p.beats ?? []) as BeatLike[]).map(beatToRow)
        const { data, error } = await admin.rpc('fn_save_unit_draft', {
          p_unit_id: p.unitId,
          p_title: p.title,
          p_request_line: p.requestLine,
          p_beats: beats,
          p_actor_staff_id: staffId,
        })
        if (error) throw new Error(error.message)
        return json(data)
      }

      case 'reorder_units': {
        const { error } = await admin.rpc('fn_reorder_units', {
          p_stage_id: p.stageId,
          p_ordered_ids: p.orderedIds,
          p_actor_staff_id: staffId,
        })
        if (error) throw new Error(error.message)
        return json({ ok: true })
      }

      case 'publish_unit': {
        const { data, error } = await admin.rpc('fn_publish_unit', {
          p_unit_id: p.unitId,
          p_actor_staff_id: staffId,
        })
        if (error) throw new Error(error.message)
        if (!data.ok) {
          return json({ error: '公開条件を満たしていません', validationErrors: data.errors }, 422)
        }
        return json({ unit: data.unit })
      }

      case 'create_clue': {
        const { data, error } = await admin.rpc('fn_create_clue', {
          p_stage_id: p.stageId,
          p_name: p.name,
          p_summary: p.summary,
          p_actor_staff_id: staffId,
        })
        if (error) throw new Error(error.message)
        return json(data)
      }

      case 'upsert_student': {
        const name = String(p.name ?? '').trim()
        const visitDates = (p.visitDates ?? []) as string[]
        const dayPlans = (p.dayPlans ?? []) as unknown[]
        const password = p.password ? String(p.password) : null

        if (p.id) {
          const { error } = await admin.rpc('fn_admin_update_student', {
            p_student_id: p.id,
            p_name: name,
            p_visit_dates: visitDates,
            p_day_plans: dayPlans,
            p_actor_staff_id: staffId,
          })
          if (error) throw new Error(error.message)
          if (password) {
            const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
            const { error: pwErr } = await admin.rpc('fn_admin_reset_student_password', {
              p_student_id: p.id,
              p_password_hash: passwordHash,
              p_actor_staff_id: staffId,
            })
            if (pwErr) throw new Error(pwErr.message)
          }
          return json({ studentId: p.id })
        }

        const passwordHash = await bcrypt.hash(password ?? '0000', BCRYPT_ROUNDS)
        const { data, error } = await admin.rpc('fn_admin_create_student', {
          p_name: name,
          p_password_hash: passwordHash,
          p_visit_dates: visitDates,
          p_day_plans: dayPlans,
          p_actor_staff_id: staffId,
        })
        if (error) throw new Error(error.message)
        return json(data)
      }

      case 'reset_student_password': {
        const password = String(p.password ?? '')
        if (!password) return json({ error: 'パスワードを入力してください' }, 400)
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
        const { error } = await admin.rpc('fn_admin_reset_student_password', {
          p_student_id: p.studentId,
          p_password_hash: passwordHash,
          p_actor_staff_id: staffId,
        })
        if (error) throw new Error(error.message)
        return json({ ok: true })
      }

      case 'get_settings': {
        const { data, error } = await admin.rpc('fn_get_retention_days')
        if (error) throw new Error(error.message)
        return json({ retentionDays: data })
      }

      case 'set_retention_days': {
        const days = Number(p.days)
        if (!Number.isFinite(days) || days < 1) {
          return json({ error: '保持日数は1以上の整数を指定してください' }, 400)
        }
        const { error } = await admin.rpc('fn_set_retention_days', {
          p_days: Math.trunc(days),
          p_actor_staff_id: staffId,
        })
        if (error) throw new Error(error.message)
        return json({ ok: true })
      }

      default:
        return json({ error: `unknown action: ${action}` }, 400)
    }
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'サーバーエラー' }, 500)
  }
}

export default {
  fetch: withSupabase({ auth: ['publishable'] }, async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
    return handle(req)
  }),
}
