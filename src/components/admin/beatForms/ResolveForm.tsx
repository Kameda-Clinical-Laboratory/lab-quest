import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { Beat, ClueDef } from '@/mocks/learning'
import { CreateClueButton } from '@/components/admin/CreateClueButton'
import { JP } from '@/pages/Admin/strings'

type ResolveBeat = Extract<Beat, { type: 'resolve' }>

/**
 * 症例解決フォーム(2026-08、1問1幕化)。以前は1つのresolveビートの中に
 * 複数ステップ(設問)をネストしたリストを持ち、管理が煩雑だった。
 * 「調査」ビートと同じく1幕=1問に揃えたので、複数問にしたいときは
 * この幕を「+解決」で複数個並べる。
 */
export function ResolveForm({
  beat,
  onChange,
  stageId,
  clues,
  token,
  onClueCreated,
}: {
  beat: ResolveBeat
  onChange: (next: ResolveBeat) => void
  stageId: string
  clues: ClueDef[]
  token: string
  onClueCreated: (clue: ClueDef) => void
}) {
  function toggleClue(clueId: string) {
    const has = beat.requiredClueIds.includes(clueId)
    onChange({
      ...beat,
      requiredClueIds: has
        ? beat.requiredClueIds.filter((id) => id !== clueId)
        : [...beat.requiredClueIds, clueId],
    })
  }

  function setChoice(i: number, patch: Partial<ResolveBeat['choices'][number]>) {
    onChange({ ...beat, choices: beat.choices.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) })
  }
  function addChoice() {
    onChange({ ...beat, choices: [...beat.choices, { label: '', correct: false, feedback: '' }] })
  }
  function removeChoice(i: number) {
    onChange({ ...beat, choices: beat.choices.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="stack">
      <div className="field">
        <Label>{JP.resolveRequiredClues}</Label>
        <div className="stack" style={{ gap: 6 }}>
          {clues.map((c) => (
            <label key={c.id} className="inline" style={{ gap: 6 }}>
              <input
                type="checkbox"
                checked={beat.requiredClueIds.includes(c.id)}
                onChange={() => toggleClue(c.id)}
              />
              {c.name}
            </label>
          ))}
          {clues.length === 0 && <p className="muted">{JP.clueNone}</p>}
        </div>
        <CreateClueButton stageId={stageId} token={token} onCreated={onClueCreated} />
        <p className="muted" style={{ marginTop: 4 }}>
          {JP.resolveRequiredCluesHint}
        </p>
      </div>

      <div className="field">
        <Label>{JP.resolveStepPrompt}</Label>
        <Input value={beat.prompt} onChange={(e) => onChange({ ...beat, prompt: e.target.value })} />
      </div>

      <Label>{JP.resolveChoices}</Label>
      {beat.choices.map((c, ci) => (
        <div key={ci} className="inline" style={{ alignItems: 'flex-start', marginBottom: 6 }}>
          <div className="field" style={{ width: 140 }}>
            <Label>{JP.choiceLabel}</Label>
            <Input value={c.label} onChange={(e) => setChoice(ci, { label: e.target.value })} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <Label>{JP.choiceFeedback}</Label>
            <Input value={c.feedback} onChange={(e) => setChoice(ci, { feedback: e.target.value })} />
          </div>
          <label className="inline" style={{ gap: 4, marginTop: 22 }}>
            <input
              type="checkbox"
              checked={c.correct}
              onChange={(e) => setChoice(ci, { correct: e.target.checked })}
            />
            {JP.choiceCorrect}
          </label>
          <Button type="button" variant="outline" size="sm" style={{ marginTop: 20 }} onClick={() => removeChoice(ci)}>
            {JP.removeLine}
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addChoice}>
        {JP.resolveAddChoice}
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
