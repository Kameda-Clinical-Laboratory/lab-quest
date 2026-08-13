import { useState } from 'react'
import type { Beat } from '@/mocks/learning'
import { InvestigateBeat } from './BeatView'

type InvestigateBeatT = Extract<Beat, { type: 'investigate' }>

/**
 * 調査ハブ。連続するinvestigateビートを1枚のハブ画面にまとめ、虫眼鏡の紋章カードから
 * 選んで調査する形にする(2026-08、幕構成リニューアル)。UnitLearnがunit.beatsから
 * 連続するinvestigateの並びを検出してこのコンポーネントへまとめて渡す。
 *
 * 完了状態(clearedBeatIds)は個々のinvestigateビートidに対して従来どおり記録されるため、
 * 必須/任意の判定やresolveの手がかりロックなど、既存ロジックには一切手を入れていない。
 */
export function InvestigateHubView({
  beats,
  clearedBeatIds,
  clues,
  canAdvance,
  onCompleteItem,
  onAdvance,
}: {
  beats: InvestigateBeatT[]
  clearedBeatIds: string[]
  clues: { id: string; name: string; summary: string }[]
  canAdvance: boolean
  onCompleteItem: (beat: InvestigateBeatT, clueId?: string) => void
  onAdvance: () => void
}) {
  const [openId, setOpenId] = useState<string | null>(null)

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

  const requiredCount = beats.filter((b) => b.required).length
  const requiredDone = beats.filter((b) => b.required && clearedBeatIds.includes(b.id)).length

  return (
    <div className="investigate-hub">
      <p className="investigate-hub-prompt">気になる場所を調べてみましょう</p>
      <p className="investigate-hub-sub">カードを選ぶと調査を開始します。すべて終えたら解決へ。</p>

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
            className={`btn ${canAdvance ? '' : 'secondary'}`}
            disabled={!canAdvance}
            onClick={onAdvance}
          >
            解決へ進む
          </button>
        </div>
      )}
      {requiredCount === 0 && (
        <div className="investigate-hub-footer">
          <span className="investigate-hub-footer-note">必須の調査はありません</span>
          <button type="button" className="btn" onClick={onAdvance}>
            解決へ進む
          </button>
        </div>
      )}
    </div>
  )
}
