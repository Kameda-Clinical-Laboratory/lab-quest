import { useEffect, useState } from 'react'
import type { Beat, FlagWordConfig } from '@/mocks/learning'
import { InvestigateBeat } from './BeatView'

type InvestigateBeatT = Extract<Beat, { type: 'investigate' }>

/**
 * 調査ハブ。連続するinvestigateビートを1枚のハブ画面にまとめ、虫眼鏡の紋章カードから
 * 選んで調査する形にする(2026-08、幕構成リニューアル)。UnitLearnがunit.beatsから
 * 連続するinvestigateの並びを検出してこのコンポーネントへまとめて渡す。
 *
 * 完了状態(clearedBeatIds)は個々のinvestigateビートidに対して従来どおり記録されるため、
 * 必須/任意の判定やresolveの手がかりロックなど、既存ロジックには一切手を入れていない。
 *
 * 2026-08(第4幕リニューアル §3): unit.flagWordが設定されていて、このハブにcipher型の
 * カードがあれば、「判断へ進む」ボタンを押した直後に文字の欠片を並べ替える画面を挟む。
 */
export function InvestigateHubView({
  beats,
  clearedBeatIds,
  clues,
  canAdvance,
  flagWord,
  onCompleteItem,
  onAdvance,
}: {
  beats: InvestigateBeatT[]
  clearedBeatIds: string[]
  clues: { id: string; name: string; summary: string }[]
  canAdvance: boolean
  flagWord?: FlagWordConfig
  onCompleteItem: (beat: InvestigateBeatT, clueId?: string) => void
  onAdvance: () => void
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [showAssembly, setShowAssembly] = useState(false)

  const openBeat = beats.find((b) => b.id === openId) ?? null

  if (openBeat) {
    const already = clearedBeatIds.includes(openBeat.id)
    return (
      <div className="investigate-hub-detail">
        <button type="button" className="btn ghost" onClick={() => setOpenId(null)}>
          {'← 調査一覧へ戻る'}
        </button>
        <div style={{ marginTop: 12 }}>
          <InvestigateBeat
            beat={openBeat}
            already={already}
            onComplete={(clueId) => {
              onCompleteItem(openBeat, clueId)
              setOpenId(null)
            }}
          />
        </div>
      </div>
    )
  }

  // フラグワード組み立て画面を挟むかどうか: このハブにcipher型カードがあり、かつ
  // その全てが(スキップされずに)クリア済みで欠片が過不足なく揃っている場合のみ。
  // 任意(required: false)のcipherカードがスキップされて欠片が足りない場合、
  // 組み立て不能な行き止まりを作らないよう、その場合は素通りして判断へ進める。
  const cipherBeats = beats.filter(
    (b): b is Extract<InvestigateBeatT, { puzzleType: 'cipher' }> => b.puzzleType === 'cipher',
  )
  const ownedFragments = cipherBeats
    .filter((b) => clearedBeatIds.includes(b.id))
    .map((b) => b.fragmentChar)
  const answerChars = flagWord?.answer ? [...flagWord.answer] : []
  const needsAssembly = cipherBeats.length > 0 && answerChars.length > 0 && ownedFragments.length === answerChars.length

  if (showAssembly) {
    return (
      <FlagWordAssembly
        answer={flagWord!.answer}
        fragments={ownedFragments}
        onSolved={() => {
          setShowAssembly(false)
          onAdvance()
        }}
        onBack={() => setShowAssembly(false)}
      />
    )
  }

  function handleAdvanceClick() {
    if (needsAssembly) {
      setShowAssembly(true)
      return
    }
    onAdvance()
  }

  const requiredCount = beats.filter((b) => b.required).length
  const requiredDone = beats.filter((b) => b.required && clearedBeatIds.includes(b.id)).length

  return (
    <div className="investigate-hub">
      <p className="investigate-hub-prompt">気になる場所を調べてみましょう</p>
      <p className="investigate-hub-sub">カードを選ぶと調査を開始します。すべて終えたら判断へ。</p>

      <div className="investigate-hub-grid">
        {beats.map((b, i) => {
          const done = clearedBeatIds.includes(b.id)
          const clue = clues.find((c) => c.id === b.clueId)
          return (
            <button
              key={b.id}
              type="button"
              className={`investigate-hub-card ${done ? 'done' : ''} ${b.required ? 'required' : ''}`}
              onClick={() => setOpenId(b.id)}
            >
              <span className="investigate-hub-card-icon" aria-hidden>
                <img
                  src={done ? '/art/quest-investigate-clear-seal.png' : '/art/quest-investigate-seal.png'}
                  alt=""
                />
              </span>
              <span className="investigate-hub-card-name">
                {done ? (clue?.name ?? '調査完了') : `調査${i + 1}`}
              </span>
              <span className={`investigate-hub-card-status ${done ? 'is-done' : b.required ? 'is-required' : ''}`}>
                {done ? '確認済み' : b.required ? '必須・未実施' : '任意・未実施'}
              </span>
            </button>
          )
        })}
      </div>

      {requiredCount > 0 && (
        <div className="investigate-hub-footer">
          <span className="investigate-hub-footer-note">
            必須調査 {requiredDone} / {requiredCount} 件完了
          </span>
          <button
            type="button"
            className={`btn ${canAdvance ? 'quest' : 'secondary'}`}
            disabled={!canAdvance}
            onClick={handleAdvanceClick}
          >
            判断へ進む
          </button>
        </div>
      )}
      {requiredCount === 0 && (
        <div className="investigate-hub-footer">
          <span className="investigate-hub-footer-note">必須の調査はありません</span>
          <button type="button" className="btn quest" onClick={handleAdvanceClick}>
            判断へ進む
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * フラグワード組み立て画面(§3)。集めた文字の欠片(fragments)をタップしてスロットに
 * 並べ、unit.flagWord.answerと同じ語を完成させる。完成するまで判断へは進めない。
 */
function FlagWordAssembly({
  answer,
  fragments,
  onSolved,
  onBack,
}: {
  answer: string
  fragments: string[]
  onSolved: () => void
  onBack: () => void
}) {
  const answerChars = [...answer]
  const [placed, setPlaced] = useState<(number | null)[]>(() => answerChars.map(() => null))
  const [msg, setMsg] = useState<string | null>(null)

  const usedIndexes = new Set(placed.filter((p): p is number => p !== null))
  const allFilled = placed.every((p) => p !== null)
  const isCorrect = allFilled && placed.every((p, i) => p !== null && fragments[p] === answerChars[i])

  useEffect(() => {
    if (allFilled && !isCorrect) setMsg('まだ違うようだ。タイルをタップして並べ替えよう')
    if (isCorrect) setMsg(null)
  }, [allFilled, isCorrect])

  function placeFragment(fi: number) {
    if (usedIndexes.has(fi) || isCorrect) return
    const emptySlot = placed.findIndex((p) => p === null)
    if (emptySlot < 0) return
    const next = [...placed]
    next[emptySlot] = fi
    setPlaced(next)
  }
  function clearSlot(si: number) {
    if (placed[si] === null || isCorrect) return
    const next = [...placed]
    next[si] = null
    setPlaced(next)
  }
  function resetAll() {
    setPlaced(answerChars.map(() => null))
    setMsg(null)
  }

  return (
    <div className="flagword-stage">
      <button type="button" className="btn ghost" onClick={onBack}>
        {'← 調査一覧へ戻る'}
      </button>
      <p className="investigate-hub-prompt" style={{ marginTop: 12 }}>
        文字の欠片を並べ替えて、合言葉を完成させよう
      </p>
      <p className="investigate-hub-sub">タイルをタップしてマスに置き、もう一度タップすると戻せます。</p>

      <div className="flagword-slots">
        {placed.map((p, si) => (
          <button
            key={si}
            type="button"
            className={`flagword-slot ${p !== null ? 'filled' : ''}`}
            onClick={() => clearSlot(si)}
            aria-label={`${si + 1}文字目`}
          >
            {p !== null ? fragments[p] : ''}
          </button>
        ))}
      </div>

      <div className="flagword-tiles">
        {fragments.map((f, fi) => (
          <button
            key={fi}
            type="button"
            className="flagword-tile"
            disabled={usedIndexes.has(fi) || isCorrect}
            onClick={() => placeFragment(fi)}
          >
            {f}
          </button>
        ))}
      </div>

      {msg && <div className="feedback">{msg}</div>}
      {isCorrect && <div className="feedback">合言葉「{answer}」を完成させた!</div>}

      <div className="inline beat-actions" style={{ justifyContent: 'center', marginTop: 16 }}>
        {!isCorrect && (
          <button type="button" className="btn secondary" onClick={resetAll}>
            やり直す
          </button>
        )}
        {isCorrect && (
          <button type="button" className="btn quest" onClick={onSolved}>
            判断へ進む
          </button>
        )}
      </div>
    </div>
  )
}
