/**
 * Phase 2で導入した独自セッション(JWT)の保存/読み出し。
 * Supabase Authは使わないため、supabase-jsの組み込みセッション管理ではなく
 * ここで手動管理する。トークンは sessionStorage に保存する
 * (共有PCでの利用を想定し、タブを閉じれば消える localStorage より安全な方を選択)。
 */

export interface StudentSession {
  token: string
  student: { id: string; code: string; name: string }
}

export interface StaffSession {
  token: string
  staff: { id: string; name: string; role: 'full' | 'ops' }
}

const STUDENT_KEY = 'labquest:session:student'
const STAFF_KEY = 'labquest:session:staff'

function decodeJwtExpMs(token: string): number | null {
  try {
    const payloadB64 = token.split('.')[1]
    const json = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))
    return typeof json.exp === 'number' ? json.exp * 1000 : null
  } catch {
    return null
  }
}

function isTokenValid(token: string): boolean {
  const expMs = decodeJwtExpMs(token)
  return expMs != null && expMs > Date.now()
}

export function saveStudentSession(session: StudentSession) {
  try {
    sessionStorage.setItem(STUDENT_KEY, JSON.stringify(session))
  } catch {
    /* ignore (プライベートブラウジング等でsessionStorageが使えない場合) */
  }
}

export function loadStudentSession(): StudentSession | null {
  try {
    const raw = sessionStorage.getItem(STUDENT_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as StudentSession
    if (!isTokenValid(session.token)) {
      sessionStorage.removeItem(STUDENT_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

export function clearStudentSession() {
  try {
    sessionStorage.removeItem(STUDENT_KEY)
  } catch {
    /* ignore */
  }
}

export function saveStaffSession(session: StaffSession) {
  try {
    sessionStorage.setItem(STAFF_KEY, JSON.stringify(session))
  } catch {
    /* ignore */
  }
}

export function loadStaffSession(): StaffSession | null {
  try {
    const raw = sessionStorage.getItem(STAFF_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as StaffSession
    if (!isTokenValid(session.token)) {
      sessionStorage.removeItem(STAFF_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

export function clearStaffSession() {
  try {
    sessionStorage.removeItem(STAFF_KEY)
  } catch {
    /* ignore */
  }
}
