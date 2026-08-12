import { getStage, isStageCleared } from './data'
import { isUnitCleared } from './learning'
import type { CbtQuestion, DayPlan, Stage, Student } from './types'

export const CBT_TARGET = 30

export function sortDates(dates: string[]) {
  return [...dates].sort()
}

export function formatDateJa(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const week = ['日', '月', '火', '水', '木', '金', '土'][dt.getDay()]
  return `${m}/${d}（${week}）`
}

export function getDayPlan(student: Student, date: string): DayPlan {
  return (
    student.dayPlans.find((p) => p.date === date) ?? {
      date,
      seriesIds: [],
      note: undefined,
    }
  )
}

/** 指定日より前の実習日で未クリアの計画シリーズ（繰り越し） */
export function getCarryoverSeriesIds(student: Student, today: string): string[] {
  const prior = sortDates(student.visitDates).filter((d) => d < today)
  const carry: string[] = []
  for (const date of prior) {
    const plan = getDayPlan(student, date)
    for (const id of plan.seriesIds) {
      if (student.progress.clearedStageIds.includes(id)) continue
      if (!carry.includes(id)) carry.push(id)
    }
  }
  return carry
}

/** 今日やるキュー: 繰り越し → 本日計画（重複除去）。クリア済みは除外 */
export function getTodayQueue(student: Student, today: string) {
  const plan = getDayPlan(student, today)
  const carry = getCarryoverSeriesIds(student, today)
  const planned = plan.seriesIds.filter((id) => !carry.includes(id))
  const queue = [...carry, ...planned].filter((id) => !student.progress.clearedStageIds.includes(id))
  return {
    date: today,
    plan,
    carryIds: carry.filter((id) => !student.progress.clearedStageIds.includes(id)),
    plannedIds: planned.filter((id) => !student.progress.clearedStageIds.includes(id)),
    queueIds: queue,
    isVisitDay: student.visitDates.includes(today),
    isAppOffDay: student.visitDates.includes(today) && plan.seriesIds.length === 0 && carry.length === 0,
    isFinalVisit: sortDates(student.visitDates).at(-1) === today,
  }
}

export function ensureDayPlans(visitDates: string[], existing: DayPlan[]): DayPlan[] {
  const set = new Set(visitDates)
  const kept = existing.filter((p) => set.has(p.date))
  const next = [...kept]
  for (const date of sortDates(visitDates)) {
    if (!next.some((p) => p.date === date)) {
      next.push({ date, seriesIds: [], note: '' })
    }
  }
  return next.sort((a, b) => a.date.localeCompare(b.date))
}

/** クリア済みシリーズのプールから、できるだけ均等にランダム抽出 */
export function buildCbtPaper(
  clearedStageIds: string[],
  pool: CbtQuestion[],
  target = CBT_TARGET,
): { questions: CbtQuestion[]; scopeStageIds: string[] } {
  const scopeStageIds = clearedStageIds.filter((id) => pool.some((q) => q.sourceStageId === id))
  const byStage = new Map<string, CbtQuestion[]>()
  for (const id of scopeStageIds) {
    const qs = pool.filter((q) => q.sourceStageId === id)
    byStage.set(id, shuffle([...qs]))
  }

  const picked: CbtQuestion[] = []
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function requiredUnassignedWarning(dayPlans: { seriesIds: string[] }[], allRequiredIds: string[]) {
  const assigned = new Set(dayPlans.flatMap((p) => p.seriesIds))
  return allRequiredIds.filter((id) => !assigned.has(id))
}

export function seriesProgressLabel(student: Student, seriesId: string, stages: Stage[]) {
  const stage = getStage(stages, seriesId)
  if (!stage) return '不明'
  if (student.progress.clearedStageIds.includes(seriesId) || isStageCleared(stage, student.progress)) {
    return 'クリア'
  }
  if (stage.units && stage.units.length > 0) {
    const done = stage.units.filter((u) => isUnitCleared(u, student.progress)).length
    if (done > 0) return '途中'
    if (student.progress.clearedBeatIds.some((id) => stage.units!.some((u) => u.beats.some((b) => b.id === id)))) {
      return '途中'
    }
    return '未着手'
  }
  const ch = stage.chapters.filter((c) => student.progress.clearedChapterIds.includes(c.id)).length
  if (ch > 0 || student.progress.clearedCaseStageIds.includes(seriesId)) return '途中'
  return '未着手'
}
