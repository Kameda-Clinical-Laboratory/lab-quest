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
  function setChoice(i: number, patch: Partial<InvestigateBeat['choices'][number]>) {
    onChange({ ...beat, choices: beat.choices.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) })
  }
  function addChoice() {
    onChange({ ...beat, choices: [...beat.choices, { label: '', correct: false }] })
  }
  function removeChoice(i: number) {
    onChange({ ...beat, choices: beat.choices.filter((_, idx) => idx !== i) })
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
      <Label>{JP.investigateChoices}</Label>
      {beat.choices.map((c, i) => (
        <div key={i} className="inline" style={{ alignItems: 'center' }}>
          <Input value={c.label} onChange={(e) => setChoice(i, { label: e.target.value })} style={{ flex: 1 }} />
          <label className="inline" style={{ gap: 4 }}>
            <input
              type="checkbox"
              checked={c.correct}
              onChange={(e) => setChoice(i, { correct: e.target.checked })}
            />
            {JP.choiceCorrect}
          </label>
          <Button type="button" variant="outline" size="sm" onClick={() => removeChoice(i)}>
            {JP.removeLine}
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addChoice}>
        {JP.investigateAddChoice}
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
