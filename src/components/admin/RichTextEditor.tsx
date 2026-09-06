import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ASPIA_SPRITES, CONTENT_FIGURES, type ContentArtItem } from '@/lib/contentArt'
import { sanitizeLectureHtml } from '@/lib/lectureHtml'

/**
 * 講義本文用の簡易リッチテキストエディタ(2026-08)。
 *
 * WordPressのような本格エディタではなく、太字・下線・文字色と、
 * /art/ 配下の立ち絵・教材図の挿入に絞った最小構成。
 * 実装は contentEditable + document.execCommand ベース。
 *
 * 保存するHTMLは常に sanitizeLectureHtml で許可タグ/属性だけに絞る。
 * 貼り付け(paste)はプレーンテキストとして扱う。
 */

const COLORS: { label: string; value: string }[] = [
  { label: '既定', value: 'inherit' },
  { label: '赤', value: '#c0392b' },
  { label: '青', value: '#1a5fb4' },
  { label: '緑', value: '#1e7a4a' },
  { label: '金', value: '#8b6914' },
]

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
    const clean = sanitizeLectureHtml(ref.current.innerHTML)
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

  function insertArt(item: ContentArtItem) {
    ref.current?.focus()
    const cls = item.kind === 'sprite' ? 'lecture-sprite' : 'lecture-figure'
    const html = `<img src="${item.src}" alt="${item.alt}" class="${cls}">`
    document.execCommand('insertHTML', false, html)
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
      <details className="art-insert">
        <summary>画像を挿入（アスピア / 教材図）</summary>
        <p className="art-insert-label">アスピア</p>
        <div className="art-insert-grid sprites">
          {ASPIA_SPRITES.map((item) => (
            <button
              key={item.id}
              type="button"
              className="art-insert-item"
              title={item.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertArt(item)}
            >
              <img src={item.src} alt="" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <p className="art-insert-label">教材図</p>
        <div className="art-insert-grid figures">
          {CONTENT_FIGURES.map((item) => (
            <button
              key={item.id}
              type="button"
              className="art-insert-item"
              title={item.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertArt(item)}
            >
              <img src={item.src} alt="" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </details>
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
