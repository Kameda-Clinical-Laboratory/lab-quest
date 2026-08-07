import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppState } from '@/context/AppState'
import { IconScroll } from '@/components/QuestIcons'
import { Badge } from '@/components/ui/badge'
import { writeCodexSeen } from '@/lib/playerHud'
import type { ClueDef } from '@/mocks/learning'

type CodexEntry = ClueDef & { stageId: string; stageTitle: string }

export function Codex() {
  const { currentStudent, stages } = useAppState()
  const owned = new Set(currentStudent?.progress.ownedClueIds ?? [])
  const entries: CodexEntry[] = stages.flatMap((stage) =>
    (stage.clues ?? []).map((c) => ({
      ...c,
      stageId: stage.id,
      stageTitle: stage.title,
    })),
  )
  const ownedCount = entries.filter((e) => owned.has(e.id)).length

  useEffect(() => {
    if (!currentStudent) return
    writeCodexSeen(currentStudent.id, ownedCount)
  }, [currentStudent, ownedCount])

  if (!currentStudent) return null

  return (
    <div className="space-y-5">
      <div className="quest-frame px-5 py-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-200/80">
              <IconScroll className="h-4 w-4" />
              Field Codex
            </div>
            <h2 className="font-display text-2xl text-parchment">手がかり図鑑</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              調査で得た手がかりを集め、症例解決に使います。未入手はシルエット表示です。
            </p>
          </div>
          <div className="codex-count">
            <span className="status-chip-label">収集</span>
            <strong>
              {ownedCount} / {entries.length || 0}
            </strong>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-lg border border-border/70 bg-card/40 px-4 py-6 text-sm text-muted-foreground">
          まだ図鑑に登録できる手がかりがありません。シリーズを進めると増えます。
        </div>
      ) : (
        <div className="codex-grid">
          {entries.map((entry) => {
            const unlocked = owned.has(entry.id)
            return (
              <article
                key={entry.id}
                className={`codex-card ${unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="codex-card-top">
                  <span className="codex-seal" aria-hidden>
                    {unlocked ? <IconScroll className="h-6 w-6" /> : '?'}
                  </span>
                  <Badge variant={unlocked ? 'ok' : 'outline'} className="text-xs">
                    {unlocked ? '入手済' : '未入手'}
                  </Badge>
                </div>
                <h3 className="font-display text-lg text-parchment">
                  {unlocked ? entry.name : '？？？'}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {unlocked ? entry.summary : '調査クエストを進めると内容が判明します。'}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-amber-100/70">
                  <span>{entry.stageTitle}</span>
                  {unlocked ? (
                    <Link
                      className="underline-offset-2 hover:underline"
                      to={`/app/stage/${entry.stageId}`}
                    >
                      シリーズへ
                    </Link>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
