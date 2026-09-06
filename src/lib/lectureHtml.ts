import DOMPurify from 'dompurify'

/**
 * 講義本文(リッチテキスト)の許可タグ。スタッフ編集(RichTextEditor)と
 * 学生側描画(BeatView)で同じ設定を使い、DBを直接いじられた場合にも備える。
 *
 * img は /art/ 配下の教材図・アスピア立ち絵だけを許可する。
 */
export const LECTURE_HTML_CONFIG = {
  ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'span', 'br', 'div', 'p', 'img'],
  ALLOWED_ATTR: ['style', 'src', 'alt', 'class'],
}

const ALLOWED_IMG_CLASS = new Set(['lecture-sprite', 'lecture-figure'])

export function sanitizeLectureHtml(html: string): string {
  const clean = DOMPurify.sanitize(html, LECTURE_HTML_CONFIG)
  const doc = new DOMParser().parseFromString(clean, 'text/html')
  doc.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
    const { color, fontWeight } = el.style
    const textDecoration = el.style.textDecoration || el.style.textDecorationLine
    el.removeAttribute('style')
    if (color) el.style.color = color
    if (textDecoration) el.style.textDecoration = textDecoration
    if (fontWeight) el.style.fontWeight = fontWeight
  })
  doc.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') ?? ''
    if (!src.startsWith('/art/')) {
      img.remove()
      return
    }
    const cls = img.getAttribute('class') ?? ''
    if (cls && !ALLOWED_IMG_CLASS.has(cls)) img.removeAttribute('class')
  })
  return doc.body.innerHTML
}
