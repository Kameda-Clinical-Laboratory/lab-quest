import { DialogueForm } from '@/components/admin/beatForms/DialogueForm'
import { LectureForm } from '@/components/admin/beatForms/LectureForm'
import { InvestigateForm } from '@/components/admin/beatForms/InvestigateForm'
import { ResolveForm } from '@/components/admin/beatForms/ResolveForm'
import { DrillForm } from '@/components/admin/beatForms/DrillForm'
import type { Beat, ClueDef } from '@/mocks/learning'

/**
 * 選択中beatの型に応じて対応フォームを描画する。`key={beat.id}` を各フォームに
 * 付けることで、beat切替時にフォーム内部の一時状態(存在すれば)がリセットされる。
 */
export function BeatFormPanel({
  beat,
  onChange,
  stageId,
  clues,
  token,
  onClueCreated,
}: {
  beat: Beat
  onChange: (next: Beat) => void
  stageId: string
  clues: ClueDef[]
  token: string
  onClueCreated: (clue: ClueDef) => void
}) {
  switch (beat.type) {
    case 'dialogue':
      return <DialogueForm key={beat.id} beat={beat} onChange={onChange} />
    case 'lecture':
      return <LectureForm key={beat.id} beat={beat} onChange={onChange} />
    case 'investigate':
      return (
        <InvestigateForm
          key={beat.id}
          beat={beat}
          onChange={onChange}
          stageId={stageId}
          clues={clues}
          token={token}
          onClueCreated={onClueCreated}
        />
      )
    case 'resolve':
      return (
        <ResolveForm
          key={beat.id}
          beat={beat}
          onChange={onChange}
          stageId={stageId}
          clues={clues}
          token={token}
          onClueCreated={onClueCreated}
        />
      )
    case 'drill':
      return <DrillForm key={beat.id} beat={beat} onChange={onChange} />
    default:
      return null
  }
}
