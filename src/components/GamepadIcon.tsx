'use client'
import type { TipoGamepad } from '@/hooks/useGamepadStatus'

export type BotaoID = 'dpad' | 'confirmar' | 'voltar' | 'acao' | 'alternativo' | 'start'

type IconDef = { t: 'face'; letter: string } | { t: 'dpad' } | { t: 'start' }

// Cores padrão (monocromático sobre fundo claro)
const FC = 'rgba(0,0,0,0.15)'
const FT = 'rgba(0,0,0,0.40)'
const FS = 'rgba(0,0,0,0.22)'

interface SvgProps { size: number }

function FaceButton({ letter, size, color }: SvgProps & { letter: string; color?: string }) {
  const fillCircle = color ?? FC
  const fillText   = color ? 'white' : FT
  return (
    <svg
      width={size} height={size} viewBox="0 0 18 18"
      aria-hidden style={{ pointerEvents: 'none', flexShrink: 0 }}
    >
      <circle cx="9" cy="9" r="8.5" fill={fillCircle} />
      <text
        x="9" y="9"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="8.5"
        fontWeight="800"
        fill={fillText}
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {letter}
      </text>
    </svg>
  )
}

function DpadIcon({ size }: SvgProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 18 18"
      aria-hidden style={{ pointerEvents: 'none', flexShrink: 0 }}
    >
      <path d="M6,0 h6 v6 h6 v6 h-6 v6 h-6 v-6 h-6 v-6 h6 z" fill={FS} />
    </svg>
  )
}

function StartIcon({ size }: SvgProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 18 18"
      aria-hidden style={{ pointerEvents: 'none', flexShrink: 0 }}
    >
      <rect x="1.5" y="1.5" width="15" height="15" rx="3.5" fill={FC} />
      <rect x="4" y="5.5"  width="10" height="1.5" rx="0.75" fill={FT} />
      <rect x="4" y="8.25" width="10" height="1.5" rx="0.75" fill={FT} />
      <rect x="4" y="11"   width="10" height="1.5" rx="0.75" fill={FT} />
    </svg>
  )
}

// Cores padrão dos botões físicos por tipo de controle
const CORES_BOTAO: Record<TipoGamepad, Partial<Record<BotaoID, string>>> = {
  xbox: {
    confirmar:   '#58B955',
    voltar:      '#D74B2E',
    acao:        '#4B9CD3',
    alternativo: '#F9C125',
  },
  playstation: {
    confirmar:   '#3F88D4',
    voltar:      '#D83F3F',
    acao:        '#DC5090',
    alternativo: '#47A663',
  },
  generico: {
    confirmar:   '#58B955',
    voltar:      '#D74B2E',
    acao:        '#4B9CD3',
    alternativo: '#F9C125',
  },
}

const ICONES: Record<TipoGamepad, Record<BotaoID, IconDef>> = {
  xbox: {
    dpad:        { t: 'dpad' },
    confirmar:   { t: 'face', letter: 'A' },
    voltar:      { t: 'face', letter: 'B' },
    acao:        { t: 'face', letter: 'X' },
    alternativo: { t: 'face', letter: 'Y' },
    start:       { t: 'start' },
  },
  playstation: {
    dpad:        { t: 'dpad' },
    confirmar:   { t: 'face', letter: '×' },
    voltar:      { t: 'face', letter: '○' },
    acao:        { t: 'face', letter: '□' },
    alternativo: { t: 'face', letter: '△' },
    start:       { t: 'start' },
  },
  generico: {
    dpad:        { t: 'dpad' },
    confirmar:   { t: 'face', letter: 'A' },
    voltar:      { t: 'face', letter: 'B' },
    acao:        { t: 'face', letter: 'X' },
    alternativo: { t: 'face', letter: 'Y' },
    start:       { t: 'start' },
  },
}

interface GamepadIconProps {
  botao: BotaoID
  tipo: TipoGamepad
  /** Cor explícita. Quando definida, texto fica branco. */
  color?: string
  /** Usa a cor padrão do botão físico (A=verde, B=vermelho, X=azul…). */
  padrao?: boolean
  size?: number
}

export function GamepadIcon({ botao, tipo, color, padrao = false, size = 18 }: GamepadIconProps) {
  const efetivo = color ?? (padrao ? CORES_BOTAO[tipo]?.[botao] : undefined)
  const def = ICONES[tipo][botao]
  if (def.t === 'dpad')  return <DpadIcon size={size} />
  if (def.t === 'start') return <StartIcon size={size} />
  return <FaceButton letter={def.letter} size={size} color={efetivo} />
}
