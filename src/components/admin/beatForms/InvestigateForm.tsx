import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { Beat, ClueDef, InvestigateMode } from '@/mocks/learning'
import { CluePicker } from '@/components/admin/CluePicker'
import { JP } from '@/pages/Admin/strings'

type InvestigateBeat = Extract<Beat, { type: 'investigate' }>

const MODES: { value: InvestigateMode; label: string }[] = [
  { value: 'textbook', label: '教科書' },
  { value: 'doc', label: '書類' },
  { value: 'observe', label: '見学' },
]

export function InvestigateForm({
  beat,
  onChange,
  stageId,
  clues,
  token,
  onClueCreated,
}: {
  beat: InvestigateBeat
  onChange: (next: InvestigateBeat) => void
  stageId: string
  clues: ClueDef[]
  token: string
  onClueCreated: (clue: ClueDef) => void
}) {
  function setAnswer(i: number, value: string) {
    onChange({ ...beat, acceptedAnswers: beat.acceptedAnswers.map((a, idx) => (idx === i ? value : a)) })
  }
  function addAnswer() {
    onChange({ ...beat, acceptedAnswers: [...beat.acceptedAnswers, ''] })
  }
  function removeAnswer(i: number) {
    onChange({ ...beat, acceptedAnswers: beat.acceptedAnswers.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="stack">
      <div className="field">
        <Label>{JP.investigateMode}</Label>
        <select
          className="flex h-10 rounded-md border border-input bg-background/80 px-3 py-2 text-sm shadow-sm"
          value={beat.mode}
          onChange={(e) => onChange({ ...beat, mode: e.target.value as InvestigateMode })}
        >
          {MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <Label>{JP.investigatePurpose}</Label>
        <Input value={beat.purpose} onChange={(e) => onChange({ ...beat, purpose: e.target.value })} />
      </div>
      <div className="field">
        <Label>{JP.investigateHowTo}</Label>
        <Input value={beat.howTo} onChange={(e) => onChange({ ...beat, howTo: e.target.value })} />
      </div>
      <div className="field">
        <Label>{JP.investigateInputPrompt}</Label>
        <Input
          value={beat.inputPrompt}
          onChange={(e) => onChange({ ...beat, inputPrompt: e.target.value })}
        />
      </div>

      <Label>{JP.investigateAcceptedAnswers}</Label>
      {beat.acceptedAnswers.map((a, i) => (
        <div key={i} className="inline">
          <Input value={a} onChange={(e) => setAnswer(i, e.target.value)} />
          <Button type="button" variant="outline" size="sm" onClick={() => removeAnswer(i)}>
            {JP.removeLine}
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addAnswer}>
        {JP.investigateAddAnswer}
      </Button>

      <div className="field">
        <Label>{JP.clue}</Label>
        <CluePicker
          stageId={stageId}
          clues={clues}
          value={beat.clueId || null}
          onChange={(clueId) => onChange({ ...beat, clueId })}
          token={token}
          onClueCreated={onClueCreated}
        />
      </div>

      <label className="inline" style={{ gap: 6 }}>
        <input
          type="checkbox"
          checked={beat.required}
          onChange={(e) => onChange({ ...beat, required: e.target.checked })}
        />
        {JP.investigateRequired}
      </label>

      <div className="field">
        <Label>{JP.investigateManners}</Label>
        <Input value={beat.manners ?? ''} onChange={(e) => onChange({ ...beat, manners: e.target.value || undefined })} />
      </div>
      <div className="field">
        <Label>{JP.investigateDemoHint}</Label>
        <Input
          value={beat.demoHint ?? ''}
          onChange={(e) => onChange({ ...beat, demoHint: e.target.value || undefined })}
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
