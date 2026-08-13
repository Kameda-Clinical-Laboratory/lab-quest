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
      /** 幕のタイトル(例: 「看護師さんとの会話」)。未設定時は種別ラベルにフォールバックする。 */
      title?: string
      lines: DialogueLine[]
      /** 背景に使う画像のid。src/lib/dialogueBackgrounds.ts のカタログを参照する。未選択時は先頭にフォールバック。 */
      backgroundId?: string
      xp?: number
    }
  | {
      type: 'lecture'
      id: string
      title?: string
      body: string
      bridge?: string
      xp?: number
      /** 添付PDF(lecture-attachmentsバケットの公開URL)。任意。 */
      pdfUrl?: string
      /** 添付PDFの元ファイル名(表示用)。 */
      pdfName?: string
      /** 添付動画。ファイルは置かず、YouTube等の埋め込み可能なURLをそのまま保存する。 */
      videoUrl?: string
    }
  | {
      /**
       * クエスト発生。会話の直後に、そのユニットの依頼(unit.requestLine)を
       * 依頼票として見せるための幕。中身は持たず、unit.title/unit.requestLineを
       * そのまま表示する(2026-08、幕構成リニューアル)。
       */
      type: 'problem'
      id: string
      title?: string
      xp?: number
    }
  | {
      type: 'investigate'
      id: string
      title?: string
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
      /**
       * 症例解決。2026-08までは1つのresolveビートが複数ステップ(CaseStep[])を
       * 持つ構成だったが、管理画面での編集が煩雑だったため「1問につき1幕」に
       * フラット化した(既存の複数ステップ幕は個別の幕へ分割済み)。
       * 手がかりロック(requiredClueIds)は連続するresolveの最初の1幕にだけ
       * 付ければ、そこで入口をせき止められる(以降の幕は既に通過済みのため
       * 空配列でよい)。
       */
      type: 'resolve'
      id: string
      title?: string
      requiredClueIds: string[]
      prompt: string
      choices: { label: string; correct: boolean; feedback: string }[]
      xp?: number
    }
  | {
      type: 'drill'
      id: string
      title?: string
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
  const beatIds = new Set<string>()

  if (!unit.requestLine.trim()) errors.push(`${unit.id}: requestLine required`)

  // 手がかりの付与チェックはbeats配列内の並び順に依存させない(fn_publish_unit の
  // SQL移植と同じ2パス方式)。Phase 4のエディタはビートを追加/並べ替えする過程で
  // 「resolveを先に置いてから、後でinvestigateを追加/並べ替えする」という順序が
  // 自然に発生するため、単一パスの逐次チェックだと正しく付与されているのに
  // 誤って「未付与」と判定してしまう(実際にPhase 4の動作確認中に踏んだ)。
  const granted = new Set(
    unit.beats.filter((b) => b.type === 'investigate').map((b) => b.clueId),
  )

  for (const beat of unit.beats) {
    if (beatIds.has(beat.id)) errors.push(`duplicate beat id ${beat.id}`)
    beatIds.add(beat.id)

    if (beat.type === 'investigate') {
      if (!beat.acceptedAnswers.length) errors.push(`${beat.id}: acceptedAnswers empty`)
      if (!beat.clueId) errors.push(`${beat.id}: clueId required`)
    }
    if (beat.type === 'resolve') {
      for (const cid of beat.requiredClueIds) {
        if (!granted.has(cid)) {
          errors.push(`${beat.id}: required clue ${cid} not granted by any investigate`)
        }
      }
      if (!beat.prompt.trim()) errors.push(`${beat.id}: resolve prompt empty`)
      if (!beat.choices.length) errors.push(`${beat.id}: resolve choices empty`)
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

/** 幕の種別ラベル(会話/講義/調査/解決/発展)。beat.titleが未設定のときのフォールバックにも使う。 */
export function unitPhaseLabel(beat: Beat): string {
  switch (beat.type) {
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
    default:
      return ''
  }
}

/** 幕の表示タイトル。beat.titleが未設定/空文字なら種別ラベルにフォールバックする。 */
export function beatDisplayTitle(beat: Beat): string {
  return beat.title?.trim() || unitPhaseLabel(beat)
}

export type InvestigateBeatT = Extract<Beat, { type: 'investigate' }>

/** UnitLearnの幕一覧・サイドバーで1コマとして扱う単位。連続するinvestigateは1つの調査ハブにまとめる。 */
export type BeatDisplayGroup =
  | { kind: 'single'; beat: Beat; rawIndex: number }
  | { kind: 'investigateHub'; beats: InvestigateBeatT[]; rawIndexes: number[] }

/**
 * unit.beatsを画面表示単位にまとめる(2026-08、幕構成リニューアル)。
 * 連続するinvestigateビート(1本でも複数でも)は1つの「調査ハブ」グループにまとめ、
 * それ以外のビートは1件ずつ単独グループとする。第N幕の番号付けはこのグループ単位で行う。
 */
export function groupBeatsForDisplay(beats: Beat[]): BeatDisplayGroup[] {
  const groups: BeatDisplayGroup[] = []
  let i = 0
  while (i < beats.length) {
    const b = beats[i]
    if (b.type === 'investigate') {
      const runBeats: InvestigateBeatT[] = []
      const runIdx: number[] = []
      while (i < beats.length) {
        const cur = beats[i]
        if (cur.type !== 'investigate') break
        runBeats.push(cur)
        runIdx.push(i)
        i += 1
      }
      groups.push({ kind: 'investigateHub', beats: runBeats, rawIndexes: runIdx })
    } else {
      groups.push({ kind: 'single', beat: b, rawIndex: i })
      i += 1
    }
  }
  return groups
}
