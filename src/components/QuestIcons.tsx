import { cn } from '@/lib/utils'

type IconProps = {
  className?: string
  title?: string
}

/** Thick-outline RPG menu icons (original, MH/DQ-inspired feel). */

export function IconLabCrest({ className, title = 'ラボクエスト' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={cn('quest-icon', className)} aria-hidden={title ? undefined : true} role="img">
      {title ? <title>{title}</title> : null}
      <path
        d="M18 6 H30 V14 L39 33 A9 9 0 0 1 31 44 H17 A9 9 0 0 1 9 33 L18 14 Z"
        fill="#1a4540"
        stroke="#e6c56a"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M13 30 H35 L30 40 H18 Z" fill="#3dcfb8" opacity="0.88" />
      <circle cx="21" cy="33" r="1.6" fill="#fff4cc" />
      <circle cx="27" cy="35" r="1.2" fill="#7ec8b8" />
      <rect x="17" y="4" width="14" height="5" rx="1.4" fill="#f0d78c" stroke="#8b6914" strokeWidth="1.5" />
      <path d="M20 8 H28" stroke="#8b6914" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function IconCompass({ className, title = 'コンパス' }: IconProps) {
  return <IconLabCrest className={className} title={title} />
}

export function IconSwordQuest({ className, title = 'クエスト' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={cn('quest-icon', className)} aria-hidden={title ? undefined : true} role="img">
      {title ? <title>{title}</title> : null}
      <path
        d="M33.5 7.5 L40.5 14.5 L23 32 L16.5 30 L14.5 23.5 Z"
        fill="#e8eef4"
        stroke="#6b7580"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M30 11 L37 18" stroke="#9aa7b5" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14.5 23.5 L16.5 30 L10 36.5 L7.5 34 Z" fill="#d4a017" stroke="#8b6914" strokeWidth="1.8" />
      <rect x="18" y="28" width="10" height="3.5" rx="1" transform="rotate(45 23 30)" fill="#6b3a14" stroke="#3f210a" strokeWidth="1.4" />
      <circle cx="11.5" cy="35.5" r="2.6" fill="#f0d78c" stroke="#8b6914" strokeWidth="1.6" />
    </svg>
  )
}

export function IconFlask({ className, title = '実験' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={cn('quest-icon', className)} aria-hidden={title ? undefined : true} role="img">
      {title ? <title>{title}</title> : null}
      <path
        d="M18 8 H30 V16 L38 34 A8 8 0 0 1 30 44 H18 A8 8 0 0 1 10 34 L18 16 Z"
        fill="#1e4540"
        stroke="#d4a017"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M14 32 H34 L30 40 H18 Z" fill="#3dcfb8" opacity="0.85" />
      <circle cx="22" cy="34" r="2" fill="#fff4cc" />
      <circle cx="28" cy="36" r="1.5" fill="#7ec8b8" />
      <rect x="17" y="6" width="14" height="5" rx="1.5" fill="#f0d78c" stroke="#8b6914" strokeWidth="2" />
    </svg>
  )
}

export function IconShield({ className, title = '守護' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={cn('quest-icon', className)} aria-hidden={title ? undefined : true} role="img">
      {title ? <title>{title}</title> : null}
      <path
        d="M24 6 L40 12 V24 C40 34 32 40 24 44 C16 40 8 34 8 24 V12 Z"
        fill="#1a4a44"
        stroke="#d4a017"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M24 12 L34 16 V24 C34 30 29 34 24 37 C19 34 14 30 14 24 V16 Z" fill="#0f766e" />
      <path d="M24 18 V32 M18 24 H30" stroke="#f0d78c" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconFlag({ className, title = '旗' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={cn('quest-icon', className)} aria-hidden={title ? undefined : true} role="img">
      {title ? <title>{title}</title> : null}
      <rect x="10" y="6" width="4" height="36" rx="1" fill="#8b6914" stroke="#5c4a0a" strokeWidth="1.5" />
      <path
        d="M14 8 H36 L30 16 L36 24 H14 Z"
        fill="#dc5a4a"
        stroke="#8b2e22"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="22" cy="16" r="3" fill="#f0d78c" stroke="#8b6914" strokeWidth="1.5" />
    </svg>
  )
}

export function IconStamp({ className, title = 'スタンプ' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={cn('quest-icon', className)} aria-hidden={title ? undefined : true} role="img">
      {title ? <title>{title}</title> : null}
      <circle cx="24" cy="22" r="14" fill="#7a1f1f" stroke="#d4a017" strokeWidth="3" />
      <circle cx="24" cy="22" r="10" fill="none" stroke="#f0d78c" strokeWidth="2" strokeDasharray="3 2" />
      <path d="M18 22 L22 26 L30 16" fill="none" stroke="#f0d78c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="24" cy="40" rx="12" ry="3" fill="#5c2e0a" opacity="0.45" />
    </svg>
  )
}

export function IconXpOrb({ className, title = '経験値' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={cn('quest-icon', className)} aria-hidden={title ? undefined : true} role="img">
      {title ? <title>{title}</title> : null}
      <circle cx="24" cy="24" r="16" fill="#b8860b" stroke="#f0d78c" strokeWidth="3" />
      <circle cx="24" cy="24" r="10" fill="#f5d76e" />
      <path d="M24 14 L26 22 L34 24 L26 26 L24 34 L22 26 L14 24 L22 22 Z" fill="#fff8dc" />
    </svg>
  )
}

export function IconBoss({ className, title = 'ボス戦' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={cn('quest-icon', className)} aria-hidden={title ? undefined : true} role="img">
      {title ? <title>{title}</title> : null}
      <path
        d="M24 6 L42 14 L38 34 L24 44 L10 34 L6 14 Z"
        fill="#3b1d4a"
        stroke="#d4a017"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M18 22 H30 V28 C30 32 27 34 24 34 C21 34 18 32 18 28 Z" fill="#3dcfb8" stroke="#0f766e" strokeWidth="2" />
      <rect x="20" y="14" width="8" height="10" rx="1" fill="#7ec8b8" stroke="#0f766e" strokeWidth="1.5" />
      <path d="M14 18 L24 12 L34 18" fill="none" stroke="#f0d78c" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconScroll({ className, title = '巻物' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={cn('quest-icon', className)} aria-hidden={title ? undefined : true} role="img">
      {title ? <title>{title}</title> : null}
      <path
        d="M12 12 H36 A4 4 0 0 1 36 20 V36 A4 4 0 0 1 32 40 H12 A4 4 0 0 1 12 32 V12 Z"
        fill="#f3e6c4"
        stroke="#8b6914"
        strokeWidth="2.5"
      />
      <path d="M12 12 A4 4 0 0 0 12 20 H36" fill="#e8d4a8" stroke="#8b6914" strokeWidth="2" />
      <path d="M18 24 H30 M18 30 H26" stroke="#8b6914" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconCase({ className, title = '症例' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={cn('quest-icon', className)} aria-hidden={title ? undefined : true} role="img">
      {title ? <title>{title}</title> : null}
      <rect x="10" y="8" width="28" height="34" rx="3" fill="#f3e6c4" stroke="#8b6914" strokeWidth="2.5" />
      <rect x="14" y="12" width="20" height="8" rx="1" fill="#1a4a44" />
      <circle cx="24" cy="28" r="7" fill="#dc5a4a" stroke="#8b2e22" strokeWidth="2" />
      <path d="M24 24 V32 M20 28 H28" stroke="#f0d78c" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconProcedure({ className, title = '手技' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={cn('quest-icon', className)} aria-hidden={title ? undefined : true} role="img">
      {title ? <title>{title}</title> : null}
      <rect x="8" y="18" width="32" height="18" rx="3" fill="#cfd8e3" stroke="#5a6470" strokeWidth="2.5" />
      <rect x="12" y="12" width="10" height="8" rx="2" fill="#7ec8b8" stroke="#0f766e" strokeWidth="2" />
      <rect x="26" y="12" width="10" height="8" rx="2" fill="#f0d78c" stroke="#8b6914" strokeWidth="2" />
      <path d="M14 26 H34 M14 32 H28" stroke="#5a6470" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconCheck({ className, title = 'クリア' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={cn('quest-icon', className)} aria-hidden={title ? undefined : true} role="img">
      {title ? <title>{title}</title> : null}
      <circle cx="24" cy="24" r="16" fill="#0f766e" stroke="#d4a017" strokeWidth="3" />
      <path d="M16 24 L22 30 L34 16" fill="none" stroke="#f0d78c" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
