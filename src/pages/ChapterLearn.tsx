import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RCPC_STAGE_ID, getStage } from '@/mocks/data'
import { beatDisplayTitle, groupBeatsForDisplay, type Beat } from '@/mocks/learning'
import { useAppState } from '@/context/AppState'
import { BeatView } from '@/components/learn/BeatView'
import { InvestigateHubView } from '@/components/learn/InvestigateHubView'

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
          <p className="muted">{'クエスト'}</p>
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
                    {'シリーズへ戻る'}
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

  const owned = new Set(currentStudent.progress.ownedClueIds)
  const clues = stage.clues ?? []
  const clearedBeatIds = currentStudent.progress.clearedBeatIds

  const groups = groupBeatsForDisplay(unit.beats)
  const activeGroupIndex = groups.findIndex((g) =>
    g.kind === 'single' ? g.rawIndex === beatIndex : g.rawIndexes.includes(beatIndex),
  )
  const activeGroup = groups[activeGroupIndex] ?? groups[0]

  // 幕一覧は最初から全幕を見せず、クリア済み or 現在到達している幕までを順に出す
  // (未到達の幕タイトルが先読みでネタバレしないようにする)。
  const maxClearedGroupIndex = groups.reduce((max, g, gi) => {
    const done =
      g.kind === 'single'
        ? clearedBeatIds.includes(g.beat.id)
        : g.beats.filter((b) => b.required).every((b) => clearedBeatIds.includes(b.id))
    return done ? gi : max
  }, -1)
  const revealedGroupCount = Math.max(activeGroupIndex >= 0 ? activeGroupIndex : 0, maxClearedGroupIndex) + 1
  const visibleGroups = groups.slice(0, revealedGroupCount)

  function goTo(index: number) {
    setBeatIndex(index)
    setUnitCursor(unit!.id, index)
  }

  function goToGroup(groupIndex: number) {
    const g = groups[groupIndex]
    if (!g) return
    goTo(g.kind === 'single' ? g.rawIndex : g.rawIndexes[0])
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

  /** 調査ハブ内の個別調査を1件終えたときの処理。ハブ画面から自動では離れない。 */
  function finishInvestigateItem(b: Beat, clueId?: string) {
    completeBeat({
      beatId: b.id,
      xp: b.xp,
      clueId,
      unitId: unit!.id,
      nextBeatIndex: beatIndex,
      stageId,
    })
    maybeClearStage(stageId)
  }

  return (
    <div className="quest-play-frame">
      <Link to={`/app/stage/${stage.id}`} className="quest-back-btn">
        <span className="quest-back-btn-arrow" aria-hidden>{'←'}</span>
        {stage.title}
        {' へ戻る'}
      </Link>

      <div className={`map-board map-board--stage${stageId === RCPC_STAGE_ID ? ' map-board--rcpc' : ''}`}>
        <div className="map-board-body p-4 sm:p-5">
          <div className="chapter-layout">
            <aside className="quest-side">
              <p className="quest-side-title">{unit.title}</p>
              {visibleGroups.map((g, gi) => {
                if (g.kind === 'single') {
                  const b = g.beat
                  const done = clearedBeatIds.includes(b.id)
                  const lockedResolve =
                    b.type === 'resolve' && b.requiredClueIds.some((id) => !owned.has(id))
                  return (
                    <button
                      key={b.id}
                      type="button"
                      className={gi === activeGroupIndex ? 'active' : ''}
                      onClick={() => goToGroup(gi)}
                    >
                      <span>
                        第{gi + 1}幕 {beatDisplayTitle(b)}
                        {lockedResolve && !done ? ` · ${'ロック'}` : ''}
                      </span>
                      <span>{done ? '✓' : ''}</span>
                    </button>
                  )
                }
                const requiredItems = g.beats.filter((b) => b.required)
                const done = requiredItems.every((b) => clearedBeatIds.includes(b.id))
                return (
                  <button
                    key={g.beats[0].id}
                    type="button"
                    className={gi === activeGroupIndex ? 'active' : ''}
                    onClick={() => goToGroup(gi)}
                  >
                    <span>第{gi + 1}幕 調査</span>
                    <span>{done ? '✓' : ''}</span>
                  </button>
                )
              })}
            </aside>

            <div
              className={`quest-content learn-panel beat-bg-${
                activeGroup.kind === 'single' ? activeGroup.beat.type : 'investigate'
              }`}
            >
              <h2 style={{ marginTop: 0 }}>
                第{activeGroupIndex + 1}幕「
                {activeGroup.kind === 'single' ? beatDisplayTitle(activeGroup.beat) : '調査'}」
                <span style={{ opacity: 0.7, fontSize: '0.85em' }}> · {unit.title}</span>
              </h2>
              {activeGroup.kind === 'single' ? (
                <BeatView
                  // 幕が切り替わっても同じ型のコンポーネントが再利用されうる(例: resolveが
                  // 連続する場合)。keyでbeat.idごとに強制的に作り直し、resolve/drillの
                  // 選択状態などが次の幕に持ち越されるのを防ぐ。
                  key={activeGroup.beat.id}
                  beat={activeGroup.beat}
                  owned={owned}
                  clues={clues}
                  already={clearedBeatIds.includes(activeGroup.beat.id)}
                  unitTitle={unit.title}
                  requestLine={unit.requestLine}
                  onComplete={(clueId) => finishBeat(activeGroup.beat, clueId)}
                  onJumpToInvestigate={() => {
                    const missingBeat = unit.beats.find(
                      (b) => b.type === 'investigate' && b.required && !owned.has(b.clueId),
                    )
                    if (missingBeat) goTo(unit.beats.indexOf(missingBeat))
                  }}
                />
              ) : (
                <InvestigateHubView
                  beats={activeGroup.beats}
                  clearedBeatIds={clearedBeatIds}
                  clues={clues}
                  canAdvance={activeGroup.beats
                    .filter((b) => b.required)
                    .every((b) => clearedBeatIds.includes(b.id))}
                  onCompleteItem={(b, clueId) => finishInvestigateItem(b, clueId)}
                  onAdvance={() => goToGroup(activeGroupIndex + 1)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
