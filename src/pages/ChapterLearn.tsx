import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getStage } from '@/mocks/data'
import { useAppState } from '@/context/AppState'

export function ChapterLearn() {
  const { stageId = '', chapterId = '' } = useParams()
  const { currentStudent, completeChapter, maybeClearStage } = useAppState()
  const stage = getStage(stageId)
  const chapter = stage?.chapters.find((c) => c.id === chapterId)
  const [phase, setPhase] = useState<'lecture' | 'quiz' | 'done'>('lecture')
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)

  const chapterIndex = useMemo(
    () => stage?.chapters.findIndex((c) => c.id === chapterId) ?? -1,
    [stage, chapterId],
  )

  if (!currentStudent || !stage || !chapter) {
    return (
      <div className="learn-panel">
        <Link to="/app">マップへ</Link>
      </div>
    )
  }

  const already = currentStudent.progress.clearedChapterIds.includes(chapter.id)
  const correct = selected === chapter.quiz.correctIndex

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
        <Link to={`/app/stage/${stage.id}`}>{stage.title} へ戻る</Link>
      </p>
      <div className="chapter-layout">
        <aside className="side-nav">
          <p className="muted">チャプター</p>
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
                確認問題へ
              </button>
            </>
          )}

          {(phase === 'quiz' || phase === 'done') && (
            <>
              <h3>確認問題</h3>
              <p>{chapter.quiz.prompt}</p>
              <div className="choices">
                {chapter.quiz.choices.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    className={`choice ${selected === i ? 'selected' : ''} ${
                      checked && i === chapter.quiz.correctIndex ? 'correct' : ''
                    } ${checked && selected === i && i !== chapter.quiz.correctIndex ? 'wrong' : ''}`}
                    onClick={() => {
                      if (phase === 'done') return
                      setSelected(i)
                      setChecked(false)
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {phase === 'quiz' && (
                <button type="button" className="btn" style={{ marginTop: 16 }} disabled={selected === null} onClick={submitQuiz}>
                  回答する
                </button>
              )}
              {checked && !correct && (
                <div className="feedback">
                  不正解です。解説: {chapter.quiz.explanation}
                  <br />
                  もう一度選べます。
                </div>
              )}
              {phase === 'done' && (
                <div className="feedback">
                  正解。{chapter.quiz.explanation}
                  {!already && <> +{chapter.xp} XP / スタンプ</>}
                  <div className="inline" style={{ marginTop: 12 }}>
                    {chapterIndex < stage.chapters.length - 1 ? (
                      <Link
                        className="btn"
                        to={`/app/stage/${stage.id}/chapter/${stage.chapters[chapterIndex + 1].id}`}
                        onClick={() => {
                          setPhase('lecture')
                          setSelected(null)
                          setChecked(false)
                        }}
                      >
                        次のチャプターへ
                      </Link>
                    ) : (
                      <Link className="btn" to={`/app/stage/${stage.id}`}>
                        ステージ概要へ（症例へ進む）
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
