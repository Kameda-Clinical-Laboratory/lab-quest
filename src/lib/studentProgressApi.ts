import { supabase } from './supabaseClient'
import type { DayPlan, StudentProgress } from '../mocks/types'

/** student-progress Edge Functionが返す Student 形状(passwordを除く)。 */
export interface ServerStudentState {
  id: string
  name: string
  code: string
  schoolName: string | null
  consentAt: string | null
  visitDates: string[]
  dayPlans: DayPlan[]
  /** ログインスタンプを押した日(ISO date)の一覧。スタンプ手帳の表示に使う。 */
  stampDates: string[]
  progress: StudentProgress
}

export interface LoginStampResult {
  isNew: boolean
  dayNumber: number
  totalStamps: number
}

interface ServerQuestion {
  id: string
  prompt: string
  choices: string[]
  correctIndex: number
  explanation: string
  sourceStageId: string
}

async function extractErrorMessage(error: unknown, fallback: string): Promise<string> {
  const context = (error as { context?: Response } | null)?.context
  if (context && typeof context.json === 'function') {
    try {
      const body = (await context.json()) as { error?: string }
      if (body?.error) return body.error
    } catch {
      /* ignore parse failure, fall through to fallback */
    }
  }
  return fallback
}

async function callStudentProgress<T>(
  token: string,
  action: string,
  payload?: Record<string, unknown>,
): Promise<T> {
  // 独自JWTはヘッダではなくボディに含める。カスタムヘッダを追加すると
  // withSupabaseのゲートウェイのCORSプリフライトに弾かれるため
  // (supabase/functions/student-progress/index.ts のコメント参照)。
  const { data, error } = await supabase.functions.invoke('student-progress', {
    body: { token, action, payload },
  })
  if (error) {
    throw new Error(await extractErrorMessage(error, '通信エラーが発生しました'))
  }
  return data as T
}

export function getStudentState(token: string) {
  return callStudentProgress<{ student: ServerStudentState }>(token, 'get_state')
}

export function completeBeatApi(
  token: string,
  opts: {
    beatId: string
    unitId: string
    nextBeatIndex: number
    xp?: number
    clueId?: string
    stageId: string
  },
) {
  return callStudentProgress<{ student: ServerStudentState }>(token, 'complete_beat', opts)
}

export function completeChapterApi(token: string, chapterId: string, xp: number) {
  return callStudentProgress<{ student: ServerStudentState }>(token, 'complete_chapter', {
    chapterId,
    xp,
  })
}

export function completeCaseApi(token: string, stageId: string) {
  return callStudentProgress<{ student: ServerStudentState }>(token, 'complete_case', { stageId })
}

export function completeProcedureApi(token: string, stageId: string) {
  return callStudentProgress<{ student: ServerStudentState }>(token, 'complete_procedure', {
    stageId,
  })
}

export function setUnitCursorApi(token: string, unitId: string, beatIndex: number) {
  return callStudentProgress<{ student: ServerStudentState }>(token, 'set_unit_cursor', {
    unitId,
    beatIndex,
  })
}

export function startCbtApi(token: string) {
  return callStudentProgress<{ questions: ServerQuestion[]; student: ServerStudentState }>(
    token,
    'start_cbt',
  )
}

export function submitCbtApi(token: string, answers: Record<string, number>) {
  return callStudentProgress<{ score: number; student: ServerStudentState }>(
    token,
    'submit_cbt',
    { answers },
  )
}

export function getActiveCbtQuestionsApi(token: string) {
  return callStudentProgress<{ questions: ServerQuestion[] }>(token, 'get_active_cbt_questions')
}

export function recordConsentApi(token: string, consentVersion: string) {
  return callStudentProgress<{ student: ServerStudentState }>(token, 'record_consent', {
    consentVersion,
  })
}

export function recordLoginStampApi(token: string) {
  return callStudentProgress<{ stamp: LoginStampResult; student: ServerStudentState }>(
    token,
    'record_login_stamp',
  )
}
