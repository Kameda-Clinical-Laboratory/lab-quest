import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '@/context/AppState'
import { IconScroll } from '@/components/QuestIcons'
import { Badge } from '@/components/ui/badge'
import { writeCodexSeen } from '@/lib/playerHud'
import { buildSeriesOverviews } from '@/lib/seriesReview'

export function Codex() {
  const { currentStudent, stages } = useAppState()
  const clueTotal = stages.reduce((n, s) => n + (s.clues?.length ?? 0), 0)
  const ownedCount = currentStudent?.progress.ownedClueIds.length ?? 0

  useEffect(() => {
    if (!currentStudent) return
    writeCodexSeen(currentStudent.id, ownedCount)
  }, [currentStudent, ownedCount])

  if (!currentStudent) return null

  const overviews = buildSeriesOverviews(stages, currentStudent)

  return (
    <div className="space-y-5">
      <div className="quest-frame px-5 py-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-200/80">
              <IconScroll className="h-4 w-4" />
              Series Review
            </div>
            <h2 className="font-display text-2xl text-parchment">シリーズふりかえり</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              シリーズを選ぶと、まとめ文と調査キーワードを見られます。実習記録を書くときの下書きにどうぞ。
            </p>
          </div>
          <div className="codex-count">
            <span className="status-chip-label">調査キーワード</span>
            <strong>
              {ownedCount} / {clueTotal || 0}
            </strong>
          </div>
        </div>
      </div>

      {overviews.length === 0 ? (
        <div className="rounded-lg border border-border/70 bg-card/40 px-4 py-6 text-sm text-muted-foreground">
          まだふりかえれるシリーズがありません。クエストを進めるとここに増えます。
        </div>
      ) : (
        <div className="review-picker-grid">
          {overviews.map((o) => (
            <Link key={o.stageId} to={`/app/codex/${o.stageId}`} className="review-picker-card">
              <div className="review-picker-card-top">
                <span className="font-display text-lg text-parchment">{o.title}</span>
                <Badge variant={o.required ? 'quest' : 'outline'} className="text-xs">
                  {o.required ? '必須' : '任意'}
                </Badge>
              </div>
              <div className="review-picker-card-meta">
                <span>調査キーワード {o.keywordCount}件</span>
                <span>{o.hasSummary ? 'まとめ文あり' : 'まとめ文はまだありません'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
