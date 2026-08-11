import type { CaseStep } from './types'

export type InvestigateMode = 'textbook' | 'doc' | 'observe'

export type DialogueLine = {
  speaker: string
  text: string
}

export type ClueDef = {
  id: string
  name: string
  summary: string
}

export type DrillMcq = {
  id: string
  format: 'mcq'
  prompt: string
  choices: string[]
  correctIndex: number
  explanation: string
  xp?: number
}

export type Beat =
  | {
      type: 'dialogue'
      id: string
      lines: DialogueLine[]
      xp?: number
    }
  | {
      type: 'lecture'
      id: string
      body: string
      bridge?: string
      xp?: number
    }
  | {
      type: 'investigate'
      id: string
      mode: InvestigateMode
      purpose: string
      howTo: string
      inputPrompt: string
      acceptedAnswers: string[]
      clueId: string
      required: boolean
      manners?: string
      demoHint?: string
      xp?: number
    }
  | {
      type: 'resolve'
      id: string
      requiredClueIds: string[]
      steps: CaseStep[]
      xp?: number
    }
  | {
      type: 'drill'
      id: string
      questions: DrillMcq[]
      xp?: number
    }

export type LearningUnit = {
  id: string
  title: string
  requestLine: string
  beats: Beat[]
  /**
   * Supabaseモードでのみ埋まる(get_curriculum RPCが返す)。管理画面の
   * ユニット一覧/エディタで公開中・非公開を出し分けるために使う。
   * モックモードのSTAGES定義には無いため常にoptional。
   */
  published?: boolean
}

export function normalizeAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[ー−–—]/g, '-')
}

export function answersMatch(input: string, accepted: string[]): boolean {
  const n = normalizeAnswer(input)
  return accepted.some((a) => normalizeAnswer(a) === n)
}

export function isBeatRequiredForUnitClear(beat: Beat): boolean {
  if (beat.type === 'investigate' && !beat.required) return false
  return true
}

export function isUnitCleared(
  unit: LearningUnit,
  progress: { clearedBeatIds: string[] },
): boolean {
  return unit.beats
    .filter(isBeatRequiredForUnitClear)
    .every((b) => progress.clearedBeatIds.includes(b.id))
}

export function validateUnit(unit: LearningUnit): string[] {
  const errors: string[] = []
  const granted = new Set<string>()
  const beatIds = new Set<string>()

  if (!unit.requestLine.trim()) errors.push(`${unit.id}: requestLine required`)

  for (const beat of unit.beats) {
    if (beatIds.has(beat.id)) errors.push(`duplicate beat id ${beat.id}`)
    beatIds.add(beat.id)

    if (beat.type === 'investigate') {
      if (!beat.acceptedAnswers.length) errors.push(`${beat.id}: acceptedAnswers empty`)
      if (!beat.clueId) errors.push(`${beat.id}: clueId required`)
      granted.add(beat.clueId)
    }
    if (beat.type === 'resolve') {
      for (const cid of beat.requiredClueIds) {
        if (!granted.has(cid)) {
          errors.push(`${beat.id}: required clue ${cid} not granted by any investigate`)
        }
      }
      if (!beat.steps.length) errors.push(`${beat.id}: resolve steps empty`)
    }
    if (beat.type === 'drill' && !beat.questions.length) {
      errors.push(`${beat.id}: drill questions empty`)
    }
  }
  return errors
}

export function validateStagesUnits(
  stages: { id: string; units?: LearningUnit[] }[],
): string[] {
  return stages.flatMap((s) => (s.units ?? []).flatMap((u) => validateUnit(u)))
}

export function unitPhaseLabel(beat: Beat): string {
  switch (beat.type) {
    case 'dialogue':
      return '会話'
    case 'lecture':
      return '講義'
    case 'investigate':
      return '調査'
    case 'resolve':
      return '解決'
    case 'drill':
      return '発展'
    default:
      return ''
  }
}
