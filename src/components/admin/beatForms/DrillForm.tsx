import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { Beat, DrillMcq } from '@/mocks/learning'
import { JP } from '@/pages/Admin/strings'

type DrillBeat = Extract<Beat, { type: 'drill' }>

function emptyQuestion(): DrillMcq {
  return {
    id: `q${crypto.randomUUID().slice(0, 8)}`,
    format: 'mcq',
    prompt: '',
    choices: [
      { label: '', correct: true },
      { label: '', correct: false },
    ],
    explanation: '',
  }
}

export function DrillForm({
  beat,
  onChange,
}: {
  beat: DrillBeat
  onChange: (next: DrillBeat) => void
}) {
  function setQuestion(i: number, patch: Partial<DrillMcq>) {
    onChange({ ...beat, questions: beat.questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)) })
  }
  function addQuestion() {
    onChange({ ...beat, questions: [...beat.questions, emptyQuestion()] })
  }
  function removeQuestion(i: number) {
    onChange({ ...beat, questions: beat.questions.filter((_, idx) => idx !== i) })
  }
  function setChoice(qi: number, ci: number, patch: Partial<DrillMcq['choices'][number]>) {
    const q = beat.questions[qi]
    setQuestion(qi, { choices: q.choices.map((c, idx) => (idx === ci ? { ...c, ...patch } : c)) })
  }
  function addChoice(qi: number) {
    const q = beat.questions[qi]
    setQuestion(qi, { choices: [...q.choices, { label: '', correct: false }] })
  }
  function removeChoice(qi: number, ci: number) {
    const q = beat.questions[qi]
    setQuestion(qi, { choices: q.choices.filter((_, idx) => idx !== ci) })
  }

  return (
    <div className="stack">
      <Label>{JP.drillQuestions}</Label>
      {beat.questions.map((q, qi) => (
        <div key={q.id} className="panel" style={{ padding: 12 }}>
          <div className="field">
            <Label>{JP.resolveStepPrompt}</Label>
            <Input value={q.prompt} onChange={(e) => setQuestion(qi, { prompt: e.target.value })} />
          </div>
          <Label>{JP.resolveChoices}</Label>
          {q.choices.map((c, ci) => (
            <div key={ci} className="inline" style={{ marginBottom: 6 }}>
              <label className="inline" style={{ gap: 4 }}>
                <input
                  type="checkbox"
                  checked={c.correct}
                  onChange={(e) => setChoice(qi, ci, { correct: e.target.checked })}
                />
                {JP.choiceCorrect}
              </label>
              <Input
                value={c.label}
                onChange={(e) => setChoice(qi, ci, { label: e.target.value })}
                style={{ flex: 1 }}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => removeChoice(qi, ci)}>
                {JP.removeLine}
              </Button>
            </div>
          ))}
          <div className="inline">
            <Button type="button" variant="outline" size="sm" onClick={() => addChoice(qi)}>
              {JP.resolveAddChoice}
            </Button>
          </div>
          <div className="field">
            <Label>{JP.choiceFeedback}</Label>
            <Input
              value={q.explanation}
              onChange={(e) => setQuestion(qi, { explanation: e.target.value })}
            />
          </div>
          <div className="field" style={{ width: 120 }}>
            <Label>{JP.xp}</Label>
            <Input
              type="number"
              value={q.xp ?? 0}
              onChange={(e) => setQuestion(qi, { xp: Number(e.target.value) })}
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => removeQuestion(qi)}>
            {JP.deleteBeat}
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
        {JP.drillAddQuestion}
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
