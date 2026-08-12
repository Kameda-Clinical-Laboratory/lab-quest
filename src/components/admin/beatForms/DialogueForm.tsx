import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { Beat } from '@/mocks/learning'
import { DIALOGUE_BACKGROUNDS } from '@/lib/dialogueBackgrounds'
import { JP } from '@/pages/Admin/strings'

type DialogueBeat = Extract<Beat, { type: 'dialogue' }>

export function DialogueForm({
  beat,
  onChange,
}: {
  beat: DialogueBeat
  onChange: (next: DialogueBeat) => void
}) {
  function setLine(i: number, patch: Partial<{ speaker: string; text: string }>) {
    onChange({ ...beat, lines: beat.lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) })
  }
  function addLine() {
    onChange({ ...beat, lines: [...beat.lines, { speaker: '', text: '' }] })
  }
  function removeLine(i: number) {
    onChange({ ...beat, lines: beat.lines.filter((_, idx) => idx !== i) })
  }

  const selectedBackgroundId = beat.backgroundId ?? DIALOGUE_BACKGROUNDS[0].id

  return (
    <div className="stack">
      <div className="field">
        <Label>{JP.dialogueBackground}</Label>
        <div className="bg-picker">
          {DIALOGUE_BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              type="button"
              className={`bg-picker-item${bg.id === selectedBackgroundId ? ' selected' : ''}`}
              onClick={() => onChange({ ...beat, backgroundId: bg.id })}
            >
              <img src={bg.src} alt={bg.label} />
              <span>{bg.label}</span>
            </button>
          ))}
        </div>
      </div>
      <Label>{JP.dialogueLines}</Label>
      {beat.lines.map((line, i) => (
        <div key={i} className="inline" style={{ alignItems: 'flex-start' }}>
          <div className="field" style={{ width: 140 }}>
            <Label>{JP.speaker}</Label>
            <Input value={line.speaker} onChange={(e) => setLine(i, { speaker: e.target.value })} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <Label>{JP.text}</Label>
            <Input value={line.text} onChange={(e) => setLine(i, { text: e.target.value })} />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => removeLine(i)}>
            {JP.removeLine}
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addLine}>
        {JP.addLine}
      </Button>
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
