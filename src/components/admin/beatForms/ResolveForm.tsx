import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { Beat, ClueDef } from '@/mocks/learning'
import type { CaseStep } from '@/mocks/types'
import { CreateClueButton } from '@/components/admin/CreateClueButton'
import { JP } from '@/pages/Admin/strings'

type ResolveBeat = Extract<Beat, { type: 'resolve' }>

function emptyStep(): CaseStep {
  return {
    id: `s${crypto.randomUUID().slice(0, 8)}`,
    prompt: '',
    choices: [{ label: '', correct: true, feedback: '' }],
  }
}

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

  function setStep(i: number, patch: Partial<CaseStep>) {
    onChange({ ...beat, steps: beat.steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) })
  }
  function addStep() {
    onChange({ ...beat, steps: [...beat.steps, emptyStep()] })
  }
  function removeStep(i: number) {
    onChange({ ...beat, steps: beat.steps.filter((_, idx) => idx !== i) })
  }

  function setChoice(
    stepIdx: number,
    choiceIdx: number,
    patch: Partial<CaseStep['choices'][number]>,
  ) {
    const step = beat.steps[stepIdx]
    const choices = step.choices.map((c, idx) => (idx === choiceIdx ? { ...c, ...patch } : c))
    setStep(stepIdx, { choices })
  }
  function addChoice(stepIdx: number) {
    const step = beat.steps[stepIdx]
    setStep(stepIdx, { choices: [...step.choices, { label: '', correct: false, feedback: '' }] })
  }
  function removeChoice(stepIdx: number, choiceIdx: number) {
    const step = beat.steps[stepIdx]
    setStep(stepIdx, { choices: step.choices.filter((_, idx) => idx !== choiceIdx) })
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
      </div>

      <Label>{JP.resolveSteps}</Label>
      {beat.steps.map((step, si) => (
        <div key={step.id} className="panel" style={{ padding: 12 }}>
          <div className="field">
            <Label>{JP.resolveStepPrompt}</Label>
            <Input value={step.prompt} onChange={(e) => setStep(si, { prompt: e.target.value })} />
          </div>
          <Label>{JP.resolveChoices}</Label>
          {step.choices.map((c, ci) => (
            <div key={ci} className="inline" style={{ alignItems: 'flex-start', marginBottom: 6 }}>
              <div className="field" style={{ width: 140 }}>
                <Label>{JP.choiceLabel}</Label>
                <Input value={c.label} onChange={(e) => setChoice(si, ci, { label: e.target.value })} />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <Label>{JP.choiceFeedback}</Label>
                <Input
                  value={c.feedback}
                  onChange={(e) => setChoice(si, ci, { feedback: e.target.value })}
                />
              </div>
              <label className="inline" style={{ gap: 4, marginTop: 22 }}>
                <input
                  type="checkbox"
                  checked={c.correct}
                  onChange={(e) => setChoice(si, ci, { correct: e.target.checked })}
                />
                {JP.choiceCorrect}
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                style={{ marginTop: 20 }}
                onClick={() => removeChoice(si, ci)}
              >
                {JP.removeLine}
              </Button>
            </div>
          ))}
          <div className="inline">
            <Button type="button" variant="outline" size="sm" onClick={() => addChoice(si)}>
              {JP.resolveAddChoice}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => removeStep(si)}>
              {JP.deleteBeat}
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addStep}>
        {JP.resolveAddStep}
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
