import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { isHiraganaOnly, type Beat, type ClueDef, type InvestigateChoice, type InvestigateMode, type PuzzleType } from '@/mocks/learning'
import { CluePicker } from '@/components/admin/CluePicker'
import { JP } from '@/pages/Admin/strings'

type InvestigateBeat = Extract<Beat, { type: 'investigate' }>
type ChoiceInvestigateBeat = Extract<InvestigateBeat, { choices: InvestigateChoice[] }>

const MODES: { value: InvestigateMode; label: string }[] = [
  { value: 'textbook', label: '教科書' },
  { value: 'doc', label: '書類' },
  { value: 'observe', label: '見学' },
]

const PUZZLE_TYPES: { value: PuzzleType; label: string; desc: string }[] = [
  { value: 'board', label: JP.puzzleTypeBoard, desc: JP.puzzleTypeBoardDesc },
  { value: 'cipher', label: JP.puzzleTypeCipher, desc: JP.puzzleTypeCipherDesc },
  { value: 'order', label: JP.puzzleTypeOrder, desc: JP.puzzleTypeOrderDesc },
  { value: 'match', label: JP.puzzleTypeMatch, desc: JP.puzzleTypeMatchDesc },
  { value: 'cloze', label: JP.puzzleTypeCloze, desc: JP.puzzleTypeClozeDesc },
]

/** puzzleTypeを切り替えたときの型別デフォルト値。共通フィールド(mode/purpose/howTo/
 * clueId/required/manners/demoHint/xp等)はスプレッドでそのまま引き継ぐ。 */
function withPuzzleType(beat: InvestigateBeat, next: PuzzleType): InvestigateBeat {
  const common = {
    type: 'investigate' as const,
    id: beat.id,
    title: beat.title,
    mode: beat.mode,
    purpose: beat.purpose,
    howTo: beat.howTo,
    clueId: beat.clueId,
    required: beat.required,
    manners: beat.manners,
    demoHint: beat.demoHint,
    xp: beat.xp,
  }
  const priorChoices = 'choices' in beat ? beat.choices : [{ label: '', correct: true }]
  switch (next) {
    case 'board':
      return { ...common, puzzleType: 'board', choices: priorChoices }
    case 'cipher':
      return {
        ...common,
        puzzleType: 'cipher',
        choices: priorChoices,
        fragmentChar: 'fragmentChar' in beat ? beat.fragmentChar : '',
      }
    case 'order':
      return { ...common, puzzleType: 'order', steps: 'steps' in beat ? beat.steps : ['', ''] }
    case 'match':
      return {
        ...common,
        puzzleType: 'match',
        pairs: 'pairs' in beat ? beat.pairs : [{ left: '', right: '' }],
      }
    case 'cloze':
      return {
        ...common,
        puzzleType: 'cloze',
        text: 'text' in beat ? beat.text : '',
        blanks: 'blanks' in beat ? beat.blanks : [{ answer: '' }],
      }
  }
}

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
  const puzzleType: PuzzleType = beat.puzzleType ?? 'board'

  return (
    <div className="stack">
      <div className="field">
        <Label>{JP.puzzleTypeLabel}</Label>
        <div className="puzzle-type-picker">
          {PUZZLE_TYPES.map((pt) => (
            <button
              key={pt.value}
              type="button"
              className={`puzzle-type-card ${puzzleType === pt.value ? 'selected' : ''}`}
              onClick={() => onChange(withPuzzleType(beat, pt.value))}
            >
              <span className="puzzle-type-card-label">{pt.label}</span>
              <span className="puzzle-type-card-desc">{pt.desc}</span>
            </button>
          ))}
        </div>
      </div>

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

      {(puzzleType === 'board' || puzzleType === 'cipher') && (
        <ChoicesEditor beat={beat as ChoiceInvestigateBeat} onChange={onChange} />
      )}
      {puzzleType === 'cipher' && (
        <div className="field">
          <Label>{JP.fragmentChar}</Label>
          <Input
            value={'fragmentChar' in beat ? beat.fragmentChar : ''}
            maxLength={4}
            style={{ maxWidth: 120 }}
            onChange={(e) => onChange({ ...beat, fragmentChar: e.target.value } as InvestigateBeat)}
          />
          <p className="muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>
            {JP.fragmentCharHint}
          </p>
        </div>
      )}
      {puzzleType === 'order' && 'steps' in beat && (
        <StepsEditor steps={beat.steps} onChange={(steps) => onChange({ ...beat, steps } as InvestigateBeat)} />
      )}
      {puzzleType === 'match' && 'pairs' in beat && (
        <PairsEditor pairs={beat.pairs} onChange={(pairs) => onChange({ ...beat, pairs } as InvestigateBeat)} />
      )}
      {puzzleType === 'cloze' && 'text' in beat && 'blanks' in beat && (
        <ClozeEditor
          text={beat.text}
          blanks={beat.blanks}
          onChange={(patch) => onChange({ ...beat, ...patch } as InvestigateBeat)}
        />
      )}

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

function ChoicesEditor({
  beat,
  onChange,
}: {
  beat: ChoiceInvestigateBeat
  onChange: (next: InvestigateBeat) => void
}) {
  function setChoice(i: number, patch: Partial<InvestigateChoice>) {
    onChange({ ...beat, choices: beat.choices.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) })
  }
  function addChoice() {
    onChange({ ...beat, choices: [...beat.choices, { label: '', correct: false }] })
  }
  function removeChoice(i: number) {
    onChange({ ...beat, choices: beat.choices.filter((_, idx) => idx !== i) })
  }

  return (
    <>
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
    </>
  )
}

function StepsEditor({ steps, onChange }: { steps: string[]; onChange: (steps: string[]) => void }) {
  function setStep(i: number, value: string) {
    onChange(steps.map((s, idx) => (idx === i ? value : s)))
  }
  function addStep() {
    onChange([...steps, ''])
  }
  function removeStep(i: number) {
    onChange(steps.filter((_, idx) => idx !== i))
  }

  return (
    <div className="field">
      <Label>{JP.orderSteps}</Label>
      {steps.map((s, i) => (
        <div key={i} className="inline" style={{ alignItems: 'center' }}>
          <span className="muted" style={{ width: 20 }}>
            {i + 1}.
          </span>
          <Input value={s} onChange={(e) => setStep(i, e.target.value)} style={{ flex: 1 }} />
          <Button type="button" variant="outline" size="sm" onClick={() => removeStep(i)}>
            {JP.removeLine}
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addStep}>
        {JP.orderAddStep}
      </Button>
    </div>
  )
}

type ClozeBlankInput = { answer: string; altAnswers?: string[] }

/** altAnswers(string[])と読点区切りテキストの相互変換。空文字要素は保存しない。 */
function altAnswersToText(alt?: string[]) {
  return (alt ?? []).join('、')
}
function textToAltAnswers(text: string): string[] | undefined {
  const items = text
    .split(/[、,]/)
    .map((s) => s.trim())
    .filter(Boolean)
  return items.length ? items : undefined
}

function ClozeEditor({
  text,
  blanks,
  onChange,
}: {
  text: string
  blanks: ClozeBlankInput[]
  onChange: (patch: { text: string; blanks: ClozeBlankInput[] }) => void
}) {
  function setAnswer(i: number, answer: string) {
    onChange({ text, blanks: blanks.map((b, idx) => (idx === i ? { ...b, answer } : b)) })
  }
  function setAltAnswers(i: number, altText: string) {
    onChange({
      text,
      blanks: blanks.map((b, idx) => (idx === i ? { ...b, altAnswers: textToAltAnswers(altText) } : b)),
    })
  }
  function addBlank() {
    onChange({ text: `${text}{{blank}}`, blanks: [...blanks, { answer: '' }] })
  }
  function removeBlank(i: number) {
    onChange({ text, blanks: blanks.filter((_, idx) => idx !== i) })
  }

  const markerCount = text.split('{{blank}}').length - 1
  const countMismatch = markerCount !== blanks.length

  return (
    <>
      <div className="field">
        <Label>{JP.clozeText}</Label>
        <textarea
          className="rounded-md border border-input bg-white px-3 py-2"
          rows={5}
          value={text}
          onChange={(e) => onChange({ text: e.target.value, blanks })}
        />
        <p className="muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>
          {JP.clozeTextHint}
        </p>
      </div>
      <div className="field">
        <Label>
          {JP.clozeBlanks}
          {countMismatch && (
            <span style={{ color: '#b91c1c', marginLeft: 8 }}>
              (本文中の{'{{blank}}'}は{markerCount}箇所、空欄リストは{blanks.length}件 — 一致させてください)
            </span>
          )}
        </Label>
        {blanks.map((b, i) => {
          const bad = b.answer.trim() !== '' && !isHiraganaOnly(b.answer.trim())
          const altText = altAnswersToText(b.altAnswers)
          const altBad = (b.altAnswers ?? []).some((a) => !isHiraganaOnly(a.trim()))
          return (
            <div key={i} style={{ marginBottom: 8 }}>
              <div className="inline" style={{ alignItems: 'center' }}>
                <span className="muted" style={{ width: 20 }}>
                  {i + 1}.
                </span>
                <Input
                  value={b.answer}
                  placeholder={JP.clozeAnswerPlaceholder}
                  onChange={(e) => setAnswer(i, e.target.value)}
                  style={{ flex: 1, borderColor: bad ? '#ef4444' : undefined }}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => removeBlank(i)}>
                  {JP.removeLine}
                </Button>
                {bad && (
                  <span className="muted" style={{ color: '#b91c1c', fontSize: '0.8rem' }}>
                    {JP.clozeAnswerNotHiraganaWarning}
                  </span>
                )}
              </div>
              <div className="inline" style={{ alignItems: 'center', marginTop: 4 }}>
                <span className="muted" style={{ width: 20 }} />
                <Input
                  value={altText}
                  placeholder={JP.clozeAltAnswersPlaceholder}
                  onChange={(e) => setAltAnswers(i, e.target.value)}
                  style={{ flex: 1, borderColor: altBad ? '#ef4444' : undefined }}
                />
              </div>
              <p className="muted" style={{ fontSize: '0.75rem', margin: '2px 0 0 26px' }}>
                {JP.clozeAltAnswersHint}
              </p>
            </div>
          )
        })}
        <Button type="button" variant="outline" size="sm" onClick={addBlank}>
          {JP.clozeAddBlank}
        </Button>
      </div>
    </>
  )
}

function PairsEditor({
  pairs,
  onChange,
}: {
  pairs: { left: string; right: string }[]
  onChange: (pairs: { left: string; right: string }[]) => void
}) {
  function setPair(i: number, patch: Partial<{ left: string; right: string }>) {
    onChange(pairs.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))
  }
  function addPair() {
    onChange([...pairs, { left: '', right: '' }])
  }
  function removePair(i: number) {
    onChange(pairs.filter((_, idx) => idx !== i))
  }

  return (
    <div className="field">
      <Label>{JP.matchPairs}</Label>
      {pairs.map((p, i) => (
        <div key={i} className="inline" style={{ alignItems: 'center' }}>
          <Input
            value={p.left}
            placeholder={JP.matchPairLeft}
            onChange={(e) => setPair(i, { left: e.target.value })}
            style={{ flex: 1 }}
          />
          <span aria-hidden>↔</span>
          <Input
            value={p.right}
            placeholder={JP.matchPairRight}
            onChange={(e) => setPair(i, { right: e.target.value })}
            style={{ flex: 1 }}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => removePair(i)}>
            {JP.removeLine}
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addPair}>
        {JP.matchAddPair}
      </Button>
    </div>
  )
}
