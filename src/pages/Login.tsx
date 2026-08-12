import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAppState } from '@/context/AppState'
import { IconLabCrest } from '@/components/QuestIcons'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function StudentLogin() {
  const { loginStudent, currentStudent } = useAppState()
  const navigate = useNavigate()
  const [code, setCode] = useState('TRAIN01')
  const [password, setPassword] = useState('1234')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (currentStudent) return <Navigate to="/app" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setPending(true)
    const err = await loginStudent(code, password)
    setPending(false)
    if (err) setError(err)
    else navigate('/app')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="login-hero">
        <div className="login-hero-art">
          <img src="/art/quest-login-banner.png" alt="" />
          <div className="login-hero-caption">
            <div className="mb-1 text-[11px] uppercase tracking-[0.28em] text-amber-200/85">Lab Quest</div>
            <div className="brand-title text-2xl sm:text-3xl">検査室は、冒険の拠点になる</div>
          </div>
        </div>

        <div className="login-panel">
          <div className="login-brand-art">
            <h1 className="sr-only">LAB QUEST — Biochemistry and Immunology</h1>
            <img
              className="brand-logo"
              src="/art/quest-brand-title.png"
              alt="LAB QUEST: Biochemistry and Immunology"
            />
            <p className="login-lede">
              これから臨地実習を始めるあなたへ。
              <br />
              検査の考え方を学び、現場へ活かしましょう。
            </p>
          </div>
          <CardContent className="relative z-[1] px-0 pt-4">
            <form className="login-form space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="code" className="login-label">
                  受講者コード
                </Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="login-label">
                  パスワード
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                className="login-start-btn w-full"
                size="lg"
                variant="quest"
                disabled={pending}
              >
                <IconLabCrest className="login-start-icon" />
                <span>{pending ? 'ログイン確認中…' : '冒険を始める'}</span>
              </Button>
            </form>
            <div className="mt-5 space-y-3 border-t border-border/70 pt-4">
              <p className="login-hint text-xs text-muted-foreground">
                モック: TRAIN01 / 1234（山田）・TRAIN02 / 5678（佐藤）
              </p>
              <Button asChild variant="outline" className="login-staff-btn w-full">
                <Link to="/staff/login">スタッフログイン</Link>
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  )
}

export function StaffLogin() {
  const { loginStaff, currentStaff } = useAppState()
  const navigate = useNavigate()
  const [password, setPassword] = useState('ops')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (currentStaff) return <Navigate to="/staff/progress" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setPending(true)
    const err = await loginStaff(password)
    setPending(false)
    if (err) setError(err)
    else navigate('/staff/progress')
  }

  return (
    <div className="surface-light flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border border-teal-200 bg-white p-6 shadow-sm">
        <h1 className="font-display text-2xl text-teal-900">管理ログイン</h1>
        <p className="mt-1 text-sm text-teal-800/70">進捗・カレンダー割当・公開管理</p>
        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="pw">パスワード（モック）</Label>
            <Input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? '確認中…' : '入室'}
          </Button>
        </form>
        <p className="mt-4 text-xs text-muted-foreground">
          フル: <code>full</code> ／ 運用: <code>ops</code>
        </p>
        <Button asChild variant="outline" className="mt-3 w-full border-teal-300 text-teal-800">
          <Link to="/">実習生ログインへ</Link>
        </Button>
      </div>
    </div>
  )
}
