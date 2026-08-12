import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { LearningUnit } from '@/mocks/learning'
import { backendMode } from '@/lib/backendMode'
import { loadStaffSession } from '@/lib/session'
import { useAdminCurriculum } from '@/lib/useAdminCurriculum'
import { createUnitApi, reorderUnitsApi } from '@/lib/contentAdminApi'
import { useAppState } from '@/context/AppState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { JP } from '../strings'

function SortableUnitRow({ unit, stageId, canEdit }: { unit: LearningUnit; stageId: string; canEdit: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: unit.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className="stage-row">
      {canEdit && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="btn ghost"
          style={{ cursor: 'grab', padding: '4px 8px' }}
        >
          <GripVertical size={16} />
        </button>
      )}
      <div style={{ flex: 1 }}>
        <strong>{unit.title}</strong>
        <div className="stage-meta">
          <span className={`tag ${unit.published ? 'req' : 'opt'}`}>
            {unit.published ? JP.published : JP.unpublished}
          </span>
          <span className="muted">
            {unit.beats.length} {JP.beats}
          </span>
        </div>
      </div>
      <Link className="btn secondary" to={`/staff/content/${stageId}/unit/${unit.id}`}>
        {JP.openEditor}
      </Link>
    </div>
  )
}

export function UnitListPage() {
  const { stageId = '' } = useParams()
  const { staffRole } = useAppState()
  const canEdit = staffRole === 'full'
  const queryClient = useQueryClient()

  const session = loadStaffSession()
  const token = session?.token ?? null

  const { data: curriculum, isLoading } = useAdminCurriculum()
  const stage = curriculum?.find((s) => s.id === stageId)

  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  if (backendMode !== 'supabase') return <p className="banner warn">{JP.supabaseOnly}</p>
  if (!token) return <p className="banner warn">{JP.loginAgain}</p>
  if (isLoading) return <p className="muted">{JP.loading}</p>
  if (!stage) {
    return (
      <div className="panel">
        <p className="muted">{JP.units}が見つかりません。</p>
        <Link className="btn" to="/staff/content">
          {JP.backToStages}
        </Link>
      </div>
    )
  }

  const units = stage.units ?? []

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id || !token) return
    const oldIndex = units.findIndex((u) => u.id === active.id)
    const newIndex = units.findIndex((u) => u.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = arrayMove(units, oldIndex, newIndex)

    queryClient.setQueryData(['curriculum', 'admin'], (prev: typeof curriculum) =>
      prev?.map((s) => (s.id === stageId ? { ...s, units: reordered } : s)),
    )
    try {
      await reorderUnitsApi(token, { stageId, orderedIds: reordered.map((u) => u.id) })
    } catch (err) {
      setError(err instanceof Error ? err.message : '並べ替えに失敗しました')
    } finally {
      queryClient.invalidateQueries({ queryKey: ['curriculum', 'admin'] })
    }
  }

  async function submitCreate() {
    if (!newTitle.trim() || !token) return
    setError(null)
    try {
      await createUnitApi(token, { stageId, title: newTitle.trim(), requestLine: '' })
      queryClient.invalidateQueries({ queryKey: ['curriculum', 'admin'] })
      setNewTitle('')
      setCreating(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '作成に失敗しました')
    }
  }

  return (
    <div className="panel">
      <div className="inline" style={{ justifyContent: 'space-between' }}>
        <div>
          <Link to="/staff/content">{JP.backToStages}</Link>
          <h2 style={{ marginTop: 4 }}>{stage.title}</h2>
        </div>
        {canEdit && !creating && (
          <Button type="button" onClick={() => setCreating(true)}>
            {JP.newUnit}
          </Button>
        )}
      </div>

      {!canEdit && <div className="banner warn">{JP.opsViewOnly}</div>}
      {error && <div className="banner warn">{error}</div>}

      {creating && (
        <div className="inline" style={{ marginBottom: 12 }}>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={JP.newUnitTitlePlaceholder}
            autoFocus
          />
          <Button type="button" onClick={() => void submitCreate()} disabled={!newTitle.trim()}>
            {JP.create}
          </Button>
          <Button type="button" variant="outline" onClick={() => setCreating(false)}>
            {JP.cancel}
          </Button>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => void handleDragEnd(e)}>
        <SortableContext items={units.map((u) => u.id)} strategy={verticalListSortingStrategy}>
          <div className="stage-list">
            {units.map((u) => (
              <SortableUnitRow key={u.id} unit={u} stageId={stageId} canEdit={canEdit} />
            ))}
            {units.length === 0 && <p className="muted">{JP.units}なし</p>}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
