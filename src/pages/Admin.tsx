import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { getStage } from '@/mocks/data'
import {
  formatDateJa,
  getCarryoverSeriesIds,
  getTodayQueue,
  requiredUnassignedWarning,
  sortDates,
} from '@/mocks/schedule'
import type { DayPlan } from '@/mocks/types'
import { useAppState } from '@/context/AppState'

const JP = {
  progressTitle: '進捗一覧',
  progressDesc:
    'モック今日: {date}。必須残・繰り越し・CBT素点を確認。合否は表示しません。',
  name: '氏名',
  visitDays: '実習日数',
  requiredClear: '必須クリア',
  requiredRemain: '必須残',
  todayQueue: '今日キュー',
  carryover: '繰り越し',
  cbtScore: 'CBT素点',
  comma: '、',
  dash: '—',
  notTaken: '未受験',
  saveNeedNameDates: '氏名と実習日（1日以上）が必須です',
  missingRequiredPrefix: '必須シリーズ未割当: ',
  saveConfirm: 'このまま保存しますか？',
  savedMock: '保存しました（モック）',
  studentAdminTitle: '実習生登録・カレンダー割当',
  newRegister: '新規登録',
  mockTodayLabel: 'モック今日',
  modeNew: '新規',
  modeEdit: '編集',
  password: 'パスワード',
  visitCountPrefix: '実習日数（カレンダー選択）: ',
  daySuffix: ' 日',
  year: '年',
  month: '月',
  dow: ['日', '月', '火', '水', '木', '金', '土'] as const,
  calTitle:
    'クリックで割当編集（未選択日は選択／選択済をダブルクリックで解除）',
  calHint:
    '未選択日をクリックで実習日に追加。選択済をダブルクリックで解除。単クリックで右の割当を編集。',
  save: '保存',
  pwReissuedPrefix: 'パスワードを ',
  pwReissuedSuffix: ' に再発行',
  pwReissue: 'パスワード再発行',
  cbtRetakeAllowed: 'CBT再受験を許可',
  cbtRetakeAllow: 'CBT再受験許可',
  carryPreviewPrefix: 'モック今日の繰り越し見込み: ',
  dayAssignTitle: '日付ごとのシリーズ割当',
  pickVisitDay: '左のカレンダーで実習日を選んでください。',
  removeVisitDay: 'この日を実習から外す',
  noteLabel: 'メモ（見学など）',
  notePlaceholder: '例: 午前見学（アプリなし）',
  seriesSelectHint:
    'シリーズを選択（0本＝アプリなし日可）。1日に複数可。',
  required: '必須',
  optional: '任意',
  procedure: '手技',
  assigned: '割当中',
  add: '追加',
  zeroSeriesBanner:
    'シリーズ0本 → 見学などアプリなし日として扱います。',
  contentTitle: 'コンテンツ管理',
  opsViewOnly:
    '運用権限のため閲覧のみです。編集・公開切替はフル権限のみ。',
  series: 'シリーズ',
  publish: '公開',
  published: '公開中',
  unpublished: '非公開',
  preview: 'プレビュー',
  unpublish: '非公開にする',
  doPublish: '公開する',
  previewPrefix: 'プレビュー: ',
  chapter: 'チャプター ',
  caseCount: ' ・症例 ',
  hasProcedure: ' ・手技あり',
  cbtResults: 'CBT結果',
  exportCsv: 'Excel用CSV書き出し',
  cbtDesc:
    'クリア済みシリーズから構成された素点のみ。合格／不合格ラベルは出しません。',
  score: '素点',
  scope: '範囲',
  perQuestion: '設問別',
  perQuestionDetail: ' の設問別正誤',
  correctWrong: '正誤',
  question: '問題',
  correct: '正',
  wrong: '誤',
  code: 'コード',
  drawnCount: '出題数',
  examScope: '受験範囲',
}

export function ProgressDashboard() {
  const { students, stages, mockToday } = useAppState()

  return (
    <div className="panel">
      <h2 style={{ marginTop: 0 }}>{JP.progressTitle}</h2>
      <p className="muted">{JP.progressDesc.replace('{date}', formatDateJa(mockToday))}</p>
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
          </tr>
        </thead>
        <tbody>
          {students.map((s) => {
            const reqTotal = stages.filter((st) => st.required).length
            const reqDone = s.progress.clearedStageIds.filter((id) => getStage(stages, id)?.required).length
            const q = getTodayQueue(s, mockToday)
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
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function buildMonthDays(year: number, month: number) {
  const first = new Date(year, month - 1, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < startPad; i += 1) cells.push(null)
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  }
  return cells
}

export function StudentAdmin() {
  const {
    students,
    stages,
    upsertStudent,
    resetStudentPassword,
    allowCbtRetake,
    mockToday,
    setMockToday,
  } = useAppState()

  const [selectedId, setSelectedId] = useState(students[0]?.id ?? '')
  const selected = students.find((s) => s.id === selectedId)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('0000')
  const [draftDates, setDraftDates] = useState<string[]>([])
  const [draftPlans, setDraftPlans] = useState<DayPlan[]>([])
  const [mode, setMode] = useState<'edit' | 'new'>('edit')
  const [activeDate, setActiveDate] = useState<string | null>(null)
  const [month, setMonth] = useState({ y: 2026, m: 8 })

  useEffect(() => {
    if (students[0] && mode === 'edit' && !name) loadStudent(students[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cells = useMemo(() => buildMonthDays(month.y, month.m), [month])

  function loadStudent(id: string) {
    const s = students.find((x) => x.id === id)
    if (!s) return
    setMode('edit')
    setSelectedId(id)
    setName(s.name)
    setPassword(s.password)
    setDraftDates([...s.visitDates])
    setDraftPlans(s.dayPlans.map((p) => ({ ...p, seriesIds: [...p.seriesIds] })))
    setActiveDate(s.visitDates[0] ?? null)
  }

  function startNew() {
    setMode('new')
    setSelectedId('')
    setName('')
    setPassword('0000')
    setDraftDates([])
    setDraftPlans([])
    setActiveDate(null)
  }

  function toggleDate(iso: string) {
    setDraftDates((prev) => {
      const has = prev.includes(iso)
      const next = has ? prev.filter((d) => d !== iso) : sortDates([...prev, iso])
      setDraftPlans((plans) => {
        if (has) return plans.filter((p) => p.date !== iso)
        if (plans.some((p) => p.date === iso)) return plans
        return [...plans, { date: iso, seriesIds: [], note: '' }].sort((a, b) =>
          a.date.localeCompare(b.date),
        )
      })
      if (!has) setActiveDate(iso)
      else if (activeDate === iso) setActiveDate(next[0] ?? null)
      return next
    })
  }

  function planFor(date: string): DayPlan {
    return draftPlans.find((p) => p.date === date) ?? { date, seriesIds: [], note: '' }
  }

  function setPlan(date: string, patch: Partial<DayPlan>) {
    setDraftPlans((prev) => {
      const base = prev.find((p) => p.date === date) ?? { date, seriesIds: [], note: '' }
      const next = { ...base, ...patch }
      return [...prev.filter((p) => p.date !== date), next].sort((a, b) => a.date.localeCompare(b.date))
    })
  }

  function toggleSeries(date: string, seriesId: string) {
    const plan = planFor(date)
    const has = plan.seriesIds.includes(seriesId)
    setPlan(date, {
      seriesIds: has ? plan.seriesIds.filter((id) => id !== seriesId) : [...plan.seriesIds, seriesId],
    })
  }

  function onSave(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || draftDates.length === 0) {
      alert(JP.saveNeedNameDates)
      return
    }
    const payload = {
      id: mode === 'edit' ? selectedId : undefined,
      name: name.trim(),
      password,
      visitDates: draftDates,
      dayPlans: draftPlans,
    }
    const requiredIds = stages.filter((s) => s.required).map((s) => s.id)
    const missing = requiredUnassignedWarning(draftPlans, requiredIds)
    if (missing.length > 0) {
      const ok = confirm(
        `${JP.missingRequiredPrefix}${missing.map((id) => getStage(stages, id)?.title).join(JP.comma)}\n${JP.saveConfirm}`,
      )
      if (!ok) return
    }
    upsertStudent(payload)
    if (mode === 'new') {
      startNew()
    }
    alert(JP.savedMock)
  }

  const activePlan = activeDate ? planFor(activeDate) : null
  const carryPreview =
    selected && mockToday
      ? getCarryoverSeriesIds(
          {
            ...selected,
            dayPlans: draftPlans,
            visitDates: draftDates,
            progress: selected.progress,
          },
          mockToday,
        )
      : []

  return (
    <div className="stack">
      <div className="panel">
        <div className="inline" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ marginTop: 0 }}>{JP.studentAdminTitle}</h2>
          <div className="inline">
            <button type="button" className="btn secondary" onClick={startNew}>
              {JP.newRegister}
            </button>
            <label className="muted">
              {JP.mockTodayLabel}
              <input
                type="date"
                value={mockToday}
                onChange={(e) => setMockToday(e.target.value)}
                style={{ marginLeft: 8 }}
              />
            </label>
          </div>
        </div>
        <div className="inline">
          {students.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`btn ghost${selectedId === s.id && mode === 'edit' ? '' : ''}`}
              style={
                selectedId === s.id && mode === 'edit'
                  ? { borderColor: 'var(--teal)', background: 'rgba(15,118,110,0.1)' }
                  : undefined
              }
              onClick={() => loadStudent(s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <form className="grid-2" onSubmit={onSave}>
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>{mode === 'new' ? JP.modeNew : JP.modeEdit}</h3>
          <div className="field">
            <label>{JP.name}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label>{JP.password}</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <p className="muted">
            {JP.visitCountPrefix}
            {draftDates.length}
            {JP.daySuffix}
          </p>

          <div className="cal-head inline" style={{ justifyContent: 'space-between' }}>
            <button
              type="button"
              className="btn ghost"
              onClick={() =>
                setMonth((m) => (m.m === 1 ? { y: m.y - 1, m: 12 } : { y: m.y, m: m.m - 1 }))
              }
            >
              &lsaquo;
            </button>
            <strong>
              {month.y}
              {JP.year}
              {month.m}
              {JP.month}
            </strong>
            <button
              type="button"
              className="btn ghost"
              onClick={() =>
                setMonth((m) => (m.m === 12 ? { y: m.y + 1, m: 1 } : { y: m.y, m: m.m + 1 }))
              }
            >
              &rsaquo;
            </button>
          </div>
          <div className="cal-grid">
            {JP.dow.map((w) => (
              <div key={w} className="cal-dow">
                {w}
              </div>
            ))}
            {cells.map((iso, i) =>
              iso ? (
                <button
                  key={iso}
                  type="button"
                  className={`cal-day${draftDates.includes(iso) ? ' selected' : ''}${
                    activeDate === iso ? ' active' : ''
                  }${iso === mockToday ? ' today' : ''}`}
                  onClick={() => {
                    if (draftDates.includes(iso)) setActiveDate(iso)
                    else toggleDate(iso)
                  }}
                  onDoubleClick={() => toggleDate(iso)}
                  title={JP.calTitle}
                >
                  {Number(iso.slice(-2))}
                  {draftPlans.find((p) => p.date === iso)?.seriesIds.length === 0 &&
                    draftDates.includes(iso) && <span className="cal-dot off" />}
                  {(draftPlans.find((p) => p.date === iso)?.seriesIds.length ?? 0) > 0 && (
                    <span className="cal-dot on" />
                  )}
                </button>
              ) : (
                <div key={`e-${i}`} />
              ),
            )}
          </div>
          <p className="muted" style={{ fontSize: '0.8rem' }}>
            {JP.calHint}
          </p>
          <div className="inline" style={{ marginTop: 12 }}>
            <button type="submit" className="btn">
              {JP.save}
            </button>
            {mode === 'edit' && selected && (
              <>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => {
                    const pw = String(Math.floor(1000 + Math.random() * 9000))
                    resetStudentPassword(selected.id, pw)
                    setPassword(pw)
                    alert(`${JP.pwReissuedPrefix}${pw}${JP.pwReissuedSuffix}`)
                  }}
                >
                  {JP.pwReissue}
                </button>
                <button
                  type="button"
                  className="btn warn"
                  onClick={() => {
                    allowCbtRetake(selected.id)
                    alert(JP.cbtRetakeAllowed)
                  }}
                >
                  {JP.cbtRetakeAllow}
                </button>
              </>
            )}
          </div>
          {carryPreview.length > 0 && (
            <p className="muted">
              {JP.carryPreviewPrefix}
              {carryPreview.map((id) => getStage(stages, id)?.title).join(JP.comma)}
            </p>
          )}
        </div>

        <div className="panel">
          <h3 style={{ marginTop: 0 }}>{JP.dayAssignTitle}</h3>
          {!activeDate || !activePlan ? (
            <p className="muted">{JP.pickVisitDay}</p>
          ) : (
            <>
              <p>
                <strong>{formatDateJa(activeDate)}</strong>
                <button
                  type="button"
                  className="btn ghost"
                  style={{ marginLeft: 8 }}
                  onClick={() => toggleDate(activeDate)}
                >
                  {JP.removeVisitDay}
                </button>
              </p>
              <div className="field">
                <label>{JP.noteLabel}</label>
                <input
                  value={activePlan.note ?? ''}
                  onChange={(e) => setPlan(activeDate, { note: e.target.value })}
                  placeholder={JP.notePlaceholder}
                />
              </div>
              <p className="muted">{JP.seriesSelectHint}</p>
              <div className="stage-list">
                {stages.map((s) => {
                  const on = activePlan.seriesIds.includes(s.id)
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`stage-row${on ? ' recommended' : ''}`}
                      onClick={() => toggleSeries(activeDate, s.id)}
                    >
                      <div>
                        <strong>{s.title}</strong>
                        <div className="stage-meta">
                          <span className={`tag ${s.required ? 'req' : 'opt'}`}>
                            {s.required ? JP.required : JP.optional}
                          </span>
                          {s.hasProcedure && <span className="tag">{JP.procedure}</span>}
                        </div>
                      </div>
                      <span>{on ? JP.assigned : JP.add}</span>
                    </button>
                  )
                })}
              </div>
              {activePlan.seriesIds.length === 0 && (
                <div className="banner warn">{JP.zeroSeriesBanner}</div>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  )
}

export function ContentAdmin() {
  const { stages, staffRole, publishedStageIds, setPublished } = useAppState()
  const canEdit = staffRole === 'full'
  const [previewId, setPreviewId] = useState(stages[0]?.id ?? '')
  const stage = stages.find((s) => s.id === previewId)

  return (
    <div className="grid-2">
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>{JP.contentTitle}</h2>
        {!canEdit && <div className="banner warn">{JP.opsViewOnly}</div>}
        <table className="data">
          <thead>
            <tr>
              <th>{JP.series}</th>
              <th>{JP.required}</th>
              <th>{JP.publish}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {stages.map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td>{s.required ? JP.required : JP.optional}</td>
                <td>{publishedStageIds.includes(s.id) ? JP.published : JP.unpublished}</td>
                <td className="row-actions">
                  <button type="button" className="btn ghost" onClick={() => setPreviewId(s.id)}>
                    {JP.preview}
                  </button>
                  {canEdit && (
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => setPublished(s.id, !publishedStageIds.includes(s.id))}
                    >
                      {publishedStageIds.includes(s.id) ? JP.unpublish : JP.doPublish}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="panel">
        <h3 style={{ marginTop: 0 }}>
          {JP.previewPrefix}
          {stage?.title}
        </h3>
        {stage && (
          <>
            <p className="muted">
              {JP.chapter}
              {stage.chapters.length}
              {JP.caseCount}
              {stage.caseSteps.length}
              {stage.hasProcedure ? JP.hasProcedure : ''}
            </p>
            {stage.chapters.map((ch) => (
              <div key={ch.id} style={{ marginBottom: 16 }}>
                <strong>{ch.title}</strong>
                <div className="lecture" style={{ fontSize: '0.95rem' }}>
                  {ch.lecture.slice(0, 160)}&hellip;
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export function CbtResultsAdmin() {
  const { students, cbtQuestionBank, stages } = useAppState()
  const [focusId, setFocusId] = useState<string | null>(null)
  const focus = students.find((s) => s.id === focusId)

  function exportCsv() {
    const lines = [[JP.name, JP.code, JP.score, JP.drawnCount, JP.examScope, JP.perQuestion].join(',')]
    for (const s of students) {
      if (s.progress.cbtScore === null) continue
      const paper = s.progress.cbtDrawnIds
        .map((id) => cbtQuestionBank.find((q) => q.id === id))
        .filter(Boolean)
      const detail = paper
        .map((q) => (q && s.progress.cbtAnswers[q.id] === q.correctIndex ? JP.correct : JP.wrong))
        .join('|')
      lines.push(
        [
          s.name,
          s.code,
          String(s.progress.cbtScore),
          String(paper.length),
          s.progress.cbtScopeStageIds.map((id) => getStage(stages, id)?.title).join('|'),
          detail,
        ].join(','),
      )
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cbt-results-mock.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="panel">
      <div className="inline" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ marginTop: 0 }}>{JP.cbtResults}</h2>
        <button type="button" className="btn secondary" onClick={exportCsv}>
          {JP.exportCsv}
        </button>
      </div>
      <p className="muted">{JP.cbtDesc}</p>
      <table className="data">
        <thead>
          <tr>
            <th>{JP.name}</th>
            <th>{JP.score}</th>
            <th>{JP.scope}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>
                {s.progress.cbtScore === null
                  ? JP.notTaken
                  : `${s.progress.cbtScore} / ${s.progress.cbtDrawnIds.length}`}
              </td>
              <td className="muted">
                {s.progress.cbtScopeStageIds.map((id) => getStage(stages, id)?.title).join(JP.comma) || JP.dash}
              </td>
              <td>
                <button
                  type="button"
                  className="btn ghost"
                  disabled={s.progress.cbtScore === null}
                  onClick={() => setFocusId(s.id)}
                >
                  {JP.perQuestion}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {focus && focus.progress.cbtScore !== null && (
        <div style={{ marginTop: 20 }}>
          <h3>
            {focus.name}
            {JP.perQuestionDetail}
          </h3>
          <table className="data">
            <thead>
              <tr>
                <th>#</th>
                <th>{JP.correctWrong}</th>
                <th>{JP.question}</th>
              </tr>
            </thead>
            <tbody>
              {focus.progress.cbtDrawnIds.map((id, i) => {
                const q = cbtQuestionBank.find((x) => x.id === id)
                if (!q) return null
                return (
                  <tr key={id}>
                    <td>{i + 1}</td>
                    <td>{focus.progress.cbtAnswers[id] === q.correctIndex ? JP.correct : JP.wrong}</td>
                    <td>{q.prompt}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
