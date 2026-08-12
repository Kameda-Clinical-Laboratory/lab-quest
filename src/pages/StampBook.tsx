import { useAppState } from '@/context/AppState'
import { IconStamp } from '@/components/QuestIcons'
import { stampImageForDay } from '@/lib/stampArt'

function formatStampDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const week = ['日', '月', '火', '水', '木', '金', '土'][dt.getDay()]
  return `${m}/${d}（${week}）`
}

export function StampBook() {
  const { currentStudent } = useAppState()
  if (!currentStudent) return null

  const stampDates = [...currentStudent.stampDates].sort()

  return (
    <div className="space-y-5">
      <div className="quest-frame px-5 py-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-200/80">
              <IconStamp className="h-4 w-4" />
              Stamp Log
            </div>
            <h2 className="font-display text-2xl text-parchment">スタンプ手帳</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ログインした日に1つずつスタンプが増えていきます。
            </p>
          </div>
          <div className="codex-count">
            <span className="status-chip-label">スタンプ</span>
            <strong>{stampDates.length}</strong>
          </div>
        </div>
      </div>

      {stampDates.length === 0 ? (
        <div className="rounded-lg border border-border/70 bg-card/40 px-4 py-6 text-sm text-muted-foreground">
          まだスタンプがありません。ログインすると1つ目のスタンプが押されます。
        </div>
      ) : (
        <div className="stamp-grid">
          {stampDates.map((date, i) => (
            <article key={date} className="stamp-card">
              <img className="stamp-card-image" src={stampImageForDay(i + 1)} alt="" />
              <div className="stamp-card-body">
                <div className="stamp-card-day">{i + 1}日目</div>
                <div className="stamp-card-date">{formatStampDate(date)}</div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
