'use client'
import { motion } from 'motion/react'
import { useGamepadStatus } from '@/hooks/useGamepadStatus'
import { GamepadIcon, type BotaoID } from '@/components/GamepadIcon'

export type { BotaoID }

export interface Hint {
  botao: BotaoID
  label: string
}

interface Props {
  hints: Hint[]
}

export default function GamepadHint({ hints }: Props) {
  const { conectado, tipo } = useGamepadStatus()

  return (
    <motion.div
      className={`
        fixed bottom-3 left-1/2 -translate-x-1/2 z-50
        whitespace-nowrap flex items-center gap-3
        pointer-events-none
        ${conectado ? 'flex' : 'hidden lg:flex'}
      `}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      {hints.map(({ botao, label }, i) => (
        <div key={botao} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-black/20 text-xs select-none">·</span>}
          <GamepadIcon botao={botao} tipo={tipo} />
          <span
            className="text-black/35 text-xs font-medium tracking-wide"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            {label}
          </span>
        </div>
      ))}
    </motion.div>
  )
}
