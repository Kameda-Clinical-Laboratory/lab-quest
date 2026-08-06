import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAppState } from '@/context/AppState'
import { IconCompass, IconSwordQuest } from '@/components/QuestIcons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function StudentLogin() {
  const { loginStudent, currentStudent } = useAppState()
  const navigate = useNavigate()
  const [code, setCode] = useState('TRAIN01')
  const [password, setPassword] = useState('1234')
  const [error, setError] = useState<string | null>(null)

  if (currentStudent) return <Navigate to="/app" replace />

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const err = loginStudent(code, password)
    if (err) setError(err)
    else navigate('/app')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="login-hero">
        <div className="login-hero-art">
          <img src="/art/quest-login-banner.png" alt="" />
          <div className="login-hero-caption">
            <div className="mb-1 text-xs uppercase tracking-[0.25em] text-amber-200/90">Lab Quest</div>
            <div className="font-display text-2xl font-bold text-parchment">検査室は、冒険の拠点になる</div>
            <p className="mt-1 text-sm text-amber-100/80">午前はクエスト、午後は現場へ。</p>
          </div>
        </div>

        <Card className="quest-frame quest-glow border-0 bg-transparent">
          <CardHeader className="space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-amber-500/50 bg-primary/15">
              <IconCompass className="h-9 w-9" />
            </div>
            <CardTitle className="text-3xl text-emerald-50">生化学免疫ラボクエスト</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              臨地実習の冒険クエスト。忙しい指導のあいだも、臨床の学びを進めます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="code">受講コード</Label>
                <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" size="lg" variant="quest">
                <IconSwordQuest className="h-5 w-5" />
                冒険を始める
              </Button>
            </form>
            <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
              モック: TRAIN01 / 1234（山田）・TRAIN02 / 5678（佐藤）
              <br />
              <Link className="text-primary underline-offset-2 hover:underline" to="/staff/login">
                スタッフログインへ
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function StaffLogin() {
  const { loginStaff, currentStaff } = useAppState()
  const navigate = useNavigate()
  const [password, setPassword] = useState('ops')
  const [error, setError] = useState<string | null>(null)

  if (currentStaff) return <Navigate to="/staff/progress" replace />

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const err = loginStaff(password)
    if (err) setError(err)
    else navigate('/staff/progress')
  }

  return (
    <div className="surface-light flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md border-teal-200 bg-white">
        <CardHeader>
          <CardTitle className="text-2xl text-teal-900">管理ログイン</CardTitle>
          <CardDescription>進捗・カレンダー割当・公開管理</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
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
            <Button type="submit" className="w-full">
              入室
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            フル: <code>full</code> ／ 運用: <code>ops</code>
            <br />
            <Link className="text-teal-700 underline" to="/">
              実習生ログインへ
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
