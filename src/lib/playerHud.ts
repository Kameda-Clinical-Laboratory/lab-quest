/** Soft level curve for the student HUD (mock, no server). */
const XP_PER_LEVEL = 100

export function xpProgress(xp: number) {
  const safe = Math.max(0, xp)
  const level = Math.floor(safe / XP_PER_LEVEL) + 1
  const intoLevel = safe % XP_PER_LEVEL
  const pct = Math.round((intoLevel / XP_PER_LEVEL) * 100)
  return {
    level,
    xp: safe,
    intoLevel,
    perLevel: XP_PER_LEVEL,
    toNext: XP_PER_LEVEL - intoLevel,
    pct,
  }
}

export function stampProgress(stamps: number, visitDays: number) {
  const goal = Math.max(visitDays, 1)
  const safe = Math.max(0, stamps)
  const pct = Math.min(100, Math.round((safe / goal) * 100))
  return { stamps: safe, goal, pct, filled: Math.min(safe, goal) }
}

export function codexSeenKey(studentId: string) {
  return `labquest:codex-seen:${studentId}`
}

export function readCodexSeen(studentId: string): number {
  try {
    return Number(sessionStorage.getItem(codexSeenKey(studentId)) || 0)
  } catch {
    return 0
  }
}

export function writeCodexSeen(studentId: string, ownedCount: number) {
  try {
    sessionStorage.setItem(codexSeenKey(studentId), String(ownedCount))
  } catch {
    /* ignore */
  }
}
