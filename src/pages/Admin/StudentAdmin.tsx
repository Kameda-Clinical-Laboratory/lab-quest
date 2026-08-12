// src/pages/Admin.tsx から移動(Phase 4)。ロジック変更なし。
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { getStage } from '@/mocks/data'
import {
  formatDateJa,
  getCarryoverSeriesIds,
  requiredUnassignedWarning,
  sortDates,
} from '@/mocks/schedule'
import type { DayPlan } from '@/mocks/types'
import { useAppState } from '@/context/AppState'
import { JP } from './strings'

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
    staffRole,
  } = useAppState()
  const canEdit = staffRole === 'full'

  const [selectedId, setSelectedId] = useState(students[0]?.id ?? '')
  const selected = students.find((s) => s.id === selectedId)

  const [name, setName] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [password, setPassword] = useState('0000')
  const [draftDates, setDraftDates] = useState<string[]>([])
  const [draftPlans, setDraftPlans] = useState<DayPlan[]>([])
  const [mode, setMode] = useState<'edit' | 'new'>('edit')
  const [activeDate, setActiveDate] = useState<string | null>(null)
  const [month, setMonth] = useState({ y: 2026, m: 8 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    setSchoolName(s.schoolName ?? '')
    setPassword(s.password)
    setDraftDates([...s.visitDates])
    setDraftPlans(s.dayPlans.map((p) => ({ ...p, seriesIds: [...p.seriesIds] })))
    setActiveDate(s.visitDates[0] ?? null)
    setError(null)
  }

  function startNew() {
    setMode('new')
    setSelectedId('')
    setName('')
    setSchoolName('')
    setPassword('0000')
    setDraftDates([])
    setDraftPlans([])
    setActiveDate(null)
    setError(null)
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

  async function onSave(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || draftDates.length === 0) {
      alert(JP.saveNeedNameDates)
      return
    }
    const payload = {
      id: mode === 'edit' ? selectedId : undefined,
      name: name.trim(),
      schoolName: schoolName.trim() || null,
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
    setError(null)
    setSaving(true)
    try {
      await upsertStudent(payload)
      if (mode === 'new') {
        startNew()
      }
      alert(JP.savedMock)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
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

      {!canEdit && <div className="banner warn">{JP.opsViewOnly}</div>}
      {error && <div className="banner warn">{error}</div>}

      <form className="grid-2" onSubmit={onSave}>
        <fieldset disabled={!canEdit} style={{ display: 'contents', border: 0, padding: 0, margin: 0 }}>
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>{mode === 'new' ? JP.modeNew : JP.modeEdit}</h3>
          <div className="field">
            <label>{JP.name}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label>{JP.schoolName}</label>
            <input
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder={JP.schoolNamePlaceholder}
            />
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
            <button type="submit" className="btn" disabled={saving}>
              {saving ? '保存中…' : JP.save}
            </button>
            {mode === 'edit' && selected && (
              <>
                <button
                  type="button"
                  className="btn secondary"
                  disabled={saving}
                  onClick={() => {
                    const pw = String(Math.floor(1000 + Math.random() * 9000))
                    setSaving(true)
                    setError(null)
                    resetStudentPassword(selected.id, pw)
                      .then(() => {
                        setPassword(pw)
                        alert(`${JP.pwReissuedPrefix}${pw}${JP.pwReissuedSuffix}`)
                      })
                      .catch((err) => setError(err instanceof Error ? err.message : '再発行に失敗しました'))
                      .finally(() => setSaving(false))
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
        </fieldset>
      </form>
    </div>
  )
}
