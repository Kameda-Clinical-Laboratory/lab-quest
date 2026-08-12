import { DialogueForm } from '@/components/admin/beatForms/DialogueForm'
import { LectureForm } from '@/components/admin/beatForms/LectureForm'
import { InvestigateForm } from '@/components/admin/beatForms/InvestigateForm'
import { ResolveForm } from '@/components/admin/beatForms/ResolveForm'
import { DrillForm } from '@/components/admin/beatForms/DrillForm'
import type { Beat, ClueDef } from '@/mocks/learning'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { JP } from '../strings'

/**
 * 選択中beatの型に応じて対応フォームを描画する。`key={beat.id}` を各フォームに
 * 付けることで、beat切替時にフォーム内部の一時状態(存在すれば)がリセットされる。
 *
 * タイトル欄は種別を問わず共通なので、5つの個別フォームには持たせずここで
 * まとめて描画する(beat.titleはBeat型の全variantに共通で生えている)。
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
  return (
    <div className="stack">
      <div className="field">
        <Label>{JP.beatTitle}</Label>
        <Input
          value={beat.title ?? ''}
          onChange={(e) => onChange({ ...beat, title: e.target.value } as Beat)}
          placeholder={JP.beatTitlePlaceholder}
        />
      </div>
      <BeatTypeForm
        beat={beat}
        onChange={onChange}
        stageId={stageId}
        clues={clues}
        token={token}
        onClueCreated={onClueCreated}
      />
    </div>
  )
}

function BeatTypeForm({
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
