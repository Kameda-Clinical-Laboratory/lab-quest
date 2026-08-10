import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState } from '@/context/AppState'
import { CBT_TARGET } from '@/mocks/schedule'
import { getStage } from '@/mocks/data'
import type { CbtQuestion } from '@/mocks/types'

const DURATION_SEC = 45 * 60

export function FinalCbt() {
  const { currentStudent, startCbt, getActiveCbtQuestions, submitCbt, stages } = useAppState()
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [paper, setPaper] = useState<CbtQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [left, setLeft] = useState(DURATION_SEC)
  const [confirm, setConfirm] = useState(false)

  const questions = paper.length > 0 ? paper : getActiveCbtQuestions()

  useEffect(() => {
    if (!ready) return
    const t = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(t)
  }, [ready])

  useEffect(() => {
    if (ready && left === 0 && currentStudent && !currentStudent.progress.cbtSubmitted) {
      submitCbt(answers)
      navigate('/app/cbt/result')
    }
  }, [left, ready, answers, currentStudent, submitCbt, navigate])

  if (!currentStudent) return null

  if (currentStudent.progress.cbtSubmitted && !currentStudent.progress.cbtRetakeAllowed) {
    return (
      <div className="learn-panel">
        <p>提出済みです。結果画面のみ利用できます。</p>
        <Link className="btn" to="/app/cbt/result">
          結果・解説へ
        </Link>
      </div>
    )
  }

  if (!ready) {
    const cleared = currentStudent.progress.clearedStageIds
    return (
      <div className="learn-panel">
        <p className="muted" style={{ marginTop: 0 }}>
          <Link to="/app">ホームへ</Link>
        </p>
        <div className="inline" style={{ marginBottom: 12 }}>
          <img
            src="/art/quest-boss-seal.png"
            alt=""
            width={72}
            height={72}
            style={{ borderRadius: 999, border: '2px solid #d4a017' }}
          />
          <h2 style={{ margin: 0 }}>最終確認テスト（ボス戦）</h2>
        </div>
        <p>
          クリア済みシリーズ（{cleared.length}）の問題プールから、最大 {CBT_TARGET}{' '}
          問をランダム構成します。合否はありません。
        </p>
        <p className="muted">
          範囲:{' '}
          {cleared.length === 0
            ? 'まだクリア済みシリーズがありません'
            : cleared.map((id) => getStage(stages, id)?.title).join('、')}
        </p>
        <button
          type="button"
          className="btn"
          disabled={cleared.length === 0}
          onClick={() => {
            const qs = startCbt()
            setPaper(qs)
            setReady(true)
            setIndex(0)
            setAnswers({})
            setFlags({})
            setLeft(DURATION_SEC)
          }}
        >
          出題を確定して開始
        </button>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="learn-panel">
        <p>出題を準備できませんでした。</p>
        <Link to="/app">ホーム</Link>
      </div>
    )
  }

  const q = questions[index]
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  const answered = Object.keys(answers).length

  return (
    <div className="learn-panel">
      <div className="inline" style={{ justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0 }}>最終確認テスト（CBT）</h2>
          <p className="muted" style={{ margin: '4px 0 0' }}>
            出題 {questions.length} 問（目標 {CBT_TARGET}）／範囲{' '}
            {currentStudent.progress.cbtScopeStageIds.map((id) => getStage(stages, id)?.title).join('、')}
          </p>
        </div>
        <div className="timer">
          残り {mm}:{ss}
        </div>
      </div>

      <div className="cbt-shell">
        <aside className="cbt-nav">
          <p className="muted">
            回答 {answered} / {questions.length}
          </p>
          {questions.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={`${i === index ? 'current' : ''} ${flags[item.id] ? 'flagged' : ''}`}
              onClick={() => setIndex(i)}
            >
              <span>
                Q{i + 1}
                {answers[item.id] !== undefined ? ' ●' : ''}
              </span>
            </button>
          ))}
          <button type="button" className="btn warn" style={{ marginTop: 12, width: '100%' }} onClick={() => setConfirm(true)}>
            提出する
          </button>
        </aside>

        <div>
          <h3>
            問{index + 1}. {q.prompt}
          </h3>
          <div className="choices">
            {q.choices.map((c, i) => (
              <button
                key={c}
                type="button"
                className={`choice ${answers[q.id] === i ? 'selected' : ''}`}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="inline" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setFlags((f) => ({ ...f, [q.id]: !f[q.id] }))}
            >
              {flags[q.id] ? '旗を外す' : 'あとで見直す（旗）'}
            </button>
            <button type="button" className="btn secondary" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
              前へ
            </button>
            <button
              type="button"
              className="btn secondary"
              disabled={index >= questions.length - 1}
              onClick={() => setIndex((i) => i + 1)}
            >
              次へ
            </button>
          </div>
        </div>
      </div>

      {confirm && (
        <div className="learn-panel" style={{ marginTop: 16, borderColor: '#f0c48a' }}>
          <h3 style={{ marginTop: 0 }}>提出の確認</h3>
          <p>未回答 {questions.length - answered} 問。提出後は原則再受験できません。</p>
          <div className="inline">
            <button
              type="button"
              className="btn warn"
              onClick={() => {
                submitCbt(answers)
                navigate('/app/cbt/result')
              }}
            >
              提出を確定
            </button>
            <button type="button" className="btn ghost" onClick={() => setConfirm(false)}>
              戻る
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function CbtResult() {
  const { currentStudent, getActiveCbtQuestions, stages } = useAppState()
  if (!currentStudent) return null

  const questions = getActiveCbtQuestions()
  const score = currentStudent.progress.cbtScore
  if (score === null || !currentStudent.progress.cbtSubmitted) {
    return (
      <div className="learn-panel">
        <p>まだ提出されていません。</p>
        <Link to="/app/cbt">CBTへ</Link>
      </div>
    )
  }

  return (
    <div className="learn-panel">
      <p className="muted" style={{ marginTop: 0 }}>
        <Link to="/app">ホームへ</Link>
      </p>
      <h2 style={{ marginTop: 0 }}>CBT 結果（素点）</h2>
      <p style={{ fontSize: '1.3rem' }}>
        {score} / {questions.length} 点
      </p>
      <p className="muted">
        受験範囲: {currentStudent.progress.cbtScopeStageIds.map((id) => getStage(stages, id)?.title).join('、')}
      </p>
      <p className="muted">合否判定はありません。指導者が評価表の理解度に換算します。</p>

      <table className="data">
        <thead>
          <tr>
            <th>#</th>
            <th>問題</th>
            <th>正誤</th>
            <th>解説</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, i) => {
            const ans = currentStudent.progress.cbtAnswers[q.id]
            const ok = ans === q.correctIndex
            return (
              <tr key={q.id}>
                <td>{i + 1}</td>
                <td>{q.prompt}</td>
                <td>{ok ? '正' : '誤'}</td>
                <td>
                  {q.explanation}
                  {!ok && ans !== undefined && (
                    <div className="muted">あなたの回答: {q.choices[ans]}</div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
