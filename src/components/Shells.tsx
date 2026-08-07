import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAppState } from '@/context/AppState'
import { IconScroll, IconStamp, IconXpOrb } from '@/components/QuestIcons'
import { Button } from '@/components/ui/button'
import { readCodexSeen, stampProgress, xpProgress } from '@/lib/playerHud'

export function StudentShell() {
  const { currentStudent, logoutStudent, todayQueue, stages } = useAppState()
  const navigate = useNavigate()
  const location = useLocation()
  if (!currentStudent) return <Navigate to="/" replace />

  const clueTotal = stages.reduce((n, s) => n + (s.clues?.length ?? 0), 0)
  const clueOwned = currentStudent.progress.ownedClueIds.length
  const onCodex = location.pathname.startsWith('/app/codex')
  const initial = currentStudent.name.trim().slice(0, 1)
  const xp = xpProgress(currentStudent.progress.xp)
  const stamps = stampProgress(
    currentStudent.progress.stamps,
    currentStudent.visitDates.length,
  )
  const codexPct = clueTotal ? Math.round((clueOwned / clueTotal) * 100) : 0
  const codexNew = clueOwned > readCodexSeen(currentStudent.id)
  const carry = todayQueue?.carryIds.length ?? 0

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-5">
      <header className="status-bar mb-6">
        <div className="status-bar-left">
          <Link to="/app" className="status-bar-brand" title="ホームへ">
            <img
              className="brand-logo brand-logo-header"
              src="/art/quest-brand-title.png"
              alt="LAB QUEST"
            />
          </Link>
          <div className="status-player" title={`${currentStudent.name} / Lv.${xp.level}`}>
            <span className="status-avatar" aria-hidden>
              {initial}
              <span className="status-level-badge">Lv{xp.level}</span>
            </span>
            <div className="status-player-meta">
              <span className="status-player-name">{currentStudent.name}</span>
              <span className="status-player-sub">冒険者</span>
            </div>
          </div>
        </div>

        <div className="status-bar-right">
          <div className="status-tray" role="group" aria-label="ステータス">
            <div
              className="status-meter"
              title={`経験値 ${xp.xp}（次のレベルまで ${xp.toNext}）`}
            >
              <div className="status-meter-head">
                <IconXpOrb className="h-4 w-4" />
                <span className="status-chip-label">XP</span>
                <strong>{xp.xp}</strong>
              </div>
              <div className="status-meter-track" aria-hidden>
                <div className="status-meter-fill xp" style={{ width: `${xp.pct}%` }} />
              </div>
            </div>

            <div
              className="status-meter"
              title={`スタンプ ${stamps.stamps} / 目標 ${stamps.goal}`}
            >
              <div className="status-meter-head">
                <IconStamp className="h-4 w-4" />
                <span className="status-chip-label">Stamp</span>
                <strong>
                  {stamps.stamps}/{stamps.goal}
                </strong>
              </div>
              <div className="status-meter-track" aria-hidden>
                <div className="status-meter-fill stamp" style={{ width: `${stamps.pct}%` }} />
              </div>
            </div>

            <Link
              to="/app/codex"
              className={`status-meter status-meter-link ${onCodex ? 'active' : ''}`}
              title="手がかり図鑑"
            >
              <div className="status-meter-head">
                <span className="status-icon-wrap">
                  <IconScroll className="h-4 w-4" />
                  {codexNew ? <span className="status-new-dot" aria-label="新規あり" /> : null}
                </span>
                <span className="status-chip-label">図鑑</span>
                <strong>
                  {clueOwned}/{clueTotal || 0}
                </strong>
              </div>
              <div className="status-meter-track" aria-hidden>
                <div className="status-meter-fill codex" style={{ width: `${codexPct}%` }} />
              </div>
            </Link>

            {carry > 0 ? (
              <div className="status-meter status-meter-warn" title="繰り越しクエスト">
                <div className="status-meter-head">
                  <span className="status-chip-label">繰越</span>
                  <strong>{carry}</strong>
                </div>
                <div className="status-meter-track" aria-hidden>
                  <div className="status-meter-fill warn" style={{ width: '100%' }} />
                </div>
              </div>
            ) : null}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="status-logout"
            onClick={() => {
              logoutStudent()
              navigate('/')
            }}
          >
            退出
          </Button>
        </div>
      </header>
      <Outlet />
    </div>
  )
}

export function StaffShell() {
  const { currentStaff, logoutStaff } = useAppState()
  const navigate = useNavigate()
  if (!currentStaff) return <Navigate to="/staff/login" replace />

  const links = [
    { to: '/staff/progress', label: '進捗' },
    { to: '/staff/students', label: '実習生' },
    { to: '/staff/content', label: 'コンテンツ' },
    { to: '/staff/cbt', label: 'CBT結果' },
  ]

  return (
    <div className="surface-light min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-5">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="font-display text-2xl font-bold text-teal-900">LAB QUEST 管理</div>
            <div className="text-sm text-muted-foreground">
              {currentStaff.name} ／ {currentStaff.role === 'full' ? 'フル権限' : '運用権限'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex gap-1 rounded-lg border border-border bg-white/70 p-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="rounded-md px-3 py-1.5 text-sm text-teal-900 hover:bg-teal-50"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logoutStaff()
                navigate('/staff/login')
              }}
            >
              ログアウト
            </Button>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  )
}
