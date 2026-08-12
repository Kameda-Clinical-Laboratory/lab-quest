// src/pages/Admin.tsx から移動(Phase 4)。ロジック変更なし。
import { useState } from 'react'
import { getStage } from '@/mocks/data'
import { useAppState } from '@/context/AppState'
import { JP } from './strings'

export function CbtResultsAdmin() {
  const { students, cbtQuestionBank, stages } = useAppState()
  const [focusId, setFocusId] = useState<string | null>(null)
  const focus = students.find((s) => s.id === focusId)

  function exportCsv() {
    const lines = [[JP.name, JP.code, JP.score, JP.drawnCount, JP.examScope, JP.perQuestion].join(',')]
    for (const s of students) {
      if (s.progress.cbtScore === null) continue
      const paper = s.progress.cbtDrawnIds
        .map((id) => cbtQuestionBank.find((q) => q.id === id))
        .filter(Boolean)
      const detail = paper
        .map((q) => (q && s.progress.cbtAnswers[q.id] === q.correctIndex ? JP.correct : JP.wrong))
        .join('|')
      lines.push(
        [
          s.name,
          s.code,
          String(s.progress.cbtScore),
          String(paper.length),
          s.progress.cbtScopeStageIds.map((id) => getStage(stages, id)?.title).join('|'),
          detail,
        ].join(','),
      )
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cbt-results-mock.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="panel">
      <div className="inline" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ marginTop: 0 }}>{JP.cbtResults}</h2>
        <button type="button" className="btn secondary" onClick={exportCsv}>
          {JP.exportCsv}
        </button>
      </div>
      <p className="muted">{JP.cbtDesc}</p>
      <table className="data">
        <thead>
          <tr>
            <th>{JP.name}</th>
            <th>{JP.score}</th>
            <th>{JP.scope}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>
                {s.progress.cbtScore === null
                  ? JP.notTaken
                  : `${s.progress.cbtScore} / ${s.progress.cbtDrawnIds.length}`}
              </td>
              <td className="muted">
                {s.progress.cbtScopeStageIds.map((id) => getStage(stages, id)?.title).join(JP.comma) || JP.dash}
              </td>
              <td>
                <button
                  type="button"
                  className="btn ghost"
                  disabled={s.progress.cbtScore === null}
                  onClick={() => setFocusId(s.id)}
                >
                  {JP.perQuestion}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {focus && focus.progress.cbtScore !== null && (
        <div style={{ marginTop: 20 }}>
          <h3>
            {focus.name}
            {JP.perQuestionDetail}
          </h3>
          <table className="data">
            <thead>
              <tr>
                <th>#</th>
                <th>{JP.correctWrong}</th>
                <th>{JP.question}</th>
              </tr>
            </thead>
            <tbody>
              {focus.progress.cbtDrawnIds.map((id, i) => {
                const q = cbtQuestionBank.find((x) => x.id === id)
                if (!q) return null
                return (
                  <tr key={id}>
                    <td>{i + 1}</td>
                    <td>{focus.progress.cbtAnswers[id] === q.correctIndex ? JP.correct : JP.wrong}</td>
                    <td>{q.prompt}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
