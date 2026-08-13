import { Link, useParams } from 'react-router-dom'
import { useAppState } from '@/context/AppState'
import { IconScroll } from '@/components/QuestIcons'
import { Badge } from '@/components/ui/badge'
import { getSeriesKeywords } from '@/lib/seriesReview'

export function CodexDetail() {
  const { stageId = '' } = useParams()
  const { currentStudent, stages } = useAppState()
  if (!currentStudent) return null

  const stage = stages.find((s) => s.id === stageId)
  if (!stage) {
    return (
      <div className="space-y-4">
        <Link className="text-sm text-amber-200/90 hover:underline" to="/app/codex">
          {'← シリーズふりかえりへ戻る'}
        </Link>
        <p className="text-sm text-muted-foreground">シリーズが見つかりませんでした。</p>
      </div>
    )
  }

  const keywords = getSeriesKeywords(stage, currentStudent)

  return (
    <div className="space-y-5">
      <Link className="text-sm text-amber-200/90 hover:underline" to="/app/codex">
        {'← シリーズふりかえりへ戻る'}
      </Link>

      <div className="quest-frame px-5 py-4">
        <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-200/80">
          <IconScroll className="h-4 w-4" />
          Series Review
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-2xl text-parchment">{stage.title}</h2>
          <Badge variant={stage.required ? 'quest' : 'outline'} className="text-xs">
            {stage.required ? '必須' : '任意'}
          </Badge>
        </div>
      </div>

      <div className="review-section">
        <h4 className="review-section-title">まとめ文</h4>
        {stage.reviewSummary?.trim() ? (
          <p className="review-summary-text">{stage.reviewSummary}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            まだこのシリーズのまとめ文が登録されていません。スタッフに相談してみましょう。
          </p>
        )}
      </div>

      {keywords.length > 0 && (
        <div className="review-section">
          <h4 className="review-section-title">調査キーワード</h4>
          <div className="review-keyword-grid">
            {keywords.map((k) => (
              <div key={k.id} className="review-keyword-card">
                <div className="review-keyword-name">{k.name}</div>
                <div className="review-keyword-summary">{k.summary}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
