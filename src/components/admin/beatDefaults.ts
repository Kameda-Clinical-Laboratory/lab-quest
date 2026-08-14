import type { Beat } from '@/mocks/learning'
import { DIALOGUE_BACKGROUNDS } from '@/lib/dialogueBackgrounds'

function newId(prefix: string) {
  return `${prefix}${crypto.randomUUID().slice(0, 8)}`
}

/** 「追加」ボタン押下時の新規beatの初期値。 */
export function defaultBeat(type: Beat['type']): Beat {
  switch (type) {
    case 'dialogue':
      return {
        type: 'dialogue',
        id: newId('b'),
        lines: [{ speaker: '', text: '' }],
        backgroundId: DIALOGUE_BACKGROUNDS[0].id,
        xp: 0,
      }
    case 'lecture':
      return { type: 'lecture', id: newId('b'), body: '', xp: 0 }
    case 'problem':
      return { type: 'problem', id: newId('b'), xp: 0 }
    case 'investigate':
      return {
        type: 'investigate',
        id: newId('b'),
        mode: 'textbook',
        purpose: '',
        howTo: '',
        choices: [{ label: '', correct: true }],
        // 未選択状態のプレースホルダ(空文字)。Edge Function側でnullに正規化される。
        clueId: '',
        required: true,
        xp: 0,
      }
    case 'resolve':
      return {
        type: 'resolve',
        id: newId('b'),
        requiredClueIds: [],
        prompt: '',
        choices: [{ label: '', correct: true, feedback: '' }],
        xp: 0,
      }
    case 'drill':
      return {
        type: 'drill',
        id: newId('b'),
        questions: [
          {
            id: newId('q'),
            format: 'mcq',
            prompt: '',
            choices: ['', ''],
            correctIndex: 0,
            explanation: '',
          },
        ],
        xp: 0,
      }
  }
}

/** unitPhaseLabel(src/mocks/learning.ts)は完全なBeatを要求するため、型だけからの
 * ラベル引きにはこちらを使う(「追加」ボタンの選択肢表示など)。 */
export function beatTypeLabel(type: Beat['type']): string {
  switch (type) {
    case 'dialogue':
      return '会話'
    case 'lecture':
      return '講義'
    case 'problem':
      return 'クエスト発生'
    case 'investigate':
      return '調査'
    case 'resolve':
      return '解決'
    case 'drill':
      return '発展'
  }
}

export const BEAT_TYPES: Beat['type'][] = [
  'dialogue',
  'lecture',
  'problem',
  'investigate',
  'resolve',
  'drill',
]
