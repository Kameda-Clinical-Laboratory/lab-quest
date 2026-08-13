import { useEffect } from 'react'
import { useAppState } from '@/context/AppState'
import { IconScroll } from '@/components/QuestIcons'
import { Badge } from '@/components/ui/badge'
import { writeCodexSeen } from '@/lib/playerHud'
import { buildSeriesReviews } from '@/lib/seriesReview'

export function Codex() {
  const { currentStudent, stages } = useAppState()
  const clueTotal = stages.reduce((n, s) => n + (s.clues?.length ?? 0), 0)
  const ownedCount = currentStudent?.progress.ownedClueIds.length ?? 0

  useEffect(() => {
    if (!currentStudent) return
    writeCodexSeen(currentStudent.id, ownedCount)
  }, [currentStudent, ownedCount])

  if (!currentStudent) return null

  const reviews = buildSeriesReviews(stages, currentStudent)

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
              各シリーズで学んだことと、調査で確認したキーワードをまとめました。実習記録を書くときの下書きにどうぞ。
            </p>
          </div>
          <div className="codex-count">
            <span className="status-chip-label">手がかり</span>
            <strong>
              {ownedCount} / {clueTotal || 0}
            </strong>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-lg border border-border/70 bg-card/40 px-4 py-6 text-sm text-muted-foreground">
          まだふりかえれるシリーズがありません。クエストを進めるとここに記録が増えます。
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <details key={r.stageId} className="review-card" open>
              <summary className="review-card-summary">
                <div className="review-card-summary-main">
                  <span className="font-display text-lg text-parchment">{r.title}</span>
                  <Badge variant={r.required ? 'quest' : 'outline'} className="text-xs">
                    {r.required ? '必須' : '任意'}
                  </Badge>
                  {r.cleared && (
                    <Badge variant="ok" className="text-xs">
                      クリア済
                    </Badge>
                  )}
                </div>
                {r.assignedDateLabels.length > 0 && (
                  <span className="review-card-dates">{r.assignedDateLabels.join('、')}</span>
                )}
              </summary>

              <div className="review-card-body">
                {r.points.length > 0 && (
                  <div className="review-section">
                    <h4 className="review-section-title">学んだこと</h4>
                    <ul className="review-point-list">
                      {r.points.map((p, i) => (
                        <li key={`${r.stageId}-point-${i}`}>
                          <strong>{p.label}</strong>
                          <p>{p.text}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {r.keywords.length > 0 && (
                  <div className="review-section">
                    <h4 className="review-section-title">調査キーワード</h4>
                    <div className="review-keyword-grid">
                      {r.keywords.map((k) => (
                        <div key={k.id} className="review-keyword-card">
                          <div className="review-keyword-name">{k.name}</div>
                          <div className="review-keyword-summary">{k.summary}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  )
}
