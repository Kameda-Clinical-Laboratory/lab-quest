import type { ClueDef } from '@/mocks/learning'
import { CreateClueButton } from '@/components/admin/CreateClueButton'
import { JP } from '@/pages/Admin/strings'

/**
 * stageにスコープした手がかり(clue)の単一選択ドロップダウン + その場作成。
 * `clues` は呼び出し元(stage.clues、サーバー側で既にstageスコープ済み)から
 * そのまま渡す — このコンポーネント自身は独立したfetch/filterを行わない。
 */
export function CluePicker({
  stageId,
  clues,
  value,
  onChange,
  token,
  onClueCreated,
}: {
  stageId: string
  clues: ClueDef[]
  value: string | null
  onChange: (clueId: string) => void
  token: string
  onClueCreated: (clue: ClueDef) => void
}) {
  return (
    <div className="inline" style={{ gap: 8, alignItems: 'center' }}>
      <select
        className="flex h-10 min-w-[10rem] rounded-md border border-input bg-background/80 px-3 py-2 text-sm shadow-sm"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{JP.clueNone}</option>
        {clues.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <CreateClueButton
        stageId={stageId}
        token={token}
        onCreated={(clue) => {
          onClueCreated(clue)
          onChange(clue.id)
        }}
      />
    </div>
  )
}
