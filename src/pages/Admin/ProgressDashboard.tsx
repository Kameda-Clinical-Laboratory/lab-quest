// src/pages/Admin.tsx から移動(Phase 4)。
// Phase 5追加: 同意日の表示 + full権限による同意リセット(list_student_consent /
// reset_consent)。AppStateのstudents一覧はモック由来でid(stu-1等)が実DBのuuidと
// 一致しないため(M9と同じ制約)、codeで突き合わせてstudentIdだけをここで補う。
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getStage } from '@/mocks/data'
import { formatDateJa, getTodayQueue } from '@/mocks/schedule'
import { useAppState } from '@/context/AppState'
import { backendMode } from '@/lib/backendMode'
import { loadStaffSession } from '@/lib/session'
import { listStudentConsentApi, resetConsentApi } from '@/lib/contentAdminApi'
import { Button } from '@/components/ui/button'
import { JP } from './strings'

function formatConsentAt(iso: string) {
  const dt = new Date(iso)
  const week = ['日', '月', '火', '水', '木', '金', '土'][dt.getDay()]
  const hh = String(dt.getHours()).padStart(2, '0')
  const mm = String(dt.getMinutes()).padStart(2, '0')
  return `${dt.getMonth() + 1}/${dt.getDate()}（${week}） ${hh}:${mm}`
}

export function ProgressDashboard() {
  const { students, stages, mockToday, staffRole } = useAppState()
  const canEdit = staffRole === 'full'
  const queryClient = useQueryClient()
  const session = loadStaffSession()
  const token = session?.token ?? null
  const [resettingCode, setResettingCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const consentQuery = useQuery({
    queryKey: ['staff', 'studentConsent'],
    queryFn: () => listStudentConsentApi(token!),
    enabled: backendMode === 'supabase' && !!token,
    retry: 1,
    networkMode: 'always',
  })
  // Settings.tsx と同じ対応: fetchStatus='paused'のまま止まるケースも取得失敗として扱う。
  const consentFailed =
    consentQuery.isError || (consentQuery.fetchStatus === 'paused' && consentQuery.failureCount > 0)
  const consentByCode = new Map((consentQuery.data?.students ?? []).map((s) => [s.code, s]))

  async function resetConsent(code: string) {
    const entry = consentByCode.get(code)
    if (!entry || !token) return
    if (!confirm(JP.consentResetConfirm)) return
    setError(null)
    setMessage(null)
    setResettingCode(code)
    try {
      await resetConsentApi(token, entry.studentId)
      await queryClient.invalidateQueries({ queryKey: ['staff', 'studentConsent'] })
      setMessage(JP.consentResetOk)
    } catch (err) {
      setError(err instanceof Error ? err.message : '通信エラーが発生しました')
    } finally {
      setResettingCode(null)
    }
  }

  const showConsentColumn = backendMode === 'supabase'

  return (
    <div className="panel">
      <h2 style={{ marginTop: 0 }}>{JP.progressTitle}</h2>
      <p className="muted">{JP.progressDesc.replace('{date}', formatDateJa(mockToday))}</p>
      {error && <div className="banner warn">{error}</div>}
      {message && <div className="banner ok">{message}</div>}
      <table className="data">
        <thead>
          <tr>
            <th>{JP.name}</th>
            <th>{JP.visitDays}</th>
            <th>{JP.requiredClear}</th>
            <th>{JP.requiredRemain}</th>
            <th>{JP.todayQueue}</th>
            <th>{JP.carryover}</th>
            <th>{JP.cbtScore}</th>
            {showConsentColumn && <th>{JP.consentAt}</th>}
          </tr>
        </thead>
        <tbody>
          {students.map((s) => {
            const reqTotal = stages.filter((st) => st.required).length
            const reqDone = s.progress.clearedStageIds.filter((id) => getStage(stages, id)?.required).length
            const q = getTodayQueue(s, mockToday)
            const consent = consentByCode.get(s.code)
            return (
              <tr key={s.id}>
                <td>
                  {s.name}
                  <div className="muted">{s.code}</div>
                </td>
                <td>{s.visitDates.length}</td>
                <td>
                  {reqDone}/{reqTotal}
                </td>
                <td>{reqTotal - reqDone}</td>
                <td>{q.queueIds.map((id) => getStage(stages, id)?.title).join(JP.comma) || JP.dash}</td>
                <td>{q.carryIds.length}</td>
                <td>
                  {s.progress.cbtScore === null
                    ? JP.notTaken
                    : `${s.progress.cbtScore}/${s.progress.cbtDrawnIds.length || '?'}`}
                </td>
                {showConsentColumn && (
                  <td>
                    {consentFailed ? (
                      <span className="muted">{JP.dash}</span>
                    ) : consentQuery.isPending ? (
                      <span className="muted">…</span>
                    ) : (
                      <div className="inline" style={{ flexWrap: 'wrap', gap: 6 }}>
                        <span>{consent?.consentAt ? formatConsentAt(consent.consentAt) : JP.consentNotYet}</span>
                        {canEdit && consent?.consentAt && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={resettingCode === s.code}
                            onClick={() => void resetConsent(s.code)}
                          >
                            {JP.consentReset}
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
