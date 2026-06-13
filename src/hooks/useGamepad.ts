'use client'
import { useEffect, useRef, useCallback } from 'react'

export interface GamepadHandlers {
  onCima?: () => void
  onBaixo?: () => void
  onEsquerda?: () => void
  onDireita?: () => void
  onConfirmar?: () => void
  onVoltar?: () => void
  onAcao?: () => void   // Y / Triângulo
  onStart?: () => void
}

const THRESHOLD = 0.65

// Estado booleano por direção — evita jitter quando o eixo oscila em torno do threshold
interface DirBool { esquerda: boolean; direita: boolean; cima: boolean; baixo: boolean }

export function useGamepad(handlers: GamepadHandlers) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const frameRef    = useRef<number>(0)
  // Edge-detection para botões digitais (D-pad, A, B, Start…)
  const botoesRef   = useRef<Map<string, boolean>>(new Map())
  // Edge-detection para analógico: booleano por direção, nunca jitter
  const analogRef   = useRef<DirBool>({ esquerda: false, direita: false, cima: false, baixo: false })

  const processar = useCallback(() => {
    const gamepads = navigator.getGamepads()

    for (const gp of gamepads) {
      if (!gp) continue

      // ── Botões digitais ────────────────────────────────────────────────────
      const mapeamento: Array<{ idx: number; acao: keyof GamepadHandlers }> = [
        { idx: 0,  acao: 'onConfirmar' }, // A / Cruz
        { idx: 1,  acao: 'onVoltar'    }, // B / Círculo
        { idx: 2,  acao: 'onAcao'      }, // X / Quadrado
        { idx: 9,  acao: 'onStart'     }, // Start / Options
        { idx: 12, acao: 'onCima'      }, // D-pad cima
        { idx: 13, acao: 'onBaixo'     }, // D-pad baixo
        { idx: 14, acao: 'onEsquerda'  }, // D-pad esquerda
        { idx: 15, acao: 'onDireita'   }, // D-pad direita
      ]

      for (const { idx, acao } of mapeamento) {
        const pressionado = gp.buttons[idx]?.pressed ?? false
        const chave = `${gp.index}_${idx}`
        const eraPresionado = botoesRef.current.get(chave) ?? false

        if (pressionado && !eraPresionado) handlersRef.current[acao]?.()
        botoesRef.current.set(chave, pressionado)
      }

      // ── Analógico esquerdo ─────────────────────────────────────────────────
      // Rastreamos como booleano por direção para evitar disparo múltiplo
      // quando o valor do eixo oscila em torno do threshold (jitter).
      const axisX = gp.axes[0] ?? 0
      const axisY = gp.axes[1] ?? 0

      const dir: DirBool = {
        esquerda: axisX < -THRESHOLD,
        direita:  axisX >  THRESHOLD,
        cima:     axisY < -THRESHOLD,
        baixo:    axisY >  THRESHOLD,
      }

      const ant = analogRef.current
      if (dir.esquerda && !ant.esquerda) handlersRef.current.onEsquerda?.()
      if (dir.direita  && !ant.direita)  handlersRef.current.onDireita?.()
      if (dir.cima     && !ant.cima)     handlersRef.current.onCima?.()
      if (dir.baixo    && !ant.baixo)    handlersRef.current.onBaixo?.()

      analogRef.current = dir
    }

    frameRef.current = requestAnimationFrame(processar)
  }, [])

  useEffect(() => {
    frameRef.current = requestAnimationFrame(processar)
    return () => cancelAnimationFrame(frameRef.current)
  }, [processar])
}
