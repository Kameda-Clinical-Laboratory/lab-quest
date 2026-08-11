import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Beat } from '@/mocks/learning'
import { JP } from '@/pages/Admin/strings'

type LectureBeat = Extract<Beat, { type: 'lecture' }>

export function LectureForm({
  beat,
  onChange,
}: {
  beat: LectureBeat
  onChange: (next: LectureBeat) => void
}) {
  return (
    <div className="stack">
      <div className="field">
        <Label>{JP.lectureBody}</Label>
        <textarea
          className="rounded-md border border-input bg-white px-3 py-2"
          rows={6}
          value={beat.body}
          onChange={(e) => onChange({ ...beat, body: e.target.value })}
        />
      </div>
      <div className="field">
        <Label>{JP.lectureBridge}</Label>
        <textarea
          className="rounded-md border border-input bg-white px-3 py-2"
          rows={2}
          value={beat.bridge ?? ''}
          onChange={(e) => onChange({ ...beat, bridge: e.target.value || undefined })}
        />
      </div>
      <div className="field" style={{ width: 120 }}>
        <Label>{JP.xp}</Label>
        <Input
          type="number"
          value={beat.xp ?? 0}
          onChange={(e) => onChange({ ...beat, xp: Number(e.target.value) })}
        />
      </div>
    </div>
  )
}
