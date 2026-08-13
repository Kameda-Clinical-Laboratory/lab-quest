// シリーズふりかえりページ(旧: 手がかり図鑑)用のデータ整形ロジック(2026-08)。
// シリーズ(旧ステージ)ごとに「まとめ文」(スタッフが編集する)と「調査キーワード」を
// まとめ、学生が日々の実習記録を書くときの下敷きにできるようにする。
import type { Stage, Student } from '@/mocks/types'

export type SeriesKeyword = {
  id: string
  name: string
  summary: string
}

/** シリーズ選択画面(一覧)に出す最小限の情報 */
export type SeriesOverview = {
  stageId: string
  title: string
  required: boolean
  hasSummary: boolean
  keywordCount: number
}

/** そのシリーズに学生が何かしら手を付けているか(会話/講義/調査/解決/発展/チャプター/症例/手技のいずれか) */
function isStageTouched(stage: Stage, student: Student): boolean {
  const { progress } = student
  if (
    stage.units?.some((unit) => unit.beats.some((beat) => progress.clearedBeatIds.includes(beat.id)))
  ) {
    return true
  }
  if (stage.chapters.some((c) => progress.clearedChapterIds.includes(c.id))) return true
  if (progress.clearedCaseStageIds.includes(stage.id)) return true
  if (progress.clearedProcedureStageIds.includes(stage.id)) return true
  if ((stage.clues ?? []).some((c) => progress.ownedClueIds.includes(c.id))) return true
  return false
}

/** 振り返りページの一覧に出すシリーズ(=何か手を付けたシリーズだけ)を組み立てる */
export function buildSeriesOverviews(stages: Stage[], student: Student): SeriesOverview[] {
  const owned = new Set(student.progress.ownedClueIds)
  return stages
    .filter((stage) => isStageTouched(stage, student))
    .map((stage) => ({
      stageId: stage.id,
      title: stage.title,
      required: stage.required,
      hasSummary: Boolean(stage.reviewSummary?.trim()),
      keywordCount: (stage.clues ?? []).filter((c) => owned.has(c.id)).length,
    }))
}

/** 選択したシリーズで、学生が確認済みの調査キーワード(手がかり)一覧 */
export function getSeriesKeywords(stage: Stage, student: Student): SeriesKeyword[] {
  const owned = new Set(student.progress.ownedClueIds)
  return (stage.clues ?? [])
    .filter((c) => owned.has(c.id))
    .map((c) => ({ id: c.id, name: c.name, summary: c.summary }))
}
