import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAppState } from '@/context/AppState'
import { Button } from '@/components/ui/button'

/** consent_records.consent_version に記録される値。文言を大きく変えたら上げる。 */
const CONSENT_VERSION = 'v1'

export function Consent() {
  const { currentStudent, recordConsent, logoutStudent } = useAppState()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!currentStudent) return <Navigate to="/" replace />
  if (currentStudent.consentAt) return <Navigate to="/app" replace />

  async function onAgree() {
    setPending(true)
    setError(null)
    try {
      await recordConsent(CONSENT_VERSION)
      navigate('/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : '通信エラーが発生しました')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="consent-paper w-full max-w-2xl rounded-xl p-8 shadow-xl sm:p-10">
        <h1 className="font-display text-3xl">学習記録の取り扱いについて</h1>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>
            このアプリでは、臨地実習の学習を進めるために、進捗状況(クリア状況・XP・スタンプ)や
            最終CBTの解答・素点を記録します。これらは実習指導のためにスタッフが閲覧します。
          </p>
          <p>
            記録された学習記録は、実習終了後一定期間(既定1年、施設側の設定により変わる場合が
            あります)が経過すると、氏名等の個人を特定できる情報を含めて自動的に削除・匿名化されます。
          </p>
          <p>同意いただくと、以降このアプリで実習を進められます。</p>
        </div>
        {error && <p className="mt-4 text-base text-destructive">{error}</p>}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="quest"
            size="lg"
            className="flex-1"
            disabled={pending}
            onClick={() => void onAgree()}
          >
            {pending ? '確認中…' : '同意して始める'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              logoutStudent()
              navigate('/')
            }}
          >
            退出
          </Button>
        </div>
      </div>
    </div>
  )
}
