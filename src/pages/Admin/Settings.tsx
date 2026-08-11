// Phase 5: データ保持期間(app_config.retention_days)の閲覧・編集。
// full権限のみ編集可、ops権限は閲覧のみ(admin-content Edge Function側の
// set_retention_days が実際の防御線 — このUIのdisabledはUXのみ)。
import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppState } from '@/context/AppState'
import { backendMode } from '@/lib/backendMode'
import { loadStaffSession } from '@/lib/session'
import { getSettingsApi, setRetentionDaysApi } from '@/lib/contentAdminApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function Settings() {
  const { staffRole } = useAppState()
  const canEdit = staffRole === 'full'
  const queryClient = useQueryClient()

  const session = loadStaffSession()
  const token = session?.token ?? null

  const settingsQuery = useQuery({
    queryKey: ['settings', 'retentionDays'],
    queryFn: () => getSettingsApi(token!),
    enabled: backendMode === 'supabase' && !!token,
    retry: 1,
    networkMode: 'always',
  })
  // オンライン検知が不安定な環境(共有PC、一部の自動テストツール等)だと、失敗後に
  // fetchStatus が 'paused' のまま止まり isError にならないことがある。その場合も
  // 無限スピナーにせず、直近の失敗理由(failureReason)をエラーとして扱う。
  const settingsFailed =
    settingsQuery.isError ||
    (settingsQuery.fetchStatus === 'paused' && settingsQuery.failureCount > 0)
  const settingsError = settingsQuery.error ?? settingsQuery.failureReason

  const [days, setDays] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'warn'; text: string } | null>(null)

  useEffect(() => {
    if (settingsQuery.data) setDays(String(settingsQuery.data.retentionDays))
  }, [settingsQuery.data])

  if (backendMode !== 'supabase') {
    return <p className="banner warn">この機能はSupabaseモードでのみ利用できます</p>
  }
  if (!token) {
    return <p className="banner warn">再ログインが必要です</p>
  }

  async function save() {
    const n = Number(days)
    if (!Number.isFinite(n) || n < 1) {
      setMessage({ kind: 'warn', text: '1以上の整数を入力してください' })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      await setRetentionDaysApi(token!, Math.trunc(n))
      queryClient.invalidateQueries({ queryKey: ['settings', 'retentionDays'] })
      setMessage({ kind: 'ok', text: '保存しました' })
    } catch (err) {
      setMessage({ kind: 'warn', text: err instanceof Error ? err.message : '保存に失敗しました' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="panel" style={{ maxWidth: 480 }}>
      <h2 style={{ marginTop: 0 }}>設定</h2>
      {!canEdit && <div className="banner warn">運用権限のため閲覧のみです。変更はフル権限のみ。</div>}
      {settingsFailed ? (
        <div className="banner warn">
          {settingsError instanceof Error ? settingsError.message : '取得に失敗しました'}
        </div>
      ) : settingsQuery.isPending ? (
        <p className="muted">読み込み中…</p>
      ) : (
        <>
          <div className="field">
            <Label>データ保持期間（日）</Label>
            <Input
              type="number"
              min={1}
              value={days}
              disabled={!canEdit}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
          <p className="muted" style={{ fontSize: '0.85rem' }}>
            実習生の最終実習日からこの日数が経過すると、氏名等を自動的に匿名化します。
          </p>
          {message && (
            <div className={`banner ${message.kind === 'ok' ? 'ok' : 'warn'}`}>{message.text}</div>
          )}
          {canEdit && (
            <Button type="button" disabled={saving} onClick={() => void save()}>
              保存
            </Button>
          )}
        </>
      )}
    </div>
  )
}
