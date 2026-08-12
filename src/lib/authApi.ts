import { supabase } from './supabaseClient'
import type { StaffSession, StudentSession } from './session'

/**
 * Edge Functionのエラーレスポンス({ error: string } のJSON)からメッセージを取り出す。
 * supabase-jsの functions.invoke は非2xxのとき data:null, error:FunctionsHttpError を返し、
 * 実際のレスポンスボディは error.context (Response) 側にある。
 */
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

export async function loginStudentApi(code: string, password: string): Promise<StudentSession> {
  const { data, error } = await supabase.functions.invoke('auth-student-login', {
    body: { code, password },
  })
  if (error) {
    throw new Error(await extractErrorMessage(error, '受講者コードまたはパスワードが違います'))
  }
  return data as StudentSession
}

export async function loginStaffApi(password: string): Promise<StaffSession> {
  const { data, error } = await supabase.functions.invoke('auth-staff-login', {
    body: { password },
  })
  if (error) {
    throw new Error(await extractErrorMessage(error, 'パスワードが違います'))
  }
  return data as StaffSession
}
