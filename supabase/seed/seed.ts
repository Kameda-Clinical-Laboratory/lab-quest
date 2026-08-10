// Phase 0 シードスクリプト。
// 既存モック(src/mocks/data.ts, src/mocks/bioBasicsUnits.ts)の内容を
// service_role キーで直接Supabaseの各テーブルへ投入する。
//
// 使い方:
//   1. .env.local.example を .env.local にコピーし、
//      VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を設定
//   2. supabase/migrations 配下のマイグレーションを Supabase に適用済みであること
//   3. npm run db:seed
//
// 冪等性: 全テーブルを truncate してから入れ直す(開発・検証用途のため)。
// 本番の実運用データが入った後にこのスクリプトを再実行してはいけない。

import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

// このファイルは supabase/seed/ 配下にあるため、リポジトリ直下の .env.local を明示的に指定する
// (dotenv/config のデフォルトは cwd の .env のみを見るため、.env.local は拾ってくれない)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(__dirname, '../../.env.local') })
import bcrypt from 'bcryptjs'
import {
  CBT_QUESTIONS,
  INITIAL_STUDENTS,
  STAFF_USERS,
  STAGES,
} from '../../src/mocks/data'
import { BIO_BASICS_CLUES, BIO_BASICS_UNITS } from '../../src/mocks/bioBasicsUnits'
import type { Beat } from '../../src/mocks/learning'

const url = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error(
    '[seed] VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定です。.env.local を確認してください。',
  )
  process.exit(1)
}

const db = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const BCRYPT_ROUNDS = 10

/** Beatのpayload用に discriminant フィールド以外を抜き出す */
function beatPayload(beat: Beat): Record<string, unknown> {
  const { type: _type, id: _id, xp: _xp, ...rest } = beat as Beat & Record<string, unknown>
  if (beat.type === 'investigate') {
    const { clueId: _clueId, ...payload } = rest as typeof rest & { clueId: string }
    return payload
  }
  if (beat.type === 'resolve') {
    const { requiredClueIds: _req, ...payload } = rest as typeof rest & {
      requiredClueIds: string[]
    }
    return payload
  }
  return rest
}

async function truncateAll() {
  const tables = [
    'admin_audit_log',
    'consent_records',
    'student_stage_clears',
    'student_progress',
    'day_plans',
    'cbt_questions',
    'beats',
    'clues',
    'units',
    'procedure_steps',
    'stages',
    'students',
    'staff',
  ]
  for (const table of tables) {
    const { error } = await db.from(table).delete().not('id', 'is', null)
    // day_plans / student_progress / student_stage_clears は id 列がないので別条件で消す
    if (error && !['day_plans', 'student_progress', 'student_stage_clears'].includes(table)) {
      console.warn(`[seed] truncate ${table} 失敗(存在しない場合は無視): ${error.message}`)
    }
  }
  await db.from('day_plans').delete().not('student_id', 'is', null)
  await db.from('student_progress').delete().not('student_id', 'is', null)
  await db.from('student_stage_clears').delete().not('student_id', 'is', null)
}

async function seedStaff() {
  const rows = await Promise.all(
    STAFF_USERS.map(async (s) => ({
      name: s.name,
      role: s.role,
      password_hash: await bcrypt.hash(s.password, BCRYPT_ROUNDS),
    })),
  )
  const { error } = await db.from('staff').insert(rows)
  if (error) throw new Error(`staff seed failed: ${error.message}`)
  console.log(`[seed] staff: ${rows.length}件`)
}

async function seedStagesAndRelated() {
  const stageRows = STAGES.map((s, i) => ({
    id: s.id,
    area_id: s.areaId,
    title: s.title,
    required: s.required,
    has_procedure: s.hasProcedure,
    procedure_image_note: s.procedureImageNote ?? null,
    published: true,
    position: i,
    // 移行期間限定: units未着手の8シリーズは chapters/case_steps に退避
    chapters: s.units && s.units.length > 0 ? null : s.chapters,
    case_steps: s.units && s.units.length > 0 ? null : s.caseSteps,
  }))
  const { error: stageErr } = await db.from('stages').insert(stageRows)
  if (stageErr) throw new Error(`stages seed failed: ${stageErr.message}`)
  console.log(`[seed] stages: ${stageRows.length}件`)

  const procedureRows = STAGES.flatMap((s) =>
    (s.procedureSteps ?? []).map((p) => ({
      id: p.id,
      stage_id: s.id,
      label: p.label,
      correct_order: p.correctOrder,
    })),
  )
  if (procedureRows.length) {
    const { error } = await db.from('procedure_steps').insert(procedureRows)
    if (error) throw new Error(`procedure_steps seed failed: ${error.message}`)
    console.log(`[seed] procedure_steps: ${procedureRows.length}件`)
  }

  const cbtRows = CBT_QUESTIONS.map((q) => ({
    id: q.id,
    source_stage_id: q.sourceStageId,
    prompt: q.prompt,
    choices: q.choices,
    correct_index: q.correctIndex,
    explanation: q.explanation,
  }))
  const { error: cbtErr } = await db.from('cbt_questions').insert(cbtRows)
  if (cbtErr) throw new Error(`cbt_questions seed failed: ${cbtErr.message}`)
  console.log(`[seed] cbt_questions: ${cbtRows.length}件`)
}

/** 現状 bio-basics のみ units/clues/beats を持つ */
async function seedUnitsCluesBeats() {
  const clueRows = BIO_BASICS_CLUES.map((c) => ({
    id: c.id,
    stage_id: 'bio-basics',
    name: c.name,
    summary: c.summary,
  }))
  const { error: clueErr } = await db.from('clues').insert(clueRows)
  if (clueErr) throw new Error(`clues seed failed: ${clueErr.message}`)
  console.log(`[seed] clues: ${clueRows.length}件`)

  const unitRows = BIO_BASICS_UNITS.map((u, i) => ({
    id: u.id,
    stage_id: 'bio-basics',
    title: u.title,
    request_line: u.requestLine,
    published: true, // 既存の移行済みコンテンツなので公開状態で投入
    position: i,
  }))
  const { error: unitErr } = await db.from('units').insert(unitRows)
  if (unitErr) throw new Error(`units seed failed: ${unitErr.message}`)
  console.log(`[seed] units: ${unitRows.length}件`)

  const beatRows = BIO_BASICS_UNITS.flatMap((u) =>
    u.beats.map((b, i) => ({
      id: b.id,
      unit_id: u.id,
      type: b.type,
      position: i,
      xp: b.xp ?? null,
      clue_id: b.type === 'investigate' ? b.clueId : null,
      required_clue_ids: b.type === 'resolve' ? b.requiredClueIds : null,
      payload: beatPayload(b),
    })),
  )
  const { error: beatErr } = await db.from('beats').insert(beatRows)
  if (beatErr) throw new Error(`beats seed failed: ${beatErr.message}`)
  console.log(`[seed] beats: ${beatRows.length}件`)
}

async function seedStudents() {
  for (const s of INITIAL_STUDENTS) {
    const { data: inserted, error: studentErr } = await db
      .from('students')
      .insert({
        code: s.code,
        name: s.name,
        password_hash: await bcrypt.hash(s.password, BCRYPT_ROUNDS),
      })
      .select('id')
      .single()
    if (studentErr || !inserted) {
      throw new Error(`student ${s.code} seed failed: ${studentErr?.message}`)
    }
    const studentId = inserted.id as string

    const dayPlanRows = s.dayPlans.map((p) => ({
      student_id: studentId,
      date: p.date,
      series_ids: p.seriesIds,
      note: p.note ?? null,
    }))
    if (dayPlanRows.length) {
      const { error } = await db.from('day_plans').insert(dayPlanRows)
      if (error) throw new Error(`day_plans for ${s.code} failed: ${error.message}`)
    }

    const { error: progressErr } = await db.from('student_progress').insert({
      student_id: studentId,
      cleared_beat_ids: s.progress.clearedBeatIds,
      owned_clue_ids: s.progress.ownedClueIds,
      unit_cursors: s.progress.unitCursors,
      xp: s.progress.xp,
      stamps: s.progress.stamps,
      cbt_submitted: s.progress.cbtSubmitted,
      cbt_answers: s.progress.cbtAnswers,
      cbt_score: s.progress.cbtScore,
      cbt_retake_allowed: s.progress.cbtRetakeAllowed,
      cbt_drawn_ids: s.progress.cbtDrawnIds,
      cbt_scope_stage_ids: s.progress.cbtScopeStageIds,
      cleared_procedure_stage_ids: s.progress.clearedProcedureStageIds,
      cleared_chapter_ids: s.progress.clearedChapterIds,
      cleared_case_stage_ids: s.progress.clearedCaseStageIds,
    })
    if (progressErr) throw new Error(`student_progress for ${s.code} failed: ${progressErr.message}`)

    if (s.progress.clearedStageIds.length) {
      const { error } = await db.from('student_stage_clears').insert(
        s.progress.clearedStageIds.map((stageId) => ({ student_id: studentId, stage_id: stageId })),
      )
      if (error) throw new Error(`student_stage_clears for ${s.code} failed: ${error.message}`)
    }

    console.log(`[seed] student ${s.code} (${s.name}) → id=${studentId}`)
  }
}

async function main() {
  console.log('[seed] 既存データをtruncateします…')
  await truncateAll()
  await seedStaff()
  await seedStagesAndRelated()
  await seedUnitsCluesBeats()
  await seedStudents()
  console.log('[seed] 完了')
}

main().catch((err) => {
  console.error('[seed] 失敗:', err)
  process.exit(1)
})
