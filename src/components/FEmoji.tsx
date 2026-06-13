'use client'
import { Icon } from '@iconify/react'

// Mapeamento emoji Unicode → nome do ícone Fluent Emoji no Iconify
const MAPA: Record<string, string> = {
  '🚪': 'fluent-emoji:door',
  '🌱': 'fluent-emoji:seedling',
  '🌿': 'fluent-emoji:herb',
  '✅': 'fluent-emoji:check-mark-button',
  '⚡': 'fluent-emoji:high-voltage',
  '🗂️': 'fluent-emoji:card-index-dividers',
  '🔊': 'fluent-emoji:speaker-high-volume',
  '👆': 'fluent-emoji:index-pointing-up',
  '🎯': 'fluent-emoji:bullseye',
  '🎵': 'fluent-emoji:musical-notes',
  '🎉': 'fluent-emoji:party-popper',
  '📴': 'fluent-emoji:mobile-phone-off',
  '☁️': 'fluent-emoji:cloud',
  '🏆': 'fluent-emoji:trophy',
  '🌐': 'fluent-emoji:globe-with-meridians',
  '💾': 'fluent-emoji:floppy-disk',
  '🏠': 'fluent-emoji:house',
  '🥇': 'fluent-emoji:1st-place-medal',
  '🥈': 'fluent-emoji:2nd-place-medal',
  '🥉': 'fluent-emoji:3rd-place-medal',
  '🦤': 'fluent-emoji:dodo',
  '🐊': 'fluent-emoji:crocodile',
  '🐾': 'fluent-emoji:paw-prints',
  '🦜': 'fluent-emoji:parrot',
  '🐆': 'fluent-emoji:leopard',
  '🦏': 'fluent-emoji:rhinoceros',
  '📚': 'fluent-emoji:books',
  '⏳': 'fluent-emoji:hourglass-not-done',
  '⏱️': 'fluent-emoji:stopwatch',
  '❓': 'fluent-emoji:red-question-mark',
}

interface Props {
  children: string
  size?: number
  className?: string
  style?: React.CSSProperties
}

export function FEmoji({ children, size = 24, className, style }: Props) {
  const icon = MAPA[children]
  if (!icon) return <span className={className} style={style}>{children}</span>
  return (
    <Icon
      icon={icon}
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-hidden
    />
  )
}
