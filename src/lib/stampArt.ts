/**
 * ログインスタンプ(Day1〜20)とボス戦クリアスタンプの画像パス。
 * 実運用では5〜8日程度で終わる想定だが、念のためDay20まで用意している。
 * 21日目以降はDay20の絵を使い回す(Day21以降の絵は用意しない)。
 */
export function stampImageForDay(day: number): string {
  const clamped = Math.min(Math.max(Math.round(day), 1), 20)
  return `/art/quest-stamp-day${clamped}.png`
}

export const CLEAR_STAMP_IMAGE = '/art/quest-stamp-clear.png'
