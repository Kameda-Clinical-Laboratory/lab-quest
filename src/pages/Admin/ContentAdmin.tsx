// src/pages/Admin.tsx から移動(Phase 4)。旧chapters前提のプレビューパネルは廃止し、
// useAdminCurriculum() ベースのunit数/公開数サマリ + /staff/content/:stageId への
// 導線に置き換えた(書き直し、単純extractionではない)。
//
// 注: シリーズ単位の公開トグル(publishedStageIds/setPublished)は既存どおりモックの
// インメモリ状態のまま(このフェーズはユニット単位の公開実装がスコープで、
// シリーズ単位の実データ化は対象外)。
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '@/context/AppState'
import { backendMode } from '@/lib/backendMode'
import { useAdminCurriculum } from '@/lib/useAdminCurriculum'
import { JP } from './strings'

export function ContentAdmin() {
  const { stages, staffRole, publishedStageIds, setPublished } = useAppState()
  const canEdit = staffRole === 'full'
  const [focusId, setFocusId] = useState(stages[0]?.id ?? '')
  const focusStage = stages.find((s) => s.id === focusId)

  const adminCurriculum = useAdminCurriculum()
  const curriculumStages = adminCurriculum.data ?? []
  const unitsFor = (stageId: string) => curriculumStages.find((s) => s.id === stageId)?.units ?? []

  return (
    <div className="grid-2">
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>{JP.contentTitle}</h2>
        {!canEdit && <div className="banner warn">{JP.opsViewOnly}</div>}
        <table className="data">
          <thead>
            <tr>
              <th>{JP.series}</th>
              <th>{JP.required}</th>
              <th>{JP.unitCount}</th>
              <th>{JP.publish}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {stages.map((s) => {
              const units = unitsFor(s.id)
              const publishedUnits = units.filter((u) => u.published).length
              return (
                <tr key={s.id}>
                  <td>{s.title}</td>
                  <td>{s.required ? JP.required : JP.optional}</td>
                  <td className="muted">
                    {backendMode === 'supabase' ? `${publishedUnits}/${units.length}` : JP.dash}
                  </td>
                  <td>{publishedStageIds.includes(s.id) ? JP.published : JP.unpublished}</td>
                  <td className="row-actions">
                    <button type="button" className="btn ghost" onClick={() => setFocusId(s.id)}>
                      {JP.preview}
                    </button>
                    {canEdit && (
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => setPublished(s.id, !publishedStageIds.includes(s.id))}
                      >
                        {publishedStageIds.includes(s.id) ? JP.unpublish : JP.doPublish}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="panel">
        <h3 style={{ marginTop: 0 }}>
          {JP.previewPrefix}
          {focusStage?.title}
        </h3>
        {focusStage && backendMode === 'supabase' && (
          <>
            <p className="muted">
              {JP.unitCount}: {unitsFor(focusStage.id).length}（{JP.publishedCount}{' '}
              {unitsFor(focusStage.id).filter((u) => u.published).length}）
            </p>
            <ul style={{ paddingLeft: 20 }}>
              {unitsFor(focusStage.id).map((u) => (
                <li key={u.id}>
                  {u.title}
                  {u.published ? ` （${JP.published}）` : ` （${JP.unpublished}）`}
                </li>
              ))}
              {unitsFor(focusStage.id).length === 0 && <li className="muted">{JP.units}なし</li>}
            </ul>
            <Link className="btn" to={`/staff/content/${focusStage.id}`}>
              {JP.openEditor}
            </Link>
          </>
        )}
        {focusStage && backendMode !== 'supabase' && <p className="muted">{JP.supabaseOnly}</p>}
      </div>
    </div>
  )
}
