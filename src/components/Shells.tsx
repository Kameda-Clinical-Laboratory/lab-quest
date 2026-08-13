import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAppState } from '@/context/AppState'
import { getStage } from '@/mocks/data'
import { IconFlask, IconScroll, IconStamp, IconXpOrb } from '@/components/QuestIcons'
import { Button } from '@/components/ui/button'
import { readCodexSeen, stampProgress, xpProgress } from '@/lib/playerHud'
import { backendMode } from '@/lib/backendMode'
import { UnsavedChangesProvider, useUnsavedChanges } from '@/context/UnsavedChanges'

export function StudentShell() {
  const { currentStudent, logoutStudent, todayQueue, stages, studentStateLoaded } = useAppState()
  const navigate = useNavigate()
  const location = useLocation()
  if (!currentStudent) return <Navigate to="/" replace />
  // Phase 5: 同意ゲート。studentStateLoadedを待つのは、ログイン直後の非同期フェッチが
  // 終わる前(currentStudent.consentAtがまだ橋渡し元のモック値のまま)に、
  // 既に同意済みの学生を誤って/consentへ弾かないため。モックモードは対象外。
  if (backendMode === 'supabase' && studentStateLoaded && !currentStudent.consentAt) {
    return <Navigate to="/consent" replace />
  }

  const clueTotal = stages.reduce((n, s) => n + (s.clues?.length ?? 0), 0)
  const clueOwned = currentStudent.progress.ownedClueIds.length
  const onCodex = location.pathname.startsWith('/app/codex')
  const xp = xpProgress(currentStudent.progress.xp)
  const stamps = stampProgress(
    currentStudent.progress.stamps,
    currentStudent.visitDates.length,
  )
  const codexPct = clueTotal ? Math.round((clueOwned / clueTotal) * 100) : 0
  const codexNew = clueOwned > readCodexSeen(currentStudent.id)
  const carry = todayQueue?.carryIds.length ?? 0
  const reqTotal = stages.filter((s) => s.required).length
  const reqDone = currentStudent.progress.clearedStageIds.filter(
    (id) => getStage(stages, id)?.required,
  ).length

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-5">
      <header className="status-bar mb-6">
        <div className="status-bar-left">
          <Link to="/app" className="status-bar-brand" title="ホームへ">
            <img
              className="brand-logo brand-logo-header"
              src="/art/quest-brand-title.png"
              alt="LAB QUEST"
            />
          </Link>
          <div className="status-player" title={currentStudent.name}>
            {currentStudent.schoolName && (
              <span className="status-player-school">{currentStudent.schoolName}</span>
            )}
            <span className="status-player-name">{currentStudent.name}</span>
            <div className="status-player-stats" role="group" aria-label="ステータス">
              <div
                className="status-inline-xp"
                title={`経験値 ${xp.xp}（次のレベルまで ${xp.toNext}）`}
              >
                <span className="status-meter-head">
                  <IconXpOrb className="h-3.5 w-3.5" />
                  <span className="status-chip-label">XP</span>
                  <strong>{xp.xp}</strong>
                </span>
                <div className="status-meter-track" aria-hidden>
                  <div className="status-meter-fill xp" style={{ width: `${xp.pct}%` }} />
                </div>
              </div>
              <span
                className="status-meter-head"
                title={`必須シリーズ進捗 ${reqDone} / ${reqTotal}`}
              >
                <IconFlask className="h-3.5 w-3.5" />
                <span className="status-chip-label">進捗</span>
                <strong>
                  {reqDone}/{reqTotal}
                </strong>
              </span>
            </div>
          </div>
        </div>

        <div className="status-bar-right">
          <Link
            to="/app/stamps"
            className={`status-btn ${location.pathname.startsWith('/app/stamps') ? 'active' : ''}`}
            title={`スタンプ ${stamps.stamps} / 目標 ${stamps.goal}（クリックでスタンプ手帳へ）`}
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
          </Link>

          <Link
            to="/app/codex"
            className={`status-btn ${onCodex ? 'active' : ''}`}
            title={`シリーズふりかえり（調査キーワード ${clueOwned}/${clueTotal || 0}）`}
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
            <div className="status-btn status-btn-warn" title="繰り越しクエスト">
              <div className="status-meter-head">
                <span className="status-chip-label">繰越</span>
                <strong>{carry}</strong>
              </div>
              <div className="status-meter-track" aria-hidden>
                <div className="status-meter-fill warn" style={{ width: '100%' }} />
              </div>
            </div>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            className="status-logout"
            onClick={() => {
              logoutStudent()
              navigate('/')
            }}
          >
            ログアウト
          </Button>
        </div>
      </header>
      <div className="shell-outlet">
        <Outlet />
      </div>
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
    { to: '/staff/settings', label: '設定' },
  ]

  return (
    <UnsavedChangesProvider>
      <StaffShellBody currentStaff={currentStaff} links={links} logoutStaff={logoutStaff} navigate={navigate} />
    </UnsavedChangesProvider>
  )
}

function StaffShellBody({
  currentStaff,
  links,
  logoutStaff,
  navigate,
}: {
  currentStaff: { name: string; role: string }
  links: { to: string; label: string }[]
  logoutStaff: () => void
  navigate: ReturnType<typeof useNavigate>
}) {
  // ヘッダーのナビ/ログアウトは、編集中の未保存の変更がある間、離脱前に確認する
  // (エディタページ本体がuseUnsavedChanges().setDirty(...)で状態を反映する)。
  const { confirmLeave } = useUnsavedChanges()

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
                  onClick={(e) => {
                    if (!confirmLeave()) e.preventDefault()
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!confirmLeave()) return
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
