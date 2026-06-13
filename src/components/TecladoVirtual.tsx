'use client'

import { useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { useGamepad } from '@/hooks/useGamepad'
import { useGamepadStatus } from '@/hooks/useGamepadStatus'
import { GamepadIcon } from '@/components/GamepadIcon'
import { tocarUI } from '@/lib/uiSounds'

// Layout QWERTY em linhas
const LINHAS: string[][] = [
  ['1','2','3','4','5','6','7','8','9','0'],
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L','⌫'],
  ['Z','X','C','V','B','N','M',' ','✓'],
]

interface Props {
  valor: string
  maxLen?: number
  onChange: (v: string) => void
  onConfirmar: () => void
}

export function TecladoVirtual({ valor, maxLen = 20, onChange, onConfirmar }: Props) {
  const [linha, setLinha] = useState(1)
  const [col, setCol]     = useState(4)
  const { tipo } = useGamepadStatus()

  const digitar = useCallback((char: string) => {
    if (char === '⌫') {
      tocarUI('navegar')
      onChange(valor.slice(0, -1))
    } else if (char === '✓') {
      tocarUI('selecionar')
      onConfirmar()
    } else if (char === ' ') {
      if (valor.length < maxLen && !valor.endsWith(' ')) {
        tocarUI('navegar')
        onChange(valor + ' ')
      }
    } else {
      if (valor.length < maxLen) {
        tocarUI('navegar')
        onChange(valor + char)
      }
    }
  }, [valor, maxLen, onChange, onConfirmar])

  useGamepad({
    onCima: () => {
      setLinha(l => {
        const novo = (l - 1 + LINHAS.length) % LINHAS.length
        setCol(c => Math.min(c, LINHAS[novo].length - 1))
        tocarUI('navegar')
        return novo
      })
    },
    onBaixo: () => {
      setLinha(l => {
        const novo = (l + 1) % LINHAS.length
        setCol(c => Math.min(c, LINHAS[novo].length - 1))
        tocarUI('navegar')
        return novo
      })
    },
    onEsquerda: () => {
      setCol(c => {
        const n = (c - 1 + LINHAS[linha].length) % LINHAS[linha].length
        tocarUI('navegar')
        return n
      })
    },
    onDireita: () => {
      setCol(c => {
        const n = (c + 1) % LINHAS[linha].length
        tocarUI('navegar')
        return n
      })
    },
    onConfirmar: () => {
      digitar(LINHAS[linha][col])
    },
    onVoltar: () => {
      // B = apagar último caractere
      tocarUI('navegar')
      onChange(valor.slice(0, -1))
    },
    onStart: () => {
      // Start = confirmar nome
      tocarUI('selecionar')
      onConfirmar()
    },
  })

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      {/* Display do nome */}
      <div className="bg-gray-50 rounded-xl border-2 border-verde-primario/40 px-4 py-3 mb-3 min-h-[52px] flex items-center gap-2">
        <span
          className="text-2xl text-gray-800 tracking-widest flex-1"
          style={{ fontFamily: 'var(--font-nunito)', letterSpacing: '0.12em' }}
        >
          {valor
            ? <>{valor}<span className="animate-pulse opacity-60">|</span></>
            : <span className="text-gray-300 text-xl tracking-normal">Seu apelido...</span>
          }
        </span>
        <span className="text-xs text-gray-400 flex-shrink-0" style={{ fontFamily: 'var(--font-nunito)' }}>
          {valor.trim().length}/{maxLen}
        </span>
      </div>

      {/* Teclado */}
      <div className="bg-gray-100/80 rounded-2xl p-2.5 flex flex-col gap-1.5">
        {LINHAS.map((teclas, li) => (
          <div key={li} className="flex gap-1.5 justify-center">
            {teclas.map((tecla, ci) => {
              const focado = linha === li && col === ci

              let largura = 'w-9'
              let bg = 'bg-white text-gray-800'
              if (tecla === '✓') { largura = 'min-w-[3.5rem] px-3'; bg = 'bg-verde-primario text-white' }
              else if (tecla === '⌫') { largura = 'min-w-[2.5rem] px-2'; bg = 'bg-red-400 text-white' }
              else if (tecla === ' ') { largura = 'min-w-[5rem] px-4'; bg = 'bg-white text-gray-500' }

              return (
                <motion.button
                  key={`${li}-${ci}`}
                  type="button"
                  onClick={() => digitar(tecla)}
                  whileTap={{ scale: 0.85 }}
                  className={`
                    relative h-10 rounded-lg text-sm font-bold select-none transition-colors shadow-sm
                    ${largura} ${bg}
                    ${focado ? 'ring-[3px] ring-yellow-400 ring-offset-1 shadow-md' : ''}
                  `}
                  style={{ fontFamily: 'var(--font-fredoka)' }}
                >
                  {tecla === ' ' ? 'espaço' : tecla}
                </motion.button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-2 flex-wrap">
        {([
          { botao: 'dpad',      label: 'navegar'   },
          { botao: 'confirmar', label: 'confirmar', padrao: true },
          { botao: 'voltar',    label: 'apagar',    padrao: true },
          { botao: 'start',     label: 'salvar'     },
        ] as const).map(({ botao, label, ...rest }) => (
          <span key={botao} className="flex items-center gap-1 text-xs text-gray-400" style={{ fontFamily: 'var(--font-nunito)' }}>
            <GamepadIcon botao={botao} tipo={tipo} padrao={'padrao' in rest} size={16} />
            {label}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
