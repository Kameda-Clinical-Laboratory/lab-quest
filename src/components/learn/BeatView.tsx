import { useState } from 'react'
import { answersMatch, type Beat } from '@/mocks/learning'

// src/pages/ChapterLearn.tsx から移動(Phase 4)。学生ランタイム(UnitLearn)と
// スタッフ用コンテンツエディタのプレビューペインの両方から使う共有コンポーネント。
// ロジックは移動時点から一切変更していない。

export function BeatView({
  beat,
  owned,
  clues,
  already,
  onComplete,
  onJumpToInvestigate,
}: {
  beat: Beat
  owned: Set<string>
  clues: { id: string; name: string; summary: string }[]
  already: boolean
  onComplete: (clueId?: string) => void
  onJumpToInvestigate: () => void
}) {
  if (beat.type === 'dialogue') {
    return (
      <div className="stack">
        {beat.lines.map((line, i) => (
          <div key={i} className="dialogue-line">
            <div className="dialogue-speaker">{line.speaker}</div>
            <div className="dialogue-bubble">{line.text}</div>
          </div>
        ))}
        <button type="button" className="btn" onClick={() => onComplete()}>
          {already ? '次へ（再閲覧）' : '講義へ進む'}
        </button>
      </div>
    )
  }

  if (beat.type === 'lecture') {
    return (
      <div>
        <div className="lecture">{beat.body}</div>
        {beat.bridge && <p className="muted" style={{ marginTop: 12 }}>{beat.bridge}</p>}
        <button type="button" className="btn" style={{ marginTop: 16 }} onClick={() => onComplete()}>
          {already ? '次へ' : '調査へ進む'}
        </button>
      </div>
    )
  }

  if (beat.type === 'investigate') {
    return (
      <InvestigateBeat beat={beat} already={already} onComplete={onComplete} />
    )
  }

  if (beat.type === 'resolve') {
    const missing = beat.requiredClueIds.filter((id) => !owned.has(id))
    if (missing.length > 0) {
      return (
        <div className="lock-panel">
          <p style={{ marginTop: 0 }}>
            症例解決に必要な手がかりが足りません。
          </p>
          <div>
            {missing.map((id) => {
              const c = clues.find((x) => x.id === id)
              return (
                <span key={id} className="clue-chip">
                  {c?.name ?? id}
                </span>
              )
            })}
          </div>
          <button type="button" className="btn" style={{ marginTop: 12 }} onClick={onJumpToInvestigate}>
            調査へ戻る
          </button>
        </div>
      )
    }
    return <ResolveBeat beat={beat} already={already} onComplete={onComplete} />
  }

  if (beat.type === 'drill') {
    return <DrillBeat beat={beat} already={already} onComplete={onComplete} />
  }

  return null
}

function InvestigateBeat({
  beat,
  already,
  onComplete,
}: {
  beat: Extract<Beat, { type: 'investigate' }>
  already: boolean
  onComplete: (clueId?: string) => void
}) {
  const [value, setValue] = useState('')
  const [fails, setFails] = useState(0)
  const [msg, setMsg] = useState<string | null>(null)

  function submit() {
    if (answersMatch(value, beat.acceptedAnswers) || fails >= 5) {
      setMsg('手がかりを入手しました')
      onComplete(beat.clueId)
      return
    }
    const next = fails + 1
    setFails(next)
    if (next >= 5) {
      setMsg(`正解: ${beat.acceptedAnswers[0]} — 手がかりを付与します`)
      onComplete(beat.clueId)
    } else if (next >= 3 && beat.demoHint) {
      setMsg(`ヒント: ${beat.demoHint}`)
    } else {
      setMsg('一致しません。やり直してください')
    }
  }

  return (
    <div className="stack">
      <div className="investigate-card">
        <h4>この症例のために確かめること</h4>
        <p style={{ margin: '0 0 0.5rem' }}>{beat.purpose}</p>
        <p className="muted" style={{ margin: 0 }}>
          {beat.howTo}
        </p>
        {beat.manners && (
          <p className="muted" style={{ marginTop: 8 }}>
            マナー: {beat.manners}
          </p>
        )}
      </div>
      <label className="field">
        {beat.inputPrompt}
        <input value={value} onChange={(e) => setValue(e.target.value)} disabled={already} />
      </label>
      {msg && <div className="feedback">{msg}</div>}
      <div className="inline">
        {!already && (
          <button type="button" className="btn" onClick={submit}>
            回答する
          </button>
        )}
        {!beat.required && !already && (
          <button type="button" className="btn secondary" onClick={() => onComplete()}>
            スキップ（ボーナス放棄）
          </button>
        )}
        {already && (
          <button type="button" className="btn" onClick={() => onComplete(beat.clueId)}>
            次へ
          </button>
        )}
      </div>
      {fails >= 3 && beat.demoHint && !already && (
        <p className="muted">
          ヒント: {beat.demoHint}
        </p>
      )}
    </div>
  )
}

function ResolveBeat({
  beat,
  already,
  onComplete,
}: {
  beat: Extract<Beat, { type: 'resolve' }>
  already: boolean
  onComplete: () => void
}) {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const current = beat.steps[step]

  function submit() {
    if (selected === null) return
    setChecked(true)
    const choice = current.choices[selected]
    if (!choice.correct) return
    if (step < beat.steps.length - 1) {
      setTimeout(() => {
        setStep(step + 1)
        setSelected(null)
        setChecked(false)
      }, 400)
    } else {
      onComplete()
    }
  }

  return (
    <div>
      <p>{current.prompt}</p>
      <div className="choices">
        {current.choices.map((c, i) => (
          <button
            key={c.label}
            type="button"
            className={`choice ${selected === i ? 'selected' : ''} ${
              checked ? (c.correct ? 'correct' : selected === i ? 'wrong' : '') : ''
            }`}
            onClick={() => !checked && setSelected(i)}
          >
            {c.label}
          </button>
        ))}
      </div>
      {!checked && (
        <button type="button" className="btn" style={{ marginTop: 12 }} onClick={submit}>
          回答する
        </button>
      )}
      {checked && selected !== null && (
        <div className="feedback">
          {current.choices[selected].feedback}
          {!current.choices[selected].correct && (
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  setChecked(false)
                  setSelected(null)
                }}
              >
                やり直す
              </button>
            </div>
          )}
          {current.choices[selected].correct && step >= beat.steps.length - 1 && already && (
            <p style={{ marginTop: 8 }}>解決済み（再閲覧）</p>
          )}
        </div>
      )}
    </div>
  )
}

function DrillBeat({
  beat,
  already,
  onComplete,
}: {
  beat: Extract<Beat, { type: 'drill' }>
  already: boolean
  onComplete: () => void
}) {
  const [qi, setQi] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const q = beat.questions[qi]

  function submit() {
    if (selected === null) return
    setChecked(true)
    if (selected !== q.correctIndex) return
    if (qi < beat.questions.length - 1) {
      setTimeout(() => {
        setQi(qi + 1)
        setSelected(null)
        setChecked(false)
      }, 400)
    } else {
      onComplete()
    }
  }

  return (
    <div>
      <p className="muted">
        発展 {qi + 1} / {beat.questions.length}
      </p>
      <p>{q.prompt}</p>
      <div className="choices">
        {q.choices.map((c, i) => (
          <button
            key={c}
            type="button"
            className={`choice ${selected === i ? 'selected' : ''} ${
              checked ? (i === q.correctIndex ? 'correct' : selected === i ? 'wrong' : '') : ''
            }`}
            onClick={() => !checked && setSelected(i)}
          >
            {c}
          </button>
        ))}
      </div>
      {!checked && (
        <button type="button" className="btn" style={{ marginTop: 12 }} onClick={submit}>
          回答する
        </button>
      )}
      {checked && (
        <div className="feedback">
          {selected === q.correctIndex ? '正解' : '不正解'} — {q.explanation}
          {selected !== q.correctIndex && (
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  setChecked(false)
                  setSelected(null)
                }}
              >
                やり直す
              </button>
            </div>
          )}
          {selected === q.correctIndex && qi >= beat.questions.length - 1 && already && (
            <p style={{ marginTop: 8 }}>発展完了（再閲覧）</p>
          )}
        </div>
      )}
    </div>
  )
}
