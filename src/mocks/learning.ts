export type InvestigateMode = 'textbook' | 'doc' | 'observe'

/**
 * 調査カードの型(2026-08、第4幕リニューアル)。単調な選択式1パターンだった調査を
 * 複数の型から選べるようにした(docs/adventure-book/HANDOFF-第4幕リニューアル実装.md)。
 * 省略時(undefined)は`board`として扱う — 既存コンテンツはこのフィールド自体を
 * 持たないため、無改修でそのまま動く。
 */
export type PuzzleType = 'board' | 'cipher' | 'order' | 'match' | 'cloze'

/** 穴埋め型(cloze)の1空欄。文字数ヒントは`answer.length`からその場で出す(別欄で
 * 二重管理すると本文の直しに追従できず食い違う恐れがあるため持たせない)。
 * `altAnswers`は読み方の揺れ・類義語(例: 「振とう」と「振動」)を許容するための
 * 別解リスト(2026-08追加、clinical-content-reviewer指摘: ひらがな入力かつ完全一致
 * 判定のため、正しく理解していても近い読みの言葉を選ぶと不正解になる問題への対処)。
 * 文字数ヒントは`answer`基準のまま変えない — altAnswersは同じ文字数になるものを
 * 選ぶのが望ましい(異なる場合、ヒントの文字数と実際の別解が食い違って見える)。 */
export type ClozeBlank = { answer: string; altAnswers?: string[] }

/** clozeの本文中で空欄を表すリテラル(出現順に`blanks`配列と対応させる)。 */
export const CLOZE_BLANK_MARKER = '{{blank}}'

/** ひらがな(＋長音記号ー)のみで構成されているか。clozeの解答はすべてひらがな
 * 入力させる方針(docs/adventure-book/HANDOFF-見習い主人公設定と調査ギミック拡張.md §3-1)
 * のため、著者側の入力ミス(漢字・カタカナ混入)を検知する。 */
export function isHiraganaOnly(s: string): boolean {
  return /^[ぁ-んー]+$/.test(s)
}

export type DialogueLine = {
  speaker: string
  text: string
}

export type ClueDef = {
  id: string
  name: string
  summary: string
}

/** 「フラグワードシステム」(§3)。ユニット内のcipher型カードで集めた文字の欠片を
 * 並べ替えて完成させる語。答え(answer)の文字集合が、そのユニット内の全cipher
 * カードのfragmentCharの集合と過不足なく一致している必要がある(validateUnitで検証)。 */
export type FlagWordConfig = {
  answer: string
}

export type DrillMcq = {
  id: string
  format: 'mcq'
  prompt: string
  /** 複数選択可(2026-08、investigateと同じ形へ統一)。correct:trueの集合と過不足なく
   * 一致すれば正解(単一正解の設問でも1つだけcorrect:trueにすればそのまま機能する)。 */
  choices: { label: string; correct: boolean }[]
  explanation: string
  xp?: number
}

export type InvestigateChoice = { label: string; correct: boolean }

/** puzzleTypeに関わらず全カードに共通するフィールド。以前はこれ全部+choicesが
 * investigate variantそのものだったが、2026-08に型ごとの追加フィールド
 * (fragmentChar/steps/pairs)を持てるよう判別共用体へ分割した。 */
type InvestigateBeatCommon = {
  type: 'investigate'
  id: string
  title?: string
  mode: InvestigateMode
  purpose: string
  howTo: string
  clueId: string
  required: boolean
  manners?: string
  demoHint?: string
  xp?: number
}

/**
 * 調査。以前は自由入力(inputPrompt+acceptedAnswers)だったが、実習生には
 * 入力の手間が負担という声を受け、2026-08に選択式(複数選択可)へ刷新した。
 * choicesのうちcorrect:trueのものを過不足なく選べば正解(複数正解も許容)。
 *
 * さらに2026-08、puzzleTypeによる判別共用体化(第4幕リニューアル):
 * - board (省略時のデフォルト): 既存の証拠ボード型。choicesはそのまま流用
 * - cipher: 正解すると文字の欠片(fragmentChar)を1つ入手する。ユニット内の
 *   欠片を集めてflagWordを組み立てる(InvestigateHubView参照)
 * - order: 手順・時系列のカード(steps、正しい順序で定義)を並べ替える
 * - match: 左列/右列のカード(pairs)を結線マッチングする
 * - cloze: 文中の空欄にひらがなで解答を入力する穴埋め型(2026-08追加、
 *   docs/adventure-book/HANDOFF-見習い主人公設定と調査ギミック拡張.md §3-1)。
 *   講義本文を歯抜けにして読解と知識定着を兼ねる用途を想定。
 */
type InvestigateBeatVariant =
  | (InvestigateBeatCommon & { puzzleType?: 'board'; choices: InvestigateChoice[] })
  | (InvestigateBeatCommon & {
      puzzleType: 'cipher'
      choices: InvestigateChoice[]
      /** 正解時に付与される「文字の欠片」。1文字を想定(flagWordの構成要素)。 */
      fragmentChar: string
    })
  | (InvestigateBeatCommon & { puzzleType: 'order'; steps: string[] })
  | (InvestigateBeatCommon & { puzzleType: 'match'; pairs: { left: string; right: string }[] })
  | (InvestigateBeatCommon & {
      puzzleType: 'cloze'
      /** 歯抜け本文。空欄は`CLOZE_BLANK_MARKER`(`{{blank}}`)で表し、出現順に
       * blanks配列と対応する。 */
      text: string
      blanks: ClozeBlank[]
    })

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
  | InvestigateBeatVariant
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
  /** フラグワード(§3)。ユニット内にcipher型カードが1枚でもあれば必須。 */
  flagWord?: FlagWordConfig
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

  // flagWord(§3)の整合性チェック用に、cipherカードのfragmentCharを集めておく。
  const cipherFragments: string[] = []

  for (const beat of unit.beats) {
    if (beatIds.has(beat.id)) errors.push(`duplicate beat id ${beat.id}`)
    beatIds.add(beat.id)

    if (beat.type === 'investigate') {
      if (!beat.clueId) errors.push(`${beat.id}: clueId required`)

      if (beat.puzzleType === 'order') {
        if (beat.steps.length < 2) errors.push(`${beat.id}: steps must have at least 2 items`)
      } else if (beat.puzzleType === 'match') {
        if (!beat.pairs.length) errors.push(`${beat.id}: pairs empty`)
        if (beat.pairs.some((p) => !p.left.trim() || !p.right.trim())) {
          errors.push(`${beat.id}: pairs must not have empty left/right`)
        }
      } else if (beat.puzzleType === 'cloze') {
        if (!beat.text.trim()) errors.push(`${beat.id}: cloze text empty`)
        if (!beat.blanks.length) errors.push(`${beat.id}: blanks empty`)
        const markerCount = beat.text.split(CLOZE_BLANK_MARKER).length - 1
        if (markerCount !== beat.blanks.length) {
          errors.push(
            `${beat.id}: 本文中の空欄マーカー数(${markerCount})とblanksの件数(${beat.blanks.length})が一致しません`,
          )
        }
        beat.blanks.forEach((b, i) => {
          if (!b.answer.trim()) errors.push(`${beat.id}: blanks[${i}].answer empty`)
          else if (!isHiraganaOnly(b.answer.trim())) {
            errors.push(`${beat.id}: blanks[${i}].answer「${b.answer}」はひらがな以外を含んでいます`)
          }
          for (const alt of b.altAnswers ?? []) {
            if (!alt.trim()) errors.push(`${beat.id}: blanks[${i}].altAnswersに空の要素があります`)
            else if (!isHiraganaOnly(alt.trim())) {
              errors.push(`${beat.id}: blanks[${i}].altAnswers「${alt}」はひらがな以外を含んでいます`)
            }
          }
        })
      } else {
        // puzzleType === 'board'(既定) または 'cipher'
        if (!beat.choices.length) errors.push(`${beat.id}: choices empty`)
        if (!beat.choices.some((c) => c.correct)) errors.push(`${beat.id}: 正解の選択肢が1つもありません`)
        if (beat.puzzleType === 'cipher') {
          if (!beat.fragmentChar.trim()) errors.push(`${beat.id}: fragmentChar required`)
          else cipherFragments.push(beat.fragmentChar.trim())
        }
      }
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

  // flagWordは、ユニット内にcipherカードが1枚でもあれば必須。answerの文字集合は
  // 全cipherカードのfragmentCharの集合(多重集合)と過不足なく一致していなければ
  // ならない(そうでないと組み立て画面で完成させられない語ができてしまう)。
  if (cipherFragments.length > 0) {
    if (!unit.flagWord?.answer.trim()) {
      errors.push(`${unit.id}: cipher型カードがあるためflagWordが必要です`)
    } else if (!isSameMultiset([...unit.flagWord.answer], cipherFragments)) {
      errors.push(
        `${unit.id}: flagWord「${unit.flagWord.answer}」がcipherカードの文字の欠片(${cipherFragments.join('、')})と一致しません`,
      )
    }
  }

  return errors
}

function isSameMultiset(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((c, i) => c === sortedB[i])
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
