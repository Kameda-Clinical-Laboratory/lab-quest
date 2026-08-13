import { useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'
import { Button } from '@/components/ui/button'

/**
 * 講義本文用の簡易リッチテキストエディタ(2026-08)。
 *
 * WordPressのような本格エディタではなく、太字・下線・文字色の3操作だけに絞った
 * 最小構成。実装は contentEditable + document.execCommand ベース(非推奨APIだが
 * この3操作程度であれば主要ブラウザで今も動作し、依存も増やさずに済む)。
 *
 * 保存するHTMLは常にDOMPurifyで許可タグ/属性だけに絞る。加えて貼り付け(paste)は
 * プレーンテキストとして扱う(外部からのHTML持ち込みで想定外のスタイルや
 * タグが紛れ込むのを防ぐ)。ツールバー操作で生成される範囲のHTMLだけを許可する
 * 想定なので、これで実用上は十分な安全マージンになる。
 */

const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'span', 'br', 'div', 'p'],
  ALLOWED_ATTR: ['style'],
}

const COLORS: { label: string; value: string }[] = [
  { label: '既定', value: 'inherit' },
  { label: '赤', value: '#c0392b' },
  { label: '青', value: '#1a5fb4' },
  { label: '緑', value: '#1e7a4a' },
  { label: '金', value: '#8b6914' },
]

/** contentEditableのinnerHTMLを許可タグ/属性だけに絞る。
 * style属性はcolor/text-decoration/font-weightの3つだけ残す(styleWithCSS有効時、
 * execCommandはfont色を<font color>ではなく<span style="color:...">で出すため、
 * ここでcolorを消してしまうと文字色が丸ごと消える)。 */
function sanitize(html: string): string {
  const clean = DOMPurify.sanitize(html, PURIFY_CONFIG)
  const doc = new DOMParser().parseFromString(clean, 'text/html')
  doc.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
    const { color, fontWeight } = el.style
    // ブラウザは`text-decoration-line`だけ設定すると、ショートハンド`textDecoration`
    // getterが空文字を返すことがあるため、longhandも見る。
    const textDecoration = el.style.textDecoration || el.style.textDecorationLine
    el.removeAttribute('style')
    if (color) el.style.color = color
    if (textDecoration) el.style.textDecoration = textDecoration
    if (fontWeight) el.style.fontWeight = fontWeight
  })
  return doc.body.innerHTML
}

export function RichTextEditor({
  value,
  onChange,
  rows = 6,
}: {
  value: string
  onChange: (html: string) => void
  rows?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  // 外部から value が変わった(beat切替など)ときだけDOMを同期する。
  // 毎onInputでinnerHTMLを書き戻すとカーソル位置が飛ぶため、通常入力時は触らない。
  const lastValue = useRef<string | null>(null)

  useEffect(() => {
    if (ref.current && value !== lastValue.current) {
      ref.current.innerHTML = value
      lastValue.current = value
    }
  }, [value])

  function emitChange() {
    if (!ref.current) return
    const clean = sanitize(ref.current.innerHTML)
    lastValue.current = clean
    onChange(clean)
  }

  function exec(command: string, arg?: string) {
    ref.current?.focus()
    // styleWithCSSを有効にしないと、文字色は<font color>という古いタグで出力される
    // (許可タグに無いため後段のsanitizeで消えてしまう)。CSSスタイル出力に固定する。
    document.execCommand('styleWithCSS', false, 'true')
    document.execCommand(command, false, arg)
    emitChange()
  }

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar">
        <Button type="button" variant="outline" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('bold')}>
          <strong>B</strong>
        </Button>
        <Button type="button" variant="outline" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('underline')}>
          <u>U</u>
        </Button>
        <span className="rich-text-toolbar-sep" aria-hidden />
        {COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            className="rich-text-swatch"
            title={c.label}
            style={{ color: c.value === 'inherit' ? '#14302c' : c.value }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('foreColor', c.value)}
          >
            A
          </button>
        ))}
      </div>
      <div
        ref={ref}
        className="rich-text-body"
        style={{ minHeight: `${rows * 1.6}em` }}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        onPaste={(e) => {
          e.preventDefault()
          const text = e.clipboardData.getData('text/plain')
          document.execCommand('insertText', false, text)
        }}
      />
    </div>
  )
}
