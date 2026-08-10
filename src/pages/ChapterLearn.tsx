import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getStage } from '@/mocks/data'
import { answersMatch, unitPhaseLabel, type Beat } from '@/mocks/learning'
import { useAppState } from '@/context/AppState'

export function ChapterLearn() {
  const { stageId = '', chapterId = '' } = useParams()
  const { stages } = useAppState()
  const stage = getStage(stages, stageId)
  if (stage?.units?.length) {
    return <UnitLearn stageId={stageId} unitId={chapterId} />
  }
  return <LegacyChapterLearn />
}

function LegacyChapterLearn() {
  const { stageId = '', chapterId = '' } = useParams()
  const { currentStudent, completeChapter, maybeClearStage, stages } = useAppState()
  const stage = getStage(stages, stageId)
  const chapter = stage?.chapters.find((c) => c.id === chapterId)
  const [phase, setPhase] = useState<'lecture' | 'quiz' | 'done'>('lecture')
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)

  if (!currentStudent || !stage || !chapter) {
    return (
      <div className="learn-panel">
        <Link to="/app">{'\u30de\u30c3\u30d7\u3078'}</Link>
      </div>
    )
  }

  const already = currentStudent.progress.clearedChapterIds.includes(chapter.id)
  const chapterIndex = stage.chapters.findIndex((c) => c.id === chapterId)

  function submitQuiz() {
    if (selected === null) return
    setChecked(true)
    if (selected === chapter!.quiz.correctIndex) {
      if (!already) completeChapter(chapter!.id, chapter!.xp)
      setPhase('done')
      maybeClearStage(stageId)
    }
  }

  return (
    <div className="learn-panel">
      <p className="muted" style={{ marginTop: 0 }}>
        <Link to={`/app/stage/${stage.id}`}>{stage.title} {'\u3078\u623b\u308b'}</Link>
      </p>
      <div className="chapter-layout">
        <aside className="side-nav">
          <p className="muted">{'\u30c1\u30e3\u30d7\u30bf\u30fc'}</p>
          {stage.chapters.map((ch, i) => (
            <Link key={ch.id} to={`/app/stage/${stage.id}/chapter/${ch.id}`}>
              <button type="button" className={ch.id === chapter.id ? 'active' : ''}>
                {i + 1}. {ch.title}
                {currentStudent.progress.clearedChapterIds.includes(ch.id) ? ' ✓' : ''}
              </button>
            </Link>
          ))}
        </aside>
        <div>
          <h2 style={{ marginTop: 0 }}>
            {chapterIndex + 1}. {chapter.title}
          </h2>
          {phase === 'lecture' && (
            <>
              <div className="lecture">{chapter.lecture}</div>
              <button type="button" className="btn" style={{ marginTop: 20 }} onClick={() => setPhase('quiz')}>
                {'\u78ba\u8a8d\u554f\u984c\u3078'}
              </button>
            </>
          )}
          {(phase === 'quiz' || phase === 'done') && (
            <>
              <h3>{'\u78ba\u8a8d\u554f\u984c'}</h3>
              <p>{chapter.quiz.prompt}</p>
              <div className="choices">
                {chapter.quiz.choices.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    className={`choice ${selected === i ? 'selected' : ''} ${
                      checked ? (i === chapter.quiz.correctIndex ? 'correct' : selected === i ? 'wrong' : '') : ''
                    }`}
                    onClick={() => !checked && setSelected(i)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {!checked && (
                <button type="button" className="btn" style={{ marginTop: 12 }} onClick={submitQuiz}>
                  {'\u56de\u7b54\u3059\u308b'}
                </button>
              )}
              {checked && (
                <div className="feedback">
                  {selected === chapter.quiz.correctIndex ? '\u6b63\u89e3' : '\u4e0d\u6b63\u89e3'} — {chapter.quiz.explanation}
                  {selected !== chapter.quiz.correctIndex && (
                    <div style={{ marginTop: 8 }}>
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => {
                          setChecked(false)
                          setSelected(null)
                        }}
                      >
                        {'\u3084\u308a\u76f4\u3059'}
                      </button>
                    </div>
                  )}
                </div>
              )}
              {phase === 'done' && (
                <p style={{ marginTop: 16 }}>
                  <Link className="btn" to={`/app/stage/${stage.id}`}>
                    {'\u30b9\u30c6\u30fc\u30b8\u3078\u623b\u308b'}
                  </Link>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function UnitLearn({ stageId, unitId }: { stageId: string; unitId: string }) {
  const { currentStudent, completeBeat, setUnitCursor, maybeClearStage, stages } = useAppState()
  const stage = getStage(stages, stageId)
  const unit = stage?.units?.find((u) => u.id === unitId)

  const initialIndex = useMemo(() => {
    if (!unit || !currentStudent) return 0
    const saved = currentStudent.progress.unitCursors[unit.id]
    if (typeof saved === 'number') return Math.min(saved, unit.beats.length - 1)
    const firstOpen = unit.beats.findIndex((b) => !currentStudent.progress.clearedBeatIds.includes(b.id))
    return firstOpen >= 0 ? firstOpen : 0
  }, [unit, currentStudent])

  const [beatIndex, setBeatIndex] = useState(initialIndex)

  useEffect(() => {
    setBeatIndex(initialIndex)
  }, [unitId, initialIndex])

  if (!currentStudent || !stage || !unit) {
    return (
      <div className="map-board">
        <div className="map-board-body space-y-3 p-5">
          <Link to="/app" className="text-amber-200 underline-offset-2 hover:underline">
            {'\u30de\u30c3\u30d7\u3078'}
          </Link>
        </div>
      </div>
    )
  }

  const beat = unit.beats[beatIndex]
  const owned = new Set(currentStudent.progress.ownedClueIds)
  const clues = stage.clues ?? []

  function goTo(index: number) {
    setBeatIndex(index)
    setUnitCursor(unit!.id, index)
  }

  function finishBeat(b: Beat, clueId?: string) {
    const next = Math.min(beatIndex + 1, unit!.beats.length - 1)
    completeBeat({
      beatId: b.id,
      xp: b.xp,
      clueId,
      unitId: unit!.id,
      nextBeatIndex: next,
      stageId,
    })
    maybeClearStage(stageId)
    goTo(next)
  }

  return (
    <div className="space-y-4">
      <Link
        to={`/app/stage/${stage.id}`}
        className="inline-flex items-center gap-1 text-sm text-amber-200/90 hover:text-amber-100"
      >
        {'\u2190 '}
        {stage.title}
        {' \u3078\u623b\u308b'}
      </Link>

      <div className="map-board map-board--stage">
        <div className="map-board-body space-y-4 p-4 sm:p-5">
          <div className="quest-paper-board">
            <div className="quest-scroll">
              <div className="min-w-0 flex-1">
                <div className="quest-scroll-label">{'\u4f9d\u983c\u7968'}</div>
                <div className="quest-scroll-line">{unit.requestLine}</div>
              </div>
              <details className="clue-book">
                <summary>
                  <span className="clue-book-spine" aria-hidden />
                  <span className="clue-book-title">
                    <span className="clue-book-kicker">{'\u30d5\u30a3\u30fc\u30eb\u30c9\u30ce\u30fc\u30c8'}</span>
                    <span className="clue-book-name">
                      {'\u624b\u304c\u304b\u308a\u624b\u5e33'}
                      <em>{owned.size}</em>
                    </span>
                  </span>
                </summary>
                <div className="clue-book-pages">
                  {clues
                    .filter((c) => owned.has(c.id))
                    .map((c) => (
                      <div key={c.id} className="clue-entry" title={c.summary}>
                        <strong>{c.name}</strong>
                        <p>{c.summary}</p>
                      </div>
                    ))}
                  {owned.size === 0 && (
                    <p className="clue-book-empty">{'\u307e\u3060\u9805\u76ee\u304c\u3042\u308a\u307e\u305b\u3093\u3002\u8abf\u67fb\u3067\u8a18\u5165\u3055\u308c\u307e\u3059\u3002'}</p>
                  )}
                </div>
              </details>
            </div>
          </div>

          <div className="quest-phase-rail">
            {unit.beats.map((b, i) => {
              const done = currentStudent.progress.clearedBeatIds.includes(b.id)
              const lockedResolve =
                b.type === 'resolve' && b.requiredClueIds.some((id) => !owned.has(id))
              return (
                <button
                  key={b.id}
                  type="button"
                  className={`quest-phase-pill ${i === beatIndex ? 'active' : ''} ${done ? 'done' : ''} ${
                    lockedResolve && !done ? 'locked' : ''
                  }`}
                  onClick={() => goTo(i)}
                >
                  {i + 1}. {unitPhaseLabel(b)}
                  {done ? ' \u2713' : lockedResolve ? ` (${'\u30ed\u30c3\u30af'})` : ''}
                </button>
              )
            })}
          </div>

          <div className="chapter-layout" style={{ marginTop: 4 }}>
            <aside className="quest-side">
              <p className="quest-side-title">{unit.title}</p>
              {unit.beats.map((b, i) => {
                const done = currentStudent.progress.clearedBeatIds.includes(b.id)
                const lockedResolve =
                  b.type === 'resolve' && b.requiredClueIds.some((id) => !owned.has(id))
                return (
                  <button
                    key={b.id}
                    type="button"
                    className={i === beatIndex ? 'active' : ''}
                    onClick={() => goTo(i)}
                  >
                    <span>
                      {i + 1}. {unitPhaseLabel(b)}
                      {lockedResolve && !done ? ` \u00b7 ${'\u30ed\u30c3\u30af'}` : ''}
                    </span>
                    <span>{done ? '\u2713' : ''}</span>
                  </button>
                )
              })}
            </aside>

            <div className="quest-content learn-panel">
              <h2 style={{ marginTop: 0 }}>
                {beatIndex + 1}. {unitPhaseLabel(beat)}
                <span style={{ opacity: 0.7, fontSize: '0.85em' }}> · {unit.title}</span>
              </h2>
              <BeatView
                beat={beat}
                owned={owned}
                clues={clues}
                already={currentStudent.progress.clearedBeatIds.includes(beat.id)}
                onComplete={(clueId) => finishBeat(beat, clueId)}
                onJumpToInvestigate={() => {
                  const idx = unit.beats.findIndex(
                    (b) => b.type === 'investigate' && b.required && !owned.has(b.clueId),
                  )
                  if (idx >= 0) goTo(idx)
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BeatView({
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
          {already ? '\u6b21\u3078\uff08\u518d\u95b2\u89a7\uff09' : '\u8b1b\u7fa9\u3078\u9032\u3080'}
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
          {already ? '\u6b21\u3078' : '\u8abf\u67fb\u3078\u9032\u3080'}
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
            {'\u75c7\u4f8b\u89e3\u6c7a\u306b\u5fc5\u8981\u306a\u624b\u304c\u304b\u308a\u304c\u8db3\u308a\u307e\u305b\u3093\u3002'}
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
            {'\u8abf\u67fb\u3078\u623b\u308b'}
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
      setMsg('\u624b\u304c\u304b\u308a\u3092\u5165\u624b\u3057\u307e\u3057\u305f')
      onComplete(beat.clueId)
      return
    }
    const next = fails + 1
    setFails(next)
    if (next >= 5) {
      setMsg(`\u6b63\u89e3: ${beat.acceptedAnswers[0]} \u2014 \u624b\u304c\u304b\u308a\u3092\u4ed8\u4e0e\u3057\u307e\u3059`)
      onComplete(beat.clueId)
    } else if (next >= 3 && beat.demoHint) {
      setMsg(`\u30d2\u30f3\u30c8: ${beat.demoHint}`)
    } else {
      setMsg('\u4e00\u81f4\u3057\u307e\u305b\u3093\u3002\u3084\u308a\u76f4\u3057\u3066\u304f\u3060\u3055\u3044')
    }
  }

  return (
    <div className="stack">
      <div className="investigate-card">
        <h4>{'\u3053\u306e\u75c7\u4f8b\u306e\u305f\u3081\u306b\u78ba\u304b\u3081\u308b\u3053\u3068'}</h4>
        <p style={{ margin: '0 0 0.5rem' }}>{beat.purpose}</p>
        <p className="muted" style={{ margin: 0 }}>
          {beat.howTo}
        </p>
        {beat.manners && (
          <p className="muted" style={{ marginTop: 8 }}>
            {'\u30de\u30ca\u30fc'}: {beat.manners}
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
            {'\u56de\u7b54\u3059\u308b'}
          </button>
        )}
        {!beat.required && !already && (
          <button type="button" className="btn secondary" onClick={() => onComplete()}>
            {'\u30b9\u30ad\u30c3\u30d7\uff08\u30dc\u30fc\u30ca\u30b9\u653e\u68c4\uff09'}
          </button>
        )}
        {already && (
          <button type="button" className="btn" onClick={() => onComplete(beat.clueId)}>
            {'\u6b21\u3078'}
          </button>
        )}
      </div>
      {fails >= 3 && beat.demoHint && !already && (
        <p className="muted">
          {'\u30d2\u30f3\u30c8'}: {beat.demoHint}
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
          {'\u56de\u7b54\u3059\u308b'}
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
                {'\u3084\u308a\u76f4\u3059'}
              </button>
            </div>
          )}
          {current.choices[selected].correct && step >= beat.steps.length - 1 && already && (
            <p style={{ marginTop: 8 }}>{'\u89e3\u6c7a\u6e08\u307f\uff08\u518d\u95b2\u89a7\uff09'}</p>
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
        {'\u767a\u5c55'} {qi + 1} / {beat.questions.length}
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
          {'\u56de\u7b54\u3059\u308b'}
        </button>
      )}
      {checked && (
        <div className="feedback">
          {selected === q.correctIndex ? '\u6b63\u89e3' : '\u4e0d\u6b63\u89e3'} — {q.explanation}
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
                {'\u3084\u308a\u76f4\u3059'}
              </button>
            </div>
          )}
          {selected === q.correctIndex && qi >= beat.questions.length - 1 && already && (
            <p style={{ marginTop: 8 }}>{'\u767a\u5c55\u5b8c\u4e86\uff08\u518d\u95b2\u89a7\uff09'}</p>
          )}
        </div>
      )}
    </div>
  )
}
