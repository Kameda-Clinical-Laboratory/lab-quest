import { supabase } from './supabaseClient'
import type { Beat, ClueDef, LearningUnit } from '../mocks/learning'
import type { DayPlan } from '../mocks/types'

/**
 * Edge Functionのエラーレスポンス({ error: string, validationErrors?: string[] } のJSON)
 * からメッセージを取り出す。studentProgressApi.ts/authApi.ts と同じ抽出パターン。
 */
async function extractErrorBody(
  error: unknown,
): Promise<{ error?: string; validationErrors?: string[] }> {
  const context = (error as { context?: Response } | null)?.context
  if (context && typeof context.json === 'function') {
    try {
      return (await context.json()) as { error?: string; validationErrors?: string[] }
    } catch {
      /* ignore parse failure */
    }
  }
  return {}
}

/** fn_publish_unit がバリデーション不合格(HTTP 422)を返したときにthrowされる。 */
export class PublishValidationError extends Error {
  errors: string[]
  constructor(errors: string[]) {
    super('公開条件を満たしていません')
    this.errors = errors
  }
}

async function callAdminContent<T>(
  token: string,
  action: string,
  payload?: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke('admin-content', {
    body: { token, action, payload },
  })
  if (error) {
    const body = await extractErrorBody(error)
    if (body.validationErrors) throw new PublishValidationError(body.validationErrors)
    throw new Error(body.error ?? '通信エラーが発生しました')
  }
  return data as T
}

export function createUnitApi(
  token: string,
  opts: { stageId: string; title: string; requestLine: string },
) {
  return callAdminContent<{ unit: LearningUnit }>(token, 'create_unit', opts)
}

export function saveUnitDraftApi(
  token: string,
  opts: { unitId: string; title: string; requestLine: string; beats: Beat[] },
) {
  return callAdminContent<{ unit: LearningUnit }>(token, 'save_unit_draft', opts)
}

export function reorderUnitsApi(token: string, opts: { stageId: string; orderedIds: string[] }) {
  return callAdminContent<{ ok: true }>(token, 'reorder_units', opts)
}

/** 成功時は公開済みunitを返す。バリデーション不合格時は PublishValidationError をthrowする。 */
export function publishUnitApi(token: string, opts: { unitId: string }) {
  return callAdminContent<{ unit: LearningUnit }>(token, 'publish_unit', opts)
}

export function createClueApi(
  token: string,
  opts: { stageId: string; name: string; summary: string },
) {
  return callAdminContent<{ clue: ClueDef }>(token, 'create_clue', opts)
}

export function upsertStudentApi(
  token: string,
  opts: {
    id?: string
    name: string
    /** 新規登録は必須。編集保存では通常省略する(送ると実パスワードを
     * 上書きしてしまうため — パスワード変更は resetStudentPasswordApi を使う)。 */
    password?: string
    visitDates: string[]
    dayPlans: DayPlan[]
    schoolName?: string | null
  },
) {
  return callAdminContent<{ studentId: string; code?: string }>(token, 'upsert_student', opts)
}

export function resetStudentPasswordApi(
  token: string,
  opts: { studentId: string; password: string },
) {
  return callAdminContent<{ ok: true }>(token, 'reset_student_password', opts)
}

export function getSettingsApi(token: string) {
  return callAdminContent<{ retentionDays: number }>(token, 'get_settings')
}

export function setRetentionDaysApi(token: string, days: number) {
  return callAdminContent<{ ok: true }>(token, 'set_retention_days', { days })
}

export type StudentConsent = { studentId: string; code: string; consentAt: string | null }

export function listStudentConsentApi(token: string) {
  return callAdminContent<{ students: StudentConsent[] }>(token, 'list_student_consent')
}

export function resetConsentApi(token: string, studentId: string) {
  return callAdminContent<{ ok: true }>(token, 'reset_consent', { studentId })
}
