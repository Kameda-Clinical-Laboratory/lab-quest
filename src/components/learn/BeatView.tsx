import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import { answersMatch, type Beat } from '@/mocks/learning'
import { getDialogueBackground } from '@/lib/dialogueBackgrounds'

// src/pages/ChapterLearn.tsx から移動(Phase 4)。学生ランタイム(UnitLearn)と
// スタッフ用コンテンツエディタのプレビューペインの両方から使う共有コンポーネント。
// ロジックは移動時点から一切変更していない。

/** RichTextEditorが出力するタグだけを許可(RichTextEditor.tsxのPURIFY_CONFIGと揃える)。
 * 学生側の描画でも再度サニタイズし、DBを直接編集された場合等に備える(多重防御)。 */
const LECTURE_BODY_HTML_CONFIG = {
  ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'span', 'br', 'div', 'p'],
  ALLOWED_ATTR: ['style'],
}

/** 講義本文がリッチテキスト(HTML)か、従来どおりのプレーンテキストかを判定する。
 * 旧データ(タグを含まない普通の文章)はこれまでどおりpre-wrapのプレーンテキストとして
 * 表示し、RichTextEditorで一度でも装飾されたものだけHTMLとして描画する。 */
function isRichBody(body: string): boolean {
  return /<[a-z][\s\S]*>/i.test(body)
}

/** 講義の動画URLをiframeで埋め込める形に正規化する(YouTubeの視聴用/短縮URLをembed形式へ)。
 * YouTube以外(Vimeo等)は埋め込み用URLがそのまま渡される前提でそのまま使う。 */
function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return `https://www.youtube.com/embed/${v}`
    }
    return url
  } catch {
    return url
  }
}

export function BeatView({
  beat,
  owned,
  clues,
  already,
  unitTitle,
  requestLine,
  onComplete,
  onJumpToInvestigate,
}: {
  beat: Beat
  owned: Set<string>
  clues: { id: string; name: string; summary: string }[]
  already: boolean
  /** 'problem'ビート用。ユニットのタイトル/依頼文をそのまま依頼票に表示する。 */
  unitTitle?: string
  requestLine?: string
  onComplete: (clueId?: string) => void
  onJumpToInvestigate: () => void
}) {
  if (beat.type === 'dialogue') {
    return <DialogueBeatView beat={beat} already={already} onComplete={onComplete} />
  }

  if (beat.type === 'lecture') {
    return (
      <div className="beat-body">
        {/* 本文+添付をまとめて1つのスクロール領域にする。分量が増えてもここだけで
            上下スクロールになり、下のボタンは常にカード下端に留まる。 */}
        <div className="lecture">
          {isRichBody(beat.body) ? (
            <div
              className="lecture-rich"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(beat.body, LECTURE_BODY_HTML_CONFIG),
              }}
            />
          ) : (
            beat.body
          )}
          {beat.bridge && <p className="muted" style={{ marginTop: 12 }}>{beat.bridge}</p>}
          {beat.pdfUrl && (
            <div className="lecture-pdf">
              <div className="lecture-pdf-bar">
                <span>{'📄 '}{beat.pdfName ?? 'PDF'}</span>
              </div>
              {/* #toolbar=0&navpanes=0&statusbar=0 はChromium系(Chrome/Edge)の内蔵PDF
                  ビューアがサポートするハッシュパラメータで、ダウンロード/印刷/サイドパネル
                  などのツールバーを非表示にする。あくまで見た目上の抑制であり、URL自体は
                  公開されているためF12や直接アクセスでの閲覧/保存までは防げない。 */}
              {/* view=FitHで横幅に合わせて表示する。付けないとブラウザによっては
                  等倍(実寸)ズームのまま表示され、A4等の実ページが小さく浮いて
                  見える(周りが余白/背景色で埋まる)ことがある。 */}
              <iframe
                src={`${beat.pdfUrl}#toolbar=0&navpanes=0&statusbar=0&view=FitH`}
                title={beat.pdfName ?? 'PDF'}
              />
            </div>
          )}
          {beat.videoUrl && (
            <div className="lecture-video">
              <iframe
                src={toEmbedUrl(beat.videoUrl)}
                title="講義動画"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
        <div className="beat-actions" style={{ marginTop: 16 }}>
          <button type="button" className="btn quest" onClick={() => onComplete()}>
            {already ? '次へ' : '調査へ進む'}
          </button>
        </div>
      </div>
    )
  }

  if (beat.type === 'problem') {
    return (
      <ProblemBeatView
        title={unitTitle ?? ''}
        requestLine={requestLine ?? ''}
        already={already}
        onComplete={onComplete}
      />
    )
  }

  if (beat.type === 'investigate') {
    return (
      <InvestigateBeat beat={beat} already={already} onComplete={onComplete} />
    )
  }

  if (beat.type === 'resolve') {
    const missing = beat.requiredClueIds.filter((id) => !owned.has(id))
    if (missing.length > 0) {
      return (
        <div className="lock-panel">
          <p style={{ marginTop: 0 }}>
            症例解決に必要な手がかりが足りません。
          </p>
          <div>
            {missing.map((id) => {
              const c = clues.find((x) => x.id === id)
              return (
                <span key={id} className="clue-chip">
                  {c?.name ?? id}
                </span>
              )
            })}
          </div>
          <div className="beat-actions" style={{ marginTop: 12 }}>
            <button type="button" className="btn quest" onClick={onJumpToInvestigate}>
              調査へ戻る
            </button>
          </div>
        </div>
      )
    }
    return <ResolveBeat beat={beat} onComplete={onComplete} />
  }

  if (beat.type === 'drill') {
    return <DrillBeat beat={beat} already={already} onComplete={onComplete} />
  }

  return null
}

/**
 * 会話ビート。選択された背景画像を全面に敷き、画面下部のテキストボックスを
 * クリック(またはEnter/Space)するたびに1行ずつ進める、ビジュアルノベル風の表示。
 * 最後の行でさらにクリックするとonCompleteを呼ぶ。
 */
function DialogueBeatView({
  beat,
  already,
  onComplete,
}: {
  beat: Extract<Beat, { type: 'dialogue' }>
  already: boolean
  onComplete: (clueId?: string) => void
}) {
  const [lineIndex, setLineIndex] = useState(0)

  // beatが切り替わっても(UnitLearnはBeatViewを再マウントしないため)行の位置をリセットする。
  useEffect(() => {
    setLineIndex(0)
  }, [beat.id])

  const bg = getDialogueBackground(beat.backgroundId)
  const lines = beat.lines
  const hasLines = lines.length > 0
  const isLast = !hasLines || lineIndex >= lines.length - 1
  const current = hasLines ? lines[Math.min(lineIndex, lines.length - 1)] : null

  function advance() {
    if (isLast) {
      onComplete()
      return
    }
    setLineIndex((i) => i + 1)
  }

  return (
    <div className="dialogue-stage" style={{ backgroundImage: `url(${bg.src})` }}>
      <button type="button" className="dialogue-textbox" onClick={advance}>
        {current && <span className="dialogue-textbox-speaker">{current.speaker || '？？？'}</span>}
        <span className="dialogue-textbox-text">
          {current ? current.text : already ? '次へ（再閲覧）' : '講義へ進む'}
        </span>
        {current && (
          <span className="dialogue-textbox-hint">
            {isLast ? (already ? '▶ 次へ（再閲覧）' : '▶ 講義へ進む') : '▼ クリックで続ける'}
          </span>
        )}
      </button>
    </div>
  )
}

/**
 * クエスト発生。羊皮紙の依頼票に unit.title / unit.requestLine をそのまま載せる。
 * 中身は持たない幕なので、コンテンツはUnitLearnからunitTitle/requestLineとして渡す。
 */
function ProblemBeatView({
  title,
  requestLine,
  already,
  onComplete,
}: {
  title: string
  requestLine: string
  already: boolean
  onComplete: (clueId?: string) => void
}) {
  return (
    <div className="quest-ticket-stage">
      <div className="quest-ticket-board">
        <p className="quest-ticket-title">{title}</p>
        <p className="quest-ticket-line">{requestLine}</p>
      </div>
      <div className="quest-ticket-actions">
        <button type="button" className="btn quest" onClick={() => onComplete()}>
          {already ? '次へ（再閲覧）' : '調査を始める'}
        </button>
      </div>
    </div>
  )
}

/** UnitLearnの調査ハブ(InvestigateHubView)からも直接使う個別調査UI。 */
export function InvestigateBeat({
  beat,
  already,
  onComplete,
}: {
  beat: Extract<Beat, { type: 'investigate' }>
  already: boolean
  onComplete: (clueId?: string) => void
}) {
  const [value, setValue] = useState('')
  const [fails, setFails] = useState(0)
  const [msg, setMsg] = useState<string | null>(null)

  function submit() {
    if (answersMatch(value, beat.acceptedAnswers) || fails >= 5) {
      setMsg('手がかりを入手しました')
      onComplete(beat.clueId)
      return
    }
    const next = fails + 1
    setFails(next)
    if (next >= 5) {
      setMsg(`正解: ${beat.acceptedAnswers[0]} — 手がかりを付与します`)
      onComplete(beat.clueId)
    } else if (next >= 3 && beat.demoHint) {
      setMsg(`ヒント: ${beat.demoHint}`)
    } else {
      setMsg('一致しません。やり直してください')
    }
  }

  return (
    <div className="stack">
      <div className="investigate-card">
        <h4>この症例のために確かめること</h4>
        <p style={{ margin: '0 0 0.5rem' }}>{beat.purpose}</p>
        <p className="muted" style={{ margin: 0 }}>
          {beat.howTo}
        </p>
        {beat.manners && (
          <p className="muted" style={{ marginTop: 8 }}>
            マナー: {beat.manners}
          </p>
        )}
      </div>
      <label className="field">
        {beat.inputPrompt}
        <input value={value} onChange={(e) => setValue(e.target.value)} disabled={already} />
      </label>
      {msg && <div className="feedback">{msg}</div>}
      <div className="inline beat-actions">
        {!already && (
          <button type="button" className="btn quest" onClick={submit}>
            回答する
          </button>
        )}
        {!beat.required && !already && (
          <button type="button" className="btn secondary" onClick={() => onComplete()}>
            スキップ（ボーナス放棄）
          </button>
        )}
        {already && (
          <button type="button" className="btn quest" onClick={() => onComplete(beat.clueId)}>
            次へ
          </button>
        )}
      </div>
      {fails >= 3 && beat.demoHint && !already && (
        <p className="muted">
          ヒント: {beat.demoHint}
        </p>
      )}
    </div>
  )
}

/**
 * 症例解決。2026-08から1幕=1問(以前は1幕に複数ステップを内包していた)。
 * 複数問にしたい場合は呼び出し元(ChapterLearn)がresolveビートを複数連続で
 * 並べる。正解した瞬間にonComplete()を呼び、次の幕(次のresolve、または
 * drillなど)へそのまま進む — 旧実装の「最終ステップは即onComplete」と同じ挙動。
 */
function ResolveBeat({
  beat,
  onComplete,
}: {
  beat: Extract<Beat, { type: 'resolve' }>
  onComplete: () => void
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)

  function submit() {
    if (selected === null) return
    setChecked(true)
    if (!beat.choices[selected].correct) return
    onComplete()
  }

  return (
    <div>
      <p>{beat.prompt}</p>
      <div className="choices">
        {beat.choices.map((c, i) => (
          <button
            key={c.label}
            type="button"
            className={`choice ${selected === i ? 'selected' : ''} ${
              checked ? (c.correct ? 'correct' : selected === i ? 'wrong' : '') : ''
            }`}
            onClick={() => !checked && setSelected(i)}
          >
            {c.label}
          </button>
        ))}
      </div>
      {!checked && (
        <div className="beat-actions" style={{ marginTop: 12 }}>
          <button type="button" className="btn quest" onClick={submit}>
            回答する
          </button>
        </div>
      )}
      {checked && selected !== null && (
        <div className="feedback">
          {beat.choices[selected].feedback}
          {!beat.choices[selected].correct && (
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  setChecked(false)
                  setSelected(null)
                }}
              >
                やり直す
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DrillBeat({
  beat,
  already,
  onComplete,
}: {
  beat: Extract<Beat, { type: 'drill' }>
  already: boolean
  onComplete: () => void
}) {
  const [qi, setQi] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const q = beat.questions[qi]

  function submit() {
    if (selected === null) return
    setChecked(true)
    if (selected !== q.correctIndex) return
    if (qi < beat.questions.length - 1) {
      setTimeout(() => {
        setQi(qi + 1)
        setSelected(null)
        setChecked(false)
      }, 400)
    } else {
      onComplete()
    }
  }

  return (
    <div>
      <p className="muted">
        発展 {qi + 1} / {beat.questions.length}
      </p>
      <p>{q.prompt}</p>
      <div className="choices">
        {q.choices.map((c, i) => (
          <button
            key={c}
            type="button"
            className={`choice ${selected === i ? 'selected' : ''} ${
              checked ? (i === q.correctIndex ? 'correct' : selected === i ? 'wrong' : '') : ''
            }`}
            onClick={() => !checked && setSelected(i)}
          >
            {c}
          </button>
        ))}
      </div>
      {!checked && (
        <div className="beat-actions" style={{ marginTop: 12 }}>
          <button type="button" className="btn quest" onClick={submit}>
            回答する
          </button>
        </div>
      )}
      {checked && (
        <div className="feedback">
          {selected === q.correctIndex ? '正解' : '不正解'} — {q.explanation}
          {selected !== q.correctIndex && (
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  setChecked(false)
                  setSelected(null)
                }}
              >
                やり直す
              </button>
            </div>
          )}
          {selected === q.correctIndex && qi >= beat.questions.length - 1 && already && (
            <p style={{ marginTop: 8 }}>発展完了（再閲覧）</p>
          )}
        </div>
      )}
    </div>
  )
}
