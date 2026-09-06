/**
 * 講義本文や冒険の書に差し込める教材アートのカタログ。
 * 写真が向く題材はここには置かず、docs/content-art.md を参照する。
 */

export type ContentArtItem = {
  id: string
  label: string
  src: string
  alt: string
  kind: 'sprite' | 'figure'
}

export const ASPIA_SPRITES: ContentArtItem[] = [
  { id: 'neutral', label: 'ふつう', src: '/art/aspia/chibi-neutral.png', alt: 'アスピア', kind: 'sprite' },
  { id: 'think', label: '考える', src: '/art/aspia/chibi-think.png', alt: '考えるアスピア', kind: 'sprite' },
  { id: 'happy', label: 'よろこぶ', src: '/art/aspia/chibi-happy.png', alt: 'よろこぶアスピア', kind: 'sprite' },
  { id: 'worry', label: 'あわてる', src: '/art/aspia/chibi-worry.png', alt: 'あわてるアスピア', kind: 'sprite' },
  { id: 'explain', label: '説明する', src: '/art/aspia/chibi-explain.png', alt: '説明するアスピア', kind: 'sprite' },
  { id: 'determined', label: 'やる気', src: '/art/aspia/chibi-determined.png', alt: 'やる気のアスピア', kind: 'sprite' },
]

export const CONTENT_FIGURES: ContentArtItem[] = [
  { id: 'accuracy-precision', label: '正確さ・精密さ', src: '/art/figures/accuracy-precision.png', alt: '正確さと精密さの的当て図', kind: 'figure' },
  { id: 'levy-jennings', label: '管理図3パターン', src: '/art/figures/levy-jennings.png', alt: 'Levey-Jennings管理図の安定・シフト・トレンド', kind: 'figure' },
  { id: 'westgard-flow', label: 'Westgard判定', src: '/art/figures/westgard-flow.png', alt: 'Westgardマルチルールの判定の流れ', kind: 'figure' },
  { id: 'traceability', label: 'トレーサビリティ', src: '/art/figures/traceability.png', alt: 'トレーサビリティ連鎖の階層', kind: 'figure' },
  { id: 'order-of-draw', label: '採取順序', src: '/art/figures/order-of-draw.png', alt: '採血管の推奨採取順序', kind: 'figure' },
  { id: 'sandwich-competitive', label: 'サンドイッチ/競合', src: '/art/figures/sandwich-competitive.png', alt: 'サンドイッチ法と競合法', kind: 'figure' },
  { id: 'hook-effect', label: 'フック効果', src: '/art/figures/hook-effect.png', alt: 'フック効果の模式図', kind: 'figure' },
  { id: 'immunochromatography', label: 'イムノクロマト', src: '/art/figures/immunochromatography.png', alt: 'イムノクロマトグラフィの模式図', kind: 'figure' },
  { id: 'anion-gap', label: 'アニオンギャップ', src: '/art/figures/anion-gap.png', alt: 'アニオンギャップの概念図', kind: 'figure' },
  { id: 'delta-check', label: 'デルタチェック', src: '/art/figures/delta-check.png', alt: 'デルタチェックのイメージ', kind: 'figure' },
  { id: 'analysis-flow', label: '切り分けフロー', src: '/art/figures/analysis-flow.png', alt: '装置から患者までの切り分け', kind: 'figure' },
  { id: 'ogtt-timeline', label: '75gOGTT', src: '/art/figures/ogtt-timeline.png', alt: '75gOGTTの採血タイミング', kind: 'figure' },
  { id: 'probnp-cleavage', label: 'proBNP切断', src: '/art/figures/probnp-cleavage.png', alt: 'proBNPの切断とBNP・NT-proBNP', kind: 'figure' },
  { id: 'sop-hierarchy', label: 'SOPの階層', src: '/art/figures/sop-hierarchy.png', alt: '標準作業書の階層', kind: 'figure' },
]
