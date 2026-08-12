import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RCPC_STAGE_ID, getStage } from '@/mocks/data'
import { unitPhaseLabel, type Beat } from '@/mocks/learning'
import { useAppState } from '@/context/AppState'
import { BeatView } from '@/components/learn/BeatView'

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
        <Link to="/app">{'マップへ'}</Link>
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
        <Link to={`/app/stage/${stage.id}`}>{stage.title} {'へ戻る'}</Link>
      </p>
      <div className="chapter-layout">
        <aside className="side-nav">
          <p className="muted">{'チャプター'}</p>
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
                {'確認問題へ'}
              </button>
            </>
          )}
          {(phase === 'quiz' || phase === 'done') && (
            <>
              <h3>{'確認問題'}</h3>
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
                  {'回答する'}
                </button>
              )}
              {checked && (
                <div className="feedback">
                  {selected === chapter.quiz.correctIndex ? '正解' : '不正解'} — {chapter.quiz.explanation}
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
                        {'やり直す'}
                      </button>
                    </div>
                  )}
                </div>
              )}
              {phase === 'done' && (
                <p style={{ marginTop: 16 }}>
                  <Link className="btn" to={`/app/stage/${stage.id}`}>
                    {'ステージへ戻る'}
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
            {'マップへ'}
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
        {'← '}
        {stage.title}
        {' へ戻る'}
      </Link>

      <div className={`map-board map-board--stage${stageId === RCPC_STAGE_ID ? ' map-board--rcpc' : ''}`}>
        <div className="map-board-body space-y-4 p-4 sm:p-5">
          <div className="quest-paper-board">
            <div className="quest-scroll">
              <div className="min-w-0 flex-1">
                <div className="quest-scroll-label">{'依頼票'}</div>
                <div className="quest-scroll-line">{unit.requestLine}</div>
              </div>
              <details className="clue-book">
                <summary>
                  <span className="clue-book-spine" aria-hidden />
                  <span className="clue-book-title">
                    <span className="clue-book-kicker">{'フィールドノート'}</span>
                    <span className="clue-book-name">
                      {'手がかり手帳'}
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
                    <p className="clue-book-empty">{'まだ項目がありません。調査で記入されます。'}</p>
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
                  {done ? ' ✓' : lockedResolve ? ` (${'ロック'})` : ''}
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
                      {lockedResolve && !done ? ` · ${'ロック'}` : ''}
                    </span>
                    <span>{done ? '✓' : ''}</span>
                  </button>
                )
              })}
            </aside>

            <div className={`quest-content learn-panel beat-bg-${beat.type}`}>
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
