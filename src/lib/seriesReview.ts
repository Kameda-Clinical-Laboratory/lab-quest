// 図鑑(旧: 手がかり収集メタゲーム)を実習記録のふりかえり用ページへ作り替えるための
// データ整形ロジック(2026-08)。シリーズ(旧ステージ)ごとに「学んだこと」と
// 「調査で確認したキーワード(手がかり)」をまとめ、学生が日々の実習記録を
// 書くときの下敷きにできるようにする。
import type { Stage, Student } from '@/mocks/types'
import { formatDateJa } from '@/mocks/schedule'

export type SeriesReviewPoint = {
  /** 由来ラベル(幕タイトル・チャプター名など) */
  label: string
  text: string
}

export type SeriesKeyword = {
  id: string
  name: string
  summary: string
}

export type SeriesReview = {
  stageId: string
  title: string
  required: boolean
  /** シリーズ全体がクリア済みか(必須シリーズ進捗のカウント対象と同じ判定) */
  cleared: boolean
  /** このシリーズが計画された実習日(フォーマット済み、日付昇順) */
  assignedDateLabels: string[]
  points: SeriesReviewPoint[]
  keywords: SeriesKeyword[]
}

function truncate(text: string, max = 220): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max)}…`
}

/**
 * 学生の進捗から、シリーズごとの「学んだこと」ポイントと「調査キーワード」を組み立てる。
 * 何も手を付けていないシリーズは配列に含めない(振り返りページなので、着手済みだけを見せる)。
 */
export function buildSeriesReviews(stages: Stage[], student: Student): SeriesReview[] {
  const { progress } = student
  const clearedBeatIds = new Set(progress.clearedBeatIds)
  const clearedChapterIds = new Set(progress.clearedChapterIds)
  const clearedCaseStageIds = new Set(progress.clearedCaseStageIds)
  const clearedProcedureStageIds = new Set(progress.clearedProcedureStageIds)
  const clearedStageIds = new Set(progress.clearedStageIds)
  const ownedClueIds = new Set(progress.ownedClueIds)

  const assignedDatesByStage = new Map<string, string[]>()
  for (const plan of student.dayPlans) {
    for (const stageId of plan.seriesIds) {
      const list = assignedDatesByStage.get(stageId) ?? []
      list.push(plan.date)
      assignedDatesByStage.set(stageId, list)
    }
  }

  const reviews: SeriesReview[] = []

  for (const stage of stages) {
    const points: SeriesReviewPoint[] = []

    // 新方式(会話→調査→解決のユニット/幕モデル)
    for (const unit of stage.units ?? []) {
      for (const beat of unit.beats) {
        if (!clearedBeatIds.has(beat.id)) continue
        if (beat.type === 'lecture') {
          points.push({ label: unit.title, text: truncate(beat.body) })
        } else if (beat.type === 'resolve') {
          for (const step of beat.steps) {
            const correct = step.choices.find((c) => c.correct)
            if (correct) {
              points.push({ label: step.prompt, text: correct.feedback })
            }
          }
        } else if (beat.type === 'drill') {
          for (const q of beat.questions) {
            points.push({ label: q.prompt, text: q.explanation })
          }
        }
        // dialogue/investigate は雰囲気づくり・手がかり取得が主目的なので
        // 「学んだこと」には含めない(investigateはkeywordsへ)。
      }
    }

    // 旧方式(chapters/caseSteps/procedureSteps)
    for (const chapter of stage.chapters) {
      if (!clearedChapterIds.has(chapter.id)) continue
      points.push({ label: chapter.title, text: truncate(chapter.lecture) })
      points.push({ label: chapter.quiz.prompt, text: chapter.quiz.explanation })
    }

    if (clearedCaseStageIds.has(stage.id)) {
      for (const step of stage.caseSteps) {
        const correct = step.choices.find((c) => c.correct)
        if (correct) {
          points.push({ label: step.prompt, text: correct.feedback })
        }
      }
    }

    if (clearedProcedureStageIds.has(stage.id) && stage.procedureSteps?.length) {
      const order = [...stage.procedureSteps]
        .sort((a, b) => a.correctOrder - b.correctOrder)
        .map((s) => s.label)
        .join(' → ')
      points.push({ label: '実務前チェック(正しい手順)', text: order })
    }

    const keywords: SeriesKeyword[] = (stage.clues ?? [])
      .filter((c) => ownedClueIds.has(c.id))
      .map((c) => ({ id: c.id, name: c.name, summary: c.summary }))

    if (points.length === 0 && keywords.length === 0) continue

    const assignedDateLabels = [...(assignedDatesByStage.get(stage.id) ?? [])]
      .sort()
      .map((d) => formatDateJa(d))

    reviews.push({
      stageId: stage.id,
      title: stage.title,
      required: stage.required,
      cleared: clearedStageIds.has(stage.id),
      assignedDateLabels,
      points,
      keywords,
    })
  }

  return reviews
}
