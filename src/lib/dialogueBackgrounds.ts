/**
 * 会話ビートの背景として選べる画像カタログ(Phase4/5 UI調整, 2026-08)。
 * コンテンツエディタ(DialogueForm)の画像ピッカーと、学生画面/プレビューの
 * 描画(BeatView)の両方がこの配列を参照する。増減はここを編集するだけでよい。
 */
export type DialogueBackground = {
  id: string
  label: string
  src: string
}

export const DIALOGUE_BACKGROUNDS: DialogueBackground[] = [
  { id: 'labhall', label: '臨床検査室ホール', src: '/art/quest-dialogue-bg-labhall.png' },
  { id: 'ward', label: '病棟', src: '/art/quest-dialogue-bg-ward.png' },
  { id: 'conference', label: 'カンファレンス室', src: '/art/quest-dialogue-bg-conference.png' },
  { id: 'corridor', label: '廊下', src: '/art/quest-dialogue-bg-corridor.png' },
  { id: 'nightlab', label: '夜間の臨床検査室', src: '/art/quest-dialogue-bg-nightlab.png' },
  { id: 'phlebotomy', label: '採血ブース', src: '/art/quest-dialogue-bg-phlebotomy.png' },
  { id: 'centrifuge', label: '遠心・前処理', src: '/art/quest-dialogue-bg-centrifuge.png' },
  { id: 'nursestation', label: 'ナースステーション', src: '/art/quest-dialogue-bg-nursestation.png' },
  { id: 'reception', label: '受付', src: '/art/quest-dialogue-bg-reception.png' },
  { id: 'courtyard', label: '中庭', src: '/art/quest-dialogue-bg-courtyard.png' },
  // プロローグ「小さな声」用。会話UIに立ち絵レイヤがないため、見習いアスピアを絵の中に入れている。
  { id: 'prologue', label: 'プロローグ（アスピア）', src: '/art/quest-dialogue-bg-prologue.png' },
  // エピローグ用。立派な技師になったアスピアが、プレイヤーへ「ありがとう」と語りかける場面。
  { id: 'epilogue', label: 'エピローグ（アスピア）', src: '/art/quest-dialogue-bg-epilogue.png' },
  // エピローグ直後の映画エンドカード。「Fin.」を絵の中に入れている。
  { id: 'fin', label: 'Fin.', src: '/art/quest-dialogue-bg-fin.png' },
]

/** 未選択・不明なidは先頭(labhall)にフォールバックする。 */
export function getDialogueBackground(id: string | undefined): DialogueBackground {
  return DIALOGUE_BACKGROUNDS.find((b) => b.id === id) ?? DIALOGUE_BACKGROUNDS[0]
}
