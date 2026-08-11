// src/pages/Admin.tsx から移動(Phase 4)。ロジック変更なし。
import { getStage } from '@/mocks/data'
import { formatDateJa, getTodayQueue } from '@/mocks/schedule'
import { useAppState } from '@/context/AppState'
import { JP } from './strings'

export function ProgressDashboard() {
  const { students, stages, mockToday } = useAppState()

  return (
    <div className="panel">
      <h2 style={{ marginTop: 0 }}>{JP.progressTitle}</h2>
      <p className="muted">{JP.progressDesc.replace('{date}', formatDateJa(mockToday))}</p>
      <table className="data">
        <thead>
          <tr>
            <th>{JP.name}</th>
            <th>{JP.visitDays}</th>
            <th>{JP.requiredClear}</th>
            <th>{JP.requiredRemain}</th>
            <th>{JP.todayQueue}</th>
            <th>{JP.carryover}</th>
            <th>{JP.cbtScore}</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => {
            const reqTotal = stages.filter((st) => st.required).length
            const reqDone = s.progress.clearedStageIds.filter((id) => getStage(stages, id)?.required).length
            const q = getTodayQueue(s, mockToday)
            return (
              <tr key={s.id}>
                <td>
                  {s.name}
                  <div className="muted">{s.code}</div>
                </td>
                <td>{s.visitDates.length}</td>
                <td>
                  {reqDone}/{reqTotal}
                </td>
                <td>{reqTotal - reqDone}</td>
                <td>{q.queueIds.map((id) => getStage(stages, id)?.title).join(JP.comma) || JP.dash}</td>
                <td>{q.carryIds.length}</td>
                <td>
                  {s.progress.cbtScore === null
                    ? JP.notTaken
                    : `${s.progress.cbtScore}/${s.progress.cbtDrawnIds.length || '?'}`}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
