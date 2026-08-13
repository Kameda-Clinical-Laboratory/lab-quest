import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Beat } from '@/mocks/learning'
import { JP } from '@/pages/Admin/strings'

type ProblemBeat = Extract<Beat, { type: 'problem' }>

/**
 * クエスト発生ビートには編集できる本文が無い。依頼票にはユニットの
 * タイトル/依頼文(ユニット編集欄の「タイトル」「依頼文」)がそのまま出る。
 */
export function ProblemForm({
  beat,
  onChange,
}: {
  beat: ProblemBeat
  onChange: (next: ProblemBeat) => void
}) {
  return (
    <div className="stack">
      <p className="muted" style={{ marginTop: 0 }}>
        {JP.problemFormHint}
      </p>
      <div className="field" style={{ width: 120 }}>
        <Label>{JP.xp}</Label>
        <Input
          type="number"
          value={beat.xp ?? 0}
          onChange={(e) => onChange({ ...beat, xp: Number(e.target.value) })}
        />
      </div>
    </div>
  )
}
