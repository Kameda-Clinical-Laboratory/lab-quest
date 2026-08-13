import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { RCPC_STAGE_ID, getStage, isStageCleared } from '@/mocks/data'
import { isUnitCleared } from '@/mocks/learning'
import { useAppState } from '@/context/AppState'
import { IconCheck, IconFlask, IconProcedure } from '@/components/QuestIcons'
import { Badge } from '@/components/ui/badge'

export function StageOverview() {
  const { stageId = '' } = useParams()
  const { currentStudent, maybeClearStage, stages } = useAppState()
  const stage = getStage(stages, stageId)

  useEffect(() => {
    if (!currentStudent || !stage) return
    maybeClearStage(stage.id)
  }, [currentStudent, stage, maybeClearStage])

  if (!currentStudent || !stage) {
    return (
      <div className="map-board">
        <div className="map-board-body space-y-3 p-5">
          <p className="text-emerald-50">{'\u30b7\u30ea\u30fc\u30ba\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3002'}</p>
          <Link to="/app" className="text-amber-200 underline-offset-2 hover:underline">
            {'\u30de\u30c3\u30d7\u3078'}
          </Link>
        </div>
      </div>
    )
  }

  const p = currentStudent.progress
  const cleared = isStageCleared(stage, p) || p.clearedStageIds.includes(stage.id)
  const useUnits = Boolean(stage.units && stage.units.length > 0)

  return (
    <div className="space-y-4">
      <Link to="/app" className="quest-back-btn">
        <span className="quest-back-btn-arrow" aria-hidden>{'\u2190'}</span>
        {'\u30de\u30c3\u30d7\u3078\u623b\u308b'}
      </Link>

      <div className={`map-board map-board--stage${stage.id === RCPC_STAGE_ID ? ' map-board--rcpc' : ''}`}>
        <div className="map-board-body p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-display text-2xl text-emerald-50">
                <IconFlask className="h-7 w-7" />
                {stage.title}
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant={stage.required ? 'quest' : 'outline'} className="text-amber-100">
                  {stage.required ? '\u5fc5\u9808' : '\u4efb\u610f'}
                </Badge>
                {stage.hasProcedure && (
                  <Badge variant="secondary">{'\u624b\u6280\u30c1\u30a7\u30c3\u30af'}</Badge>
                )}
                {cleared && (
                  <Badge variant="ok" className="text-emerald-100">
                    {'\u30b7\u30ea\u30fc\u30ba\u30af\u30ea\u30a2'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {useUnits ? (
            <div className="space-y-3">
              {stage.units!.map((unit, i) => {
                const done = isUnitCleared(unit, p)
                return (
                  <Link
                    key={unit.id}
                    to={`/app/stage/${stage.id}/chapter/${unit.id}`}
                    className={`map-node ${done ? 'done' : ''}`}
                  >
                    <div className={`map-node-badge ${done ? 'done' : ''}`}>
                      {done ? <IconCheck className="h-6 w-6" /> : i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-lg font-medium text-emerald-50">{unit.title}</div>
                      <div className="mt-1">
                        <Badge variant={done ? 'ok' : 'outline'} className={done ? 'text-emerald-100' : ''}>
                          {done ? '\u30af\u30ea\u30a2' : '\u672a\u7740\u624b'}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                )
              })}

              {stage.hasProcedure && (
                <Link to={`/app/stage/${stage.id}/procedure`} className="map-node">
                  <div className="map-node-badge">
                    <IconProcedure className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-lg font-medium text-emerald-50">
                      {'\u624b\u9806\u30c1\u30a7\u30c3\u30af'}
                    </div>
                    <div className="mt-1">
                      <Badge variant="secondary">{'\u5b9f\u52d9\u524d'}</Badge>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ) : (
            <LegacyStageBody stageId={stage.id} />
          )}
        </div>
      </div>
    </div>
  )
}

function LegacyStageBody({ stageId }: { stageId: string }) {
  const { currentStudent, stages } = useAppState()
  const stage = getStage(stages, stageId)!
  const p = currentStudent!.progress
  const chaptersDone = stage.chapters.filter((c) => p.clearedChapterIds.includes(c.id)).length
  const caseDone = p.clearedCaseStageIds.includes(stage.id)
  const procDone = !stage.hasProcedure || p.clearedProcedureStageIds.includes(stage.id)
  const caseLocked = chaptersDone < stage.chapters.length
  const procLocked = !caseDone

  return (
    <div className="space-y-3">
      {stage.chapters.map((ch, i) => {
        const done = p.clearedChapterIds.includes(ch.id)
        return (
          <Link
            key={ch.id}
            to={`/app/stage/${stage.id}/chapter/${ch.id}`}
            className={`map-node ${done ? 'done' : ''}`}
          >
            <div className={`map-node-badge ${done ? 'done' : ''}`}>
              {done ? <IconCheck className="h-6 w-6" /> : i + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-lg font-medium text-emerald-50">{ch.title}</div>
              <div className="mt-1">
                <Badge variant={done ? 'ok' : 'outline'} className={done ? 'text-emerald-100' : ''}>
                  {done ? `\u5b8c\u4e86 +${ch.xp}XP` : '\u672a\u7740\u624b'}
                </Badge>
              </div>
            </div>
          </Link>
        )
      })}

      <Link
        to={`/app/stage/${stage.id}/case`}
        className={`map-node ${caseDone ? 'done' : ''} ${caseLocked ? 'opacity-55' : ''}`}
        onClick={(e) => {
          if (caseLocked) e.preventDefault()
        }}
        aria-disabled={caseLocked}
      >
        <div className={`map-node-badge ${caseDone ? 'done' : ''}`}>
          {caseDone ? <IconCheck className="h-6 w-6" /> : stage.chapters.length + 1}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-lg font-medium text-emerald-50">{'\u75c7\u4f8b'}</div>
          <div className="mt-1">
            <Badge variant={caseDone ? 'ok' : caseLocked ? 'locked' : 'outline'} className={caseDone ? 'text-emerald-100' : ''}>
              {caseDone ? '\u30af\u30ea\u30a2' : caseLocked ? '\u30c1\u30e3\u30d7\u30bf\u30fc\u5b8c\u4e86\u5f8c' : '\u672a\u7740\u624b'}
            </Badge>
          </div>
        </div>
      </Link>

      {stage.hasProcedure && (
        <Link
          to={`/app/stage/${stage.id}/procedure`}
          className={`map-node ${procDone ? 'done' : ''} ${procLocked ? 'opacity-55' : ''}`}
          onClick={(e) => {
            if (procLocked) e.preventDefault()
          }}
          aria-disabled={procLocked}
        >
          <div className={`map-node-badge ${procDone ? 'done' : ''}`}>
            {procDone ? <IconCheck className="h-6 w-6" /> : <IconProcedure className="h-6 w-6" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-lg font-medium text-emerald-50">{'\u624b\u9806\u30c1\u30a7\u30c3\u30af'}</div>
            <div className="mt-1">
              <Badge
                variant={procDone ? 'ok' : procLocked ? 'locked' : 'secondary'}
                className={procDone ? 'text-emerald-100' : ''}
              >
                {procDone ? '\u30af\u30ea\u30a2' : procLocked ? '\u75c7\u4f8b\u30af\u30ea\u30a2\u5f8c' : '\u5b9f\u52d9\u524d'}
              </Badge>
            </div>
          </div>
        </Link>
      )}
    </div>
  )
}
