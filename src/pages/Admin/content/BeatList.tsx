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
import { GripVertical, Trash2 } from 'lucide-react'
import type { Beat } from '@/mocks/learning'
import { beatDisplayTitle } from '@/mocks/learning'
import { Button } from '@/components/ui/button'
import { BEAT_TYPES, beatTypeLabel, defaultBeat } from '@/components/admin/beatDefaults'
import { JP } from '../strings'

function SortableRow({
  beat,
  active,
  onSelect,
  onDelete,
}: {
  beat: Beat
  active: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: beat.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className={`stage-row${active ? ' recommended' : ''}`}>
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="btn ghost"
        style={{ cursor: 'grab', padding: '4px 8px' }}
      >
        <GripVertical size={16} />
      </button>
      <button
        type="button"
        onClick={onSelect}
        style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        {beatDisplayTitle(beat)}
      </button>
      <button type="button" className="btn ghost" onClick={onDelete} aria-label={JP.deleteBeat}>
        <Trash2 size={16} />
      </button>
    </div>
  )
}

/** ローカルドラフトのbeats配列のみを並べ替える(RPC呼び出しなし、永続化は下書き保存経由)。 */
export function BeatList({
  beats,
  selectedId,
  onSelect,
  onReorder,
  onAdd,
  onDelete,
}: {
  beats: Beat[]
  selectedId: string | null
  onSelect: (id: string) => void
  onReorder: (beats: Beat[]) => void
  onAdd: (beat: Beat) => void
  onDelete: (id: string) => void
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = beats.findIndex((b) => b.id === active.id)
    const newIndex = beats.findIndex((b) => b.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onReorder(arrayMove(beats, oldIndex, newIndex))
  }

  return (
    <div className="stack">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={beats.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="stage-list">
            {beats.map((b) => (
              <SortableRow
                key={b.id}
                beat={b}
                active={b.id === selectedId}
                onSelect={() => onSelect(b.id)}
                onDelete={() => {
                  if (confirm(JP.deleteBeatConfirm)) onDelete(b.id)
                }}
              />
            ))}
            {beats.length === 0 && <p className="muted">{JP.beats}なし</p>}
          </div>
        </SortableContext>
      </DndContext>
      <div className="inline" style={{ flexWrap: 'wrap' }}>
        {BEAT_TYPES.map((t) => (
          <Button key={t} type="button" variant="outline" size="sm" onClick={() => onAdd(defaultBeat(t))}>
            + {beatTypeLabel(t)}
          </Button>
        ))}
      </div>
    </div>
  )
}
