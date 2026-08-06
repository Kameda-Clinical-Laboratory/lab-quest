import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getStage } from '@/mocks/data'
import { useAppState } from '@/context/AppState'

export function CaseWalkthrough() {
  const { stageId = '' } = useParams()
  const { currentStudent, completeCase } = useAppState()
  const stage = getStage(stageId)
  const [stepIndex, setStepIndex] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [canAdvance, setCanAdvance] = useState(false)
  const [finished, setFinished] = useState(false)

  if (!currentStudent || !stage) {
    return (
      <div className="learn-panel">
        <Link to="/app">マップへ</Link>
      </div>
    )
  }

  const step = stage.caseSteps[stepIndex]
  const done = currentStudent.progress.clearedCaseStageIds.includes(stage.id)

  function pick(correct: boolean, fb: string) {
    setFeedback(fb)
    setCanAdvance(true)
    void correct
  }

  function next() {
    if (stepIndex < stage!.caseSteps.length - 1) {
      setStepIndex((i) => i + 1)
      setFeedback(null)
      setCanAdvance(false)
    } else {
      if (!done) completeCase(stage!.id)
      setFeedback('症例完了。手技ありなら手順チェックへ。')
      setFinished(true)
    }
  }

  return (
    <div className="learn-panel">
      <p className="muted" style={{ marginTop: 0 }}>
        <Link to={`/app/stage/${stage.id}`}>{stage.title} へ戻る</Link>
      </p>
      <h2 style={{ marginTop: 0 }}>症例ウォークスルー</h2>
      <p className="muted">
        ステップ {Math.min(stepIndex + 1, stage.caseSteps.length)} / {stage.caseSteps.length}
      </p>

      {!finished && step && (
        <>
          <p style={{ fontSize: '1.1rem' }}>{step.prompt}</p>
          <div className="choices">
            {step.choices.map((c) => (
              <button key={c.label} type="button" className="choice" onClick={() => pick(c.correct, c.feedback)}>
                {c.label}
              </button>
            ))}
          </div>
        </>
      )}

      {feedback && <div className="feedback">{feedback}</div>}

      {canAdvance && !finished && (
        <button type="button" className="btn" style={{ marginTop: 16 }} onClick={next}>
          {stepIndex < stage.caseSteps.length - 1 ? '次へ' : '症例を完了する'}
        </button>
      )}

      {(finished || done) && (
        <div className="inline" style={{ marginTop: 16 }}>
          {stage.hasProcedure ? (
            <Link className="btn" to={`/app/stage/${stage.id}/procedure`}>
              手順チェックへ
            </Link>
          ) : (
            <Link className="btn" to="/app">
              マップへ戻る
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
