import { BeatView } from '@/components/learn/BeatView'
import type { Beat, ClueDef } from '@/mocks/learning'
import { JP } from '../strings'

/**
 * 学生ランタイム(ChapterLearn.tsx の UnitLearn)と全く同じ `BeatView` を
 * no-opのonComplete/onJumpToInvestigateで描画するプレビュー。
 * `owned` はドラフト内の全investigateビートのclueId集合(順序無関係) —
 * そうしないとresolveビートのプレビューが不整合な「ロック」表示になる。
 */
export function PreviewPane({
  beat,
  clues,
  owned,
  unitTitle,
  requestLine,
}: {
  beat: Beat | null
  clues: ClueDef[]
  owned: Set<string>
  /** 'problem'ビートのプレビュー用。依頼票にそのまま出す。 */
  unitTitle?: string
  requestLine?: string
}) {
  if (!beat) return <p className="muted">{JP.preview2}</p>
  return (
    <div className={`quest-content learn-panel beat-bg-${beat.type}`}>
      <h3 style={{ marginTop: 0 }}>{JP.preview2}</h3>
      <BeatView
        key={beat.id}
        beat={beat}
        owned={owned}
        clues={clues}
        already={false}
        unitTitle={unitTitle}
        requestLine={requestLine}
        onComplete={() => {}}
        onJumpToInvestigate={() => {}}
      />
    </div>
  )
}
