import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { validateUnit, type Beat, type ClueDef, type LearningUnit } from '@/mocks/learning'
import { backendMode } from '@/lib/backendMode'
import { loadStaffSession } from '@/lib/session'
import { useAdminCurriculum } from '@/lib/useAdminCurriculum'
import { PublishValidationError, publishUnitApi, saveUnitDraftApi } from '@/lib/contentAdminApi'
import { useAppState } from '@/context/AppState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { JP } from '../strings'
import { BeatList } from './BeatList'
import { BeatFormPanel } from './BeatFormPanel'
import { PreviewPane } from './PreviewPane'

export function UnitEditor() {
  const { stageId = '', unitId = '' } = useParams()
  const { staffRole } = useAppState()
  const canEdit = staffRole === 'full'
  const queryClient = useQueryClient()

  // フックはすべて早期returnより前に無条件で呼ぶ(Rules of Hooks)。
  // backendMode/セッション不在の分岐はレンダリング内容の出し分けのみで行う。
  const session = loadStaffSession()
  const token = session?.token ?? null

  const { data: curriculum, isLoading } = useAdminCurriculum()
  const stage = curriculum?.find((s) => s.id === stageId)
  const serverUnit = stage?.units?.find((u) => u.id === unitId)

  const seededFor = useRef<string | null>(null)
  const [draft, setDraft] = useState<LearningUnit | null>(null)
  const [clues, setClues] = useState<ClueDef[]>([])
  const [selectedBeatId, setSelectedBeatId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'warn'; text: string } | null>(null)
  const [publishErrors, setPublishErrors] = useState<string[] | null>(null)

  useEffect(() => {
    if (serverUnit && seededFor.current !== unitId) {
      setDraft(structuredClone(serverUnit))
      setClues(stage?.clues ?? [])
      setSelectedBeatId(serverUnit.beats[0]?.id ?? null)
      seededFor.current = unitId
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUnit, unitId])

  if (backendMode !== 'supabase') {
    return <p className="banner warn">{JP.supabaseOnly}</p>
  }
  if (!token) {
    return <p className="banner warn">{JP.loginAgain}</p>
  }
  if (isLoading || !draft) {
    return <p className="muted">{JP.loading}</p>
  }
  if (!stage || !serverUnit) {
    return (
      <div className="panel">
        <p className="muted">{JP.units}が見つかりません。</p>
        <Link className="btn" to={`/staff/content/${stageId}`}>
          {JP.backToStages}
        </Link>
      </div>
    )
  }

  const selectedBeat = draft.beats.find((b) => b.id === selectedBeatId) ?? null
  const owned = new Set(
    draft.beats
      .filter((b): b is Extract<Beat, { type: 'investigate' }> => b.type === 'investigate')
      .map((b) => b.clueId)
      .filter(Boolean),
  )

  function updateBeat(next: Beat) {
    setDraft((d) => (d ? { ...d, beats: d.beats.map((b) => (b.id === next.id ? next : b)) } : d))
  }
  function addBeat(beat: Beat) {
    setDraft((d) => (d ? { ...d, beats: [...d.beats, beat] } : d))
    setSelectedBeatId(beat.id)
  }
  function deleteBeat(id: string) {
    setDraft((d) => (d ? { ...d, beats: d.beats.filter((b) => b.id !== id) } : d))
    if (selectedBeatId === id) setSelectedBeatId(null)
  }
  function reorderBeats(beats: Beat[]) {
    setDraft((d) => (d ? { ...d, beats } : d))
  }

  async function saveDraft(): Promise<void> {
    if (!draft || !token) return
    setSaving(true)
    setMessage(null)
    try {
      await saveUnitDraftApi(token, {
        unitId: draft.id,
        title: draft.title,
        requestLine: draft.requestLine,
        beats: draft.beats,
      })
      queryClient.invalidateQueries({ queryKey: ['curriculum', 'admin'] })
      setMessage({ kind: 'ok', text: JP.savedDraft })
    } catch (err) {
      setMessage({ kind: 'warn', text: err instanceof Error ? err.message : '保存に失敗しました' })
    } finally {
      setSaving(false)
    }
  }

  async function publish() {
    if (!draft || !token) return
    setPublishErrors(null)
    const clientErrors = validateUnit(draft)
    if (clientErrors.length > 0) {
      setPublishErrors(clientErrors)
      return
    }
    setPublishing(true)
    setMessage(null)
    try {
      await saveDraft()
      await publishUnitApi(token, { unitId: draft.id })
      queryClient.invalidateQueries({ queryKey: ['curriculum', 'admin'] })
      setMessage({ kind: 'ok', text: JP.publishedOk })
    } catch (err) {
      if (err instanceof PublishValidationError) {
        setPublishErrors(err.errors)
      } else {
        setMessage({ kind: 'warn', text: err instanceof Error ? err.message : '公開に失敗しました' })
      }
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="stack">
      <div className="panel">
        <div className="inline" style={{ justifyContent: 'space-between' }}>
          <Link to={`/staff/content/${stageId}`}>{JP.backToStages}</Link>
          <span className="muted">
            {serverUnit.published ? JP.published : JP.unpublished}
          </span>
        </div>
        {!canEdit && <div className="banner warn">{JP.opsViewOnly}</div>}
        <div className="field">
          <Label>{JP.unitTitle}</Label>
          <Input
            value={draft.title}
            disabled={!canEdit}
            onChange={(e) => setDraft((d) => (d ? { ...d, title: e.target.value } : d))}
          />
        </div>
        <div className="field">
          <Label>{JP.requestLine}</Label>
          <Input
            value={draft.requestLine}
            disabled={!canEdit}
            onChange={(e) => setDraft((d) => (d ? { ...d, requestLine: e.target.value } : d))}
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 1fr) minmax(320px, 1.4fr) minmax(320px, 1.4fr)',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>{JP.beats}</h3>
          {canEdit ? (
            <BeatList
              beats={draft.beats}
              selectedId={selectedBeatId}
              onSelect={setSelectedBeatId}
              onReorder={reorderBeats}
              onAdd={addBeat}
              onDelete={deleteBeat}
            />
          ) : (
            <ul style={{ paddingLeft: 20 }}>
              {draft.beats.map((b) => (
                <li key={b.id}>
                  <button type="button" onClick={() => setSelectedBeatId(b.id)}>
                    {b.id}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <h3 style={{ marginTop: 0 }}>{JP.beatEditor}</h3>
          {selectedBeat && canEdit ? (
            <BeatFormPanel
              beat={selectedBeat}
              onChange={updateBeat}
              stageId={stageId}
              clues={clues}
              token={token}
              onClueCreated={(clue) => setClues((cs) => [...cs, clue])}
            />
          ) : (
            <p className="muted">{canEdit ? JP.pickBeat : JP.opsNoForm}</p>
          )}
        </div>

        <div className="panel">
          <PreviewPane
            beat={selectedBeat}
            clues={clues}
            owned={owned}
            unitTitle={draft.title}
            requestLine={draft.requestLine}
          />
        </div>
      </div>

      {canEdit && (
        <div className="panel">
          {publishErrors && publishErrors.length > 0 && (
            <div className="banner warn">
              <p style={{ marginTop: 0 }}>{JP.publishBlocked}</p>
              <ul style={{ marginBottom: 0 }}>
                {publishErrors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          {message && <div className={`banner ${message.kind === 'ok' ? 'ok' : 'warn'}`}>{message.text}</div>}
          <div className="inline">
            <Button type="button" variant="outline" disabled={saving} onClick={() => void saveDraft()}>
              {JP.saveDraft}
            </Button>
            <Button type="button" disabled={publishing} onClick={() => void publish()}>
              {JP.publishUnit}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
