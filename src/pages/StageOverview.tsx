import { Link, useParams } from 'react-router-dom'
import { getStage, isStageCleared } from '@/mocks/data'
import { useAppState } from '@/context/AppState'
import { IconCase, IconFlask, IconProcedure, IconScroll } from '@/components/QuestIcons'

export function StageOverview() {
  const { stageId = '' } = useParams()
  const { currentStudent, maybeClearStage } = useAppState()
  const stage = getStage(stageId)
  if (!currentStudent || !stage) {
    return (
      <div className="learn-panel">
        <p>ステージが見つかりません。</p>
        <Link to="/app">マップへ</Link>
      </div>
    )
  }

  const p = currentStudent.progress
  const chaptersDone = stage.chapters.filter((c) => p.clearedChapterIds.includes(c.id)).length
  const caseDone = p.clearedCaseStageIds.includes(stage.id)
  const procDone = !stage.hasProcedure || p.clearedProcedureStageIds.includes(stage.id)
  const cleared = isStageCleared(stage, p) || p.clearedStageIds.includes(stage.id)

  if (chaptersDone === stage.chapters.length && caseDone && procDone) {
    maybeClearStage(stage.id)
  }

  return (
    <div className="learn-panel">
      <p className="muted" style={{ margin: 0 }}>
        <Link to="/app">マップへ戻る</Link>
      </p>
      <h2 style={{ margin: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconFlask className="h-7 w-7" />
        {stage.title}
      </h2>
      <div className="stage-meta">
        <span className={`tag ${stage.required ? 'req' : 'opt'}`}>{stage.required ? '必須' : '任意'}</span>
        {stage.hasProcedure && <span className="tag">手技あり（実務前チェック）</span>}
        {cleared && <span className="tag ok">ステージクリア</span>}
      </div>

      <div className="stack" style={{ marginTop: 24 }}>
        <section>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconScroll className="h-5 w-5" />
            チャプター（講義 → 確認問題）
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
                      {done ? <span className="tag ok">完了 +{ch.xp}XP</span> : <span className="tag">未完了</span>}
                    </div>
                  </div>
                  <span>{done ? '再閲覧' : '学習する'} →</span>
                </Link>
              )
            })}
          </div>
        </section>

        <section>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconCase className="h-5 w-5" />
            症例ウォークスルー
          </h3>
          <Link
            className="btn"
            to={`/app/stage/${stage.id}/case`}
            style={{ display: 'inline-block', opacity: chaptersDone < stage.chapters.length ? 0.5 : 1 }}
            onClick={(e) => {
              if (chaptersDone < stage.chapters.length) e.preventDefault()
            }}
          >
            {caseDone ? '症例を再閲覧' : '症例を始める'}
          </Link>
          {chaptersDone < stage.chapters.length && (
            <p className="muted">全チャプター完了後に開けます。</p>
          )}
        </section>

        {stage.hasProcedure && (
          <section>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconProcedure className="h-5 w-5" />
              手順シミュ（実務前チェック）
            </h3>
            <Link
              className="btn secondary"
              to={`/app/stage/${stage.id}/procedure`}
              style={{ display: 'inline-block', opacity: !caseDone ? 0.5 : 1 }}
              onClick={(e) => {
                if (!caseDone) e.preventDefault()
              }}
            >
              {procDone ? '手順を再閲覧' : '手順チェックへ'}
            </Link>
            {!caseDone && <p className="muted">症例クリア後に実施します。</p>}
          </section>
        )}
      </div>
    </div>
  )
}
