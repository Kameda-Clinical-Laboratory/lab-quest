import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { getStage, isStageCleared } from '@/mocks/data'
import { isUnitCleared, unitPhaseLabel } from '@/mocks/learning'
import { useAppState } from '@/context/AppState'
import { IconCase, IconFlask, IconProcedure, IconScroll } from '@/components/QuestIcons'

export function StageOverview() {
  const { stageId = '' } = useParams()
  const { currentStudent, maybeClearStage } = useAppState()
  const stage = getStage(stageId)

  useEffect(() => {
    if (!currentStudent || !stage) return
    maybeClearStage(stage.id)
  }, [currentStudent, stage, maybeClearStage])

  if (!currentStudent || !stage) {
    return (
      <div className="learn-panel">
        <p>{'\u30b9\u30c6\u30fc\u30b8\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3002'}</p>
        <Link to="/app">{'\u30de\u30c3\u30d7\u3078'}</Link>
      </div>
    )
  }

  const p = currentStudent.progress
  const cleared = isStageCleared(stage, p) || p.clearedStageIds.includes(stage.id)
  const useUnits = Boolean(stage.units && stage.units.length > 0)

  return (
    <div className="learn-panel">
      <p className="muted" style={{ margin: 0 }}>
        <Link to="/app">{'\u30de\u30c3\u30d7\u3078\u623b\u308b'}</Link>
      </p>
      <h2 style={{ margin: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconFlask className="h-7 w-7" />
        {stage.title}
      </h2>
      <div className="stage-meta">
        <span className={`tag ${stage.required ? 'req' : 'opt'}`}>
          {stage.required ? '\u5fc5\u9808' : '\u4efb\u610f'}
        </span>
        {stage.hasProcedure && <span className="tag">{'\u624b\u6280\u3042\u308a\uff08\u5b9f\u52d9\u524d\u30c1\u30a7\u30c3\u30af\uff09'}</span>}
        {cleared && <span className="tag ok">{'\u30b9\u30c6\u30fc\u30b8\u30af\u30ea\u30a2'}</span>}
      </div>

      {useUnits ? (
        <div className="stack" style={{ marginTop: 24 }}>
          <section>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconScroll className="h-5 w-5" />
              {'\u30e6\u30cb\u30c3\u30c8\uff08\u4f1a\u8a71\u2192\u8b1b\u7fa9\u2192\u8abf\u67fb\u2192\u89e3\u6c7a\u2192\u767a\u5c55\uff09'}
            </h3>
            <div className="stage-list">
              {stage.units!.map((unit, i) => {
                const done = isUnitCleared(unit, p)
                const phases = unit.beats.map((b) => unitPhaseLabel(b)).filter((v, idx, arr) => arr.indexOf(v) === idx)
                return (
                  <Link key={unit.id} className="stage-row" to={`/app/stage/${stage.id}/chapter/${unit.id}`}>
                    <div>
                      <strong>
                        {i + 1}. {unit.title}
                      </strong>
                      <div className="stage-meta">
                        <span className="tag">{unit.requestLine}</span>
                        {done ? (
                          <span className="tag ok">{'\u5b8c\u4e86'}</span>
                        ) : (
                          <span className="tag">{'\u672a\u5b8c\u4e86'}</span>
                        )}
                      </div>
                      <div className="muted" style={{ marginTop: 4, fontSize: 12 }}>
                        {phases.join(' / ')}
                      </div>
                    </div>
                    <span>{done ? '\u518d\u95b2\u89a7' : '\u958b\u59cb'} →</span>
                  </Link>
                )
              })}
            </div>
          </section>
          {stage.hasProcedure && (
            <section>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconProcedure className="h-5 w-5" />
                {'\u624b\u9806\u30b7\u30df\u30e5\uff08\u5b9f\u52d9\u524d\u30c1\u30a7\u30c3\u30af\uff09'}
              </h3>
              <Link className="btn secondary" to={`/app/stage/${stage.id}/procedure`}>
                {'\u624b\u9806\u30c1\u30a7\u30c3\u30af\u3078'}
              </Link>
            </section>
          )}
        </div>
      ) : (
        <LegacyStageBody stageId={stage.id} />
      )}
    </div>
  )
}

function LegacyStageBody({ stageId }: { stageId: string }) {
  const { currentStudent } = useAppState()
  const stage = getStage(stageId)!
  const p = currentStudent!.progress
  const chaptersDone = stage.chapters.filter((c) => p.clearedChapterIds.includes(c.id)).length
  const caseDone = p.clearedCaseStageIds.includes(stage.id)
  const procDone = !stage.hasProcedure || p.clearedProcedureStageIds.includes(stage.id)
  const cleared = isStageCleared(stage, p) || p.clearedStageIds.includes(stage.id)

  return (
    <div className="stack" style={{ marginTop: 24 }}>
      <section>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconScroll className="h-5 w-5" />
          {'\u30c1\u30e3\u30d7\u30bf\u30fc\uff08\u8b1b\u7fa9 \u2192 \u78ba\u8a8d\u554f\u984c\uff09'}
        </h3>
        <div className="stage-list">
          {stage.chapters.map((ch, i) => {
            const done = p.clearedChapterIds.includes(ch.id)
            return (
              <Link key={ch.id} className="stage-row" to={`/app/stage/${stage.id}/chapter/${ch.id}`}>
                <div>
                  <strong>
                    {i + 1}. {ch.title}
                  </strong>
                  <div className="stage-meta">
                    {done ? (
                      <span className="tag ok">
                        {'\u5b8c\u4e86'} +{ch.xp}XP
                      </span>
                    ) : (
                      <span className="tag">{'\u672a\u5b8c\u4e86'}</span>
                    )}
                  </div>
                </div>
                <span>{done ? '\u518d\u95b2\u89a7' : '\u5b66\u7fd2\u3059\u308b'} →</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconCase className="h-5 w-5" />
          {'\u75c7\u4f8b\u30a6\u30a9\u30fc\u30af\u30b9\u30eb\u30fc'}
        </h3>
        <Link
          className="btn"
          to={`/app/stage/${stage.id}/case`}
          style={{ display: 'inline-block', opacity: chaptersDone < stage.chapters.length ? 0.5 : 1 }}
          onClick={(e) => {
            if (chaptersDone < stage.chapters.length) e.preventDefault()
          }}
        >
          {caseDone ? '\u75c7\u4f8b\u3092\u518d\u95b2\u89a7' : '\u75c7\u4f8b\u3092\u59cb\u3081\u308b'}
        </Link>
        {chaptersDone < stage.chapters.length && (
          <p className="muted">{'\u5168\u30c1\u30e3\u30d7\u30bf\u30fc\u5b8c\u4e86\u5f8c\u306b\u958b\u3051\u307e\u3059\u3002'}</p>
        )}
      </section>

      {stage.hasProcedure && (
        <section>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconProcedure className="h-5 w-5" />
            {'\u624b\u9806\u30b7\u30df\u30e5\uff08\u5b9f\u52d9\u524d\u30c1\u30a7\u30c3\u30af\uff09'}
          </h3>
          <Link
            className="btn secondary"
            to={`/app/stage/${stage.id}/procedure`}
            style={{ display: 'inline-block', opacity: !caseDone ? 0.5 : 1 }}
            onClick={(e) => {
              if (!caseDone) e.preventDefault()
            }}
          >
            {procDone ? '\u624b\u9806\u3092\u518d\u95b2\u89a7' : '\u624b\u9806\u30c1\u30a7\u30c3\u30af\u3078'}
          </Link>
          {!caseDone && <p className="muted">{'\u75c7\u4f8b\u30af\u30ea\u30a2\u5f8c\u306b\u5b9f\u65bd\u3057\u307e\u3059\u3002'}</p>}
        </section>
      )}
      {cleared && <p className="muted">{'\u3053\u306e\u30b9\u30c6\u30fc\u30b8\u306f\u30af\u30ea\u30a2\u6e08\u307f\u3067\u3059\u3002'}</p>}
    </div>
  )
}
