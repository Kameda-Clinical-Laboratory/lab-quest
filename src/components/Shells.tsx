import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAppState } from '@/context/AppState'
import { formatDateJa } from '@/mocks/schedule'
import { IconCompass, IconStamp, IconXpOrb } from '@/components/QuestIcons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function StudentShell() {
  const { currentStudent, logoutStudent, mockToday, todayQueue } = useAppState()
  const navigate = useNavigate()
  if (!currentStudent) return <Navigate to="/" replace />

  const visitIndex = currentStudent.visitDates.indexOf(mockToday)

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-5">
      <header className="quest-ticket mb-6 flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-amber-500/50 bg-primary/15 quest-glow">
            <IconCompass className="h-8 w-8" />
          </div>
          <div>
            <div className="font-display text-2xl font-bold tracking-tight text-emerald-100">
              生化学免疫ラボクエスト
            </div>
            <div className="text-sm text-muted-foreground">
              {currentStudent.name} ／ {formatDateJa(mockToday)}
              {visitIndex >= 0 ? ` ／ 実習${visitIndex + 1}/${currentStudent.visitDates.length}日目` : ''}
              {todayQueue && todayQueue.carryIds.length > 0 ? (
                <Badge variant="quest" className="ml-2 text-amber-100">
                  繰り越し {todayQueue.carryIds.length}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="xp-orb">
            <IconXpOrb className="h-4 w-4" /> XP {currentStudent.progress.xp}
          </span>
          <span className="xp-orb">
            <IconStamp className="h-4 w-4" /> {currentStudent.progress.stamps}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logoutStudent()
              navigate('/')
            }}
          >
            ログアウト
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
            <div className="font-display text-2xl font-bold text-teal-900">生化学免疫ラボクエスト 管理</div>
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
