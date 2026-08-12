import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getStage } from '@/mocks/data'
import { useAppState } from '@/context/AppState'

export function ProcedureSim() {
  const { stageId = '' } = useParams()
  const { currentStudent, completeProcedure, stages } = useAppState()
  const stage = getStage(stages, stageId)

  const initial = useMemo(() => {
    const steps = [...(stage?.procedureSteps ?? [])]
    for (let i = steps.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[steps[i], steps[j]] = [steps[j], steps[i]]
    }
    return steps
  }, [stage])

  const [order, setOrder] = useState(initial)
  const [message, setMessage] = useState<string | null>(null)

  if (!currentStudent || !stage || !stage.procedureSteps) {
    return (
      <div className="learn-panel">
        <p>このシリーズに手順はありません。</p>
        <Link to="/app">マップへ</Link>
      </div>
    )
  }

  const done = currentStudent.progress.clearedProcedureStageIds.includes(stage.id)

  function move(index: number, dir: -1 | 1) {
    const next = index + dir
    if (next < 0 || next >= order.length) return
    const copy = [...order]
    ;[copy[index], copy[next]] = [copy[next], copy[index]]
    setOrder(copy)
    setMessage(null)
  }

  function check() {
    const ok = order.every((s, i) => s.correctOrder === i + 1)
    if (ok) {
      if (!done) completeProcedure(stage!.id)
      setMessage('正しい順です。実務前チェック完了。午後の現場実習へ進んでください。')
    } else {
      setMessage('順番が違います。並べ替えて再挑戦してください。')
    }
  }

  return (
    <div className="learn-panel">
      <p className="muted" style={{ marginTop: 0 }}>
        <Link to={`/app/stage/${stage.id}`}>{stage.title} へ戻る</Link>
      </p>
      <h2 style={{ marginTop: 0 }}>手順シミュ（実務前チェック）</h2>
      <div className="proc-board">
        <div className="image-placeholder">{stage.procedureImageNote}</div>
        <div>
          <p>正しい順に並べ替えてください。</p>
          <div className="order-list">
            {order.map((s, i) => (
              <div key={s.id} className="order-item">
                <span>
                  {i + 1}. {s.label}
                </span>
                <span className="inline">
                  <button type="button" className="btn ghost" onClick={() => move(i, -1)}>
                    ↑
                  </button>
                  <button type="button" className="btn ghost" onClick={() => move(i, 1)}>
                    ↓
                  </button>
                </span>
              </div>
            ))}
          </div>
          <button type="button" className="btn" style={{ marginTop: 16 }} onClick={check}>
            順番を確認
          </button>
          {message && <div className="feedback">{message}</div>}
          {(done || message?.includes('完了')) && (
            <div className="inline" style={{ marginTop: 12 }}>
              <Link className="btn" to="/app">
                マップへ（シリーズクリア）
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
