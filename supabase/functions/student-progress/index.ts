// Edge Function: 学生進捗の読み書き(Phase 3)。
// action ルーター方式で1関数に集約(ダッシュボードでのデプロイ数を減らすため)。
//
// 認証: withSupabase({auth:["publishable"]})はゲートウェイ通過用
// (publishable/anon キーであることの確認のみ)。実際に「誰の進捗か」は
// x-app-token ヘッダに載せた独自JWT(APP_JWT_SECRET署名)をこの関数自身が検証して
// 決定する。Authorization ヘッダは gateway 用に publishable キーのまま空けておく必要が
// あるため、独自トークンは別ヘッダ(x-app-token)で渡す設計にしている。
//
// DB側のfn_*関数はservice_roleにしかEXECUTE権限がないため、
// このEdge Function(service_roleクライアントを内部で使う)経由でしか
// 呼び出せない = 「JWT検証をここで済ませたリクエストだけがDBを触れる」が成立する。
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from 'jsr:@supabase/server@^1'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { jwtVerify } from 'npm:jose@5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-app-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

const CBT_TARGET = 30

interface QuestionRow {
  id: string
  prompt: string
  choices: string[]
  correct_index: number
  explanation: string
  source_stage_id: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** src/mocks/schedule.ts の buildCbtPaper と同じロジック(DBカラム名に合わせて移植)。 */
function buildCbtPaper(clearedStageIds: string[], pool: QuestionRow[], target = CBT_TARGET) {
  const scopeStageIds = clearedStageIds.filter((id) => pool.some((q) => q.source_stage_id === id))
  const byStage = new Map<string, QuestionRow[]>()
  for (const id of scopeStageIds) {
    byStage.set(
      id,
      shuffle(pool.filter((q) => q.source_stage_id === id)),
    )
  }

  const picked: QuestionRow[] = []
  let guard = 0
  while (picked.length < target && guard < 500) {
    guard += 1
    let added = false
    for (const id of scopeStageIds) {
      if (picked.length >= target) break
      const bucket = byStage.get(id)
      if (!bucket || bucket.length === 0) continue
      picked.push(bucket.shift()!)
      added = true
    }
    if (!added) break
  }

  return { questions: shuffle(picked), scopeStageIds }
}

function mapQuestions(rows: QuestionRow[]) {
  return rows.map((r) => ({
    id: r.id,
    prompt: r.prompt,
    choices: r.choices,
    correctIndex: r.correct_index,
    explanation: r.explanation,
    sourceStageId: r.source_stage_id,
  }))
}

async function handle(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  let body: { token?: string; action?: string; payload?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return json({ error: '不正なリクエストです' }, 400)
  }

  // 独自JWTはヘッダではなくボディで受け取る。カスタムヘッダを追加すると、
  // withSupabaseのゲートウェイがCORSプリフライトを自前処理していて
  // Access-Control-Allow-Headers に独自ヘッダ名を含めてくれないため
  // (auth-*-login と同じヘッダ構成に揃えることでプリフライトを素通りさせる)。
  const token = body.token
  if (!token) return json({ error: '認証が必要です' }, 401)

  const jwtSecret = Deno.env.get('APP_JWT_SECRET')
  if (!jwtSecret) return json({ error: 'サーバー設定エラー(APP_JWT_SECRET未設定)' }, 500)

  let studentId: string
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret))
    if (payload.role !== 'student' || typeof payload.sub !== 'string') {
      return json({ error: '実習生としての認証が必要です' }, 403)
    }
    studentId = payload.sub
  } catch {
    return json({ error: 'セッションが無効です。再ログインしてください' }, 401)
  }

  const action = body.action
  const p = body.payload ?? {}

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  async function getState() {
    const { data, error } = await admin.rpc('fn_get_student_state', { p_student_id: studentId })
    if (error) throw new Error(error.message)
    return data
  }

  try {
    switch (action) {
      case 'get_state':
        return json({ student: await getState() })

      case 'complete_beat': {
        const { error } = await admin.rpc('fn_complete_beat', {
          p_student_id: studentId,
          p_beat_id: p.beatId,
          p_unit_id: p.unitId,
          p_next_beat_index: p.nextBeatIndex,
          p_xp: p.xp ?? 0,
          p_clue_id: p.clueId ?? null,
          p_stage_id: p.stageId,
        })
        if (error) throw new Error(error.message)
        return json({ student: await getState() })
      }

      case 'complete_chapter': {
        const { error } = await admin.rpc('fn_complete_chapter', {
          p_student_id: studentId,
          p_chapter_id: p.chapterId,
          p_xp: p.xp ?? 0,
        })
        if (error) throw new Error(error.message)
        return json({ student: await getState() })
      }

      case 'complete_case': {
        const { error } = await admin.rpc('fn_complete_case', {
          p_student_id: studentId,
          p_stage_id: p.stageId,
        })
        if (error) throw new Error(error.message)
        return json({ student: await getState() })
      }

      case 'complete_procedure': {
        const { error } = await admin.rpc('fn_complete_procedure', {
          p_student_id: studentId,
          p_stage_id: p.stageId,
        })
        if (error) throw new Error(error.message)
        return json({ student: await getState() })
      }

      case 'set_unit_cursor': {
        const { error } = await admin.rpc('fn_set_unit_cursor', {
          p_student_id: studentId,
          p_unit_id: p.unitId,
          p_beat_index: p.beatIndex,
        })
        if (error) throw new Error(error.message)
        return json({ student: await getState() })
      }

      case 'start_cbt': {
        const { data: progressRow } = await admin
          .from('student_progress')
          .select('cbt_drawn_ids, cbt_retake_allowed')
          .eq('student_id', studentId)
          .maybeSingle()

        if (
          progressRow &&
          (progressRow.cbt_drawn_ids?.length ?? 0) > 0 &&
          !progressRow.cbt_retake_allowed
        ) {
          const { data: qs } = await admin
            .from('cbt_questions')
            .select('id, prompt, choices, correct_index, explanation, source_stage_id')
            .in('id', progressRow.cbt_drawn_ids)
          return json({ questions: mapQuestions(qs ?? []), student: await getState() })
        }

        const { data: clears } = await admin
          .from('student_stage_clears')
          .select('stage_id')
          .eq('student_id', studentId)
        const clearedStageIds = (clears ?? []).map((c: { stage_id: string }) => c.stage_id)

        const { data: pool } = await admin
          .from('cbt_questions')
          .select('id, prompt, choices, correct_index, explanation, source_stage_id')

        const { questions, scopeStageIds } = buildCbtPaper(clearedStageIds, pool ?? [])

        await admin
          .from('student_progress')
          .update({
            cbt_drawn_ids: questions.map((q) => q.id),
            cbt_scope_stage_ids: scopeStageIds,
            cbt_retake_allowed: false,
            updated_at: new Date().toISOString(),
          })
          .eq('student_id', studentId)

        return json({ questions: mapQuestions(questions), student: await getState() })
      }

      case 'submit_cbt': {
        const answers = (p.answers ?? {}) as Record<string, number>
        const { data: progressRow } = await admin
          .from('student_progress')
          .select('cbt_drawn_ids')
          .eq('student_id', studentId)
          .maybeSingle()
        const drawnIds: string[] = progressRow?.cbt_drawn_ids ?? []
        const { data: qs } = await admin
          .from('cbt_questions')
          .select('id, correct_index')
          .in('id', drawnIds)

        let score = 0
        for (const q of qs ?? []) {
          if (answers[q.id] === q.correct_index) score += 1
        }

        await admin
          .from('student_progress')
          .update({
            cbt_submitted: true,
            cbt_answers: answers,
            cbt_score: score,
            cbt_retake_allowed: false,
            updated_at: new Date().toISOString(),
          })
          .eq('student_id', studentId)

        return json({ score, student: await getState() })
      }

      case 'record_login_stamp': {
        const { data, error } = await admin.rpc('fn_record_login_stamp', {
          p_student_id: studentId,
        })
        if (error) throw new Error(error.message)
        return json({ stamp: data, student: await getState() })
      }

      case 'record_consent': {
        const { error } = await admin.rpc('fn_record_consent', {
          p_student_id: studentId,
          p_consent_version: p.consentVersion,
        })
        if (error) throw new Error(error.message)
        return json({ student: await getState() })
      }

      case 'get_active_cbt_questions': {
        const { data: progressRow } = await admin
          .from('student_progress')
          .select('cbt_drawn_ids')
          .eq('student_id', studentId)
          .maybeSingle()
        const drawnIds: string[] = progressRow?.cbt_drawn_ids ?? []
        if (drawnIds.length === 0) return json({ questions: [] })
        const { data: qs } = await admin
          .from('cbt_questions')
          .select('id, prompt, choices, correct_index, explanation, source_stage_id')
          .in('id', drawnIds)
        return json({ questions: mapQuestions(qs ?? []) })
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
