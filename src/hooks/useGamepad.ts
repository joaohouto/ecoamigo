'use client'
import { useEffect, useRef, useCallback } from 'react'

export interface GamepadHandlers {
  onCima?: () => void
  onBaixo?: () => void
  onEsquerda?: () => void
  onDireita?: () => void
  onConfirmar?: () => void
  onVoltar?: () => void
  onStart?: () => void
}

export function useGamepad(handlers: GamepadHandlers) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const frameRef = useRef<number>(0)
  const botaoAnteriorRef = useRef<Map<string, boolean>>(new Map())
  const analogAnteriorRef = useRef({ x: 0, y: 0 })

  const processar = useCallback(() => {
    const gamepads = navigator.getGamepads()

    for (const gp of gamepads) {
      if (!gp) continue

      // D-pad e botões padrão (mapeamento Xbox/PlayStation)
      const mapeamento: Array<{ idx: number; acao: () => void }> = [
        { idx: 0, acao: () => handlersRef.current.onConfirmar?.() },  // A / Cruz
        { idx: 1, acao: () => handlersRef.current.onVoltar?.() },     // B / Círculo
        { idx: 9, acao: () => handlersRef.current.onStart?.() },      // Start / Options
        { idx: 12, acao: () => handlersRef.current.onCima?.() },      // D-pad cima
        { idx: 13, acao: () => handlersRef.current.onBaixo?.() },     // D-pad baixo
        { idx: 14, acao: () => handlersRef.current.onEsquerda?.() },  // D-pad esquerda
        { idx: 15, acao: () => handlersRef.current.onDireita?.() },   // D-pad direita
      ]

      for (const { idx, acao } of mapeamento) {
        const pressionado = gp.buttons[idx]?.pressed ?? false
        const chave = `${gp.index}_${idx}`
        const eraPresionado = botaoAnteriorRef.current.get(chave) ?? false

        if (pressionado && !eraPresionado) acao()
        botaoAnteriorRef.current.set(chave, pressionado)
      }

      // Analógico esquerdo com detecção de borda
      const axisX = gp.axes[0] ?? 0
      const axisY = gp.axes[1] ?? 0
      const threshold = 0.7
      const ant = analogAnteriorRef.current

      if (axisX > threshold && ant.x <= threshold) handlersRef.current.onDireita?.()
      if (axisX < -threshold && ant.x >= -threshold) handlersRef.current.onEsquerda?.()
      if (axisY > threshold && ant.y <= threshold) handlersRef.current.onBaixo?.()
      if (axisY < -threshold && ant.y >= -threshold) handlersRef.current.onCima?.()

      analogAnteriorRef.current = { x: axisX, y: axisY }
    }

    frameRef.current = requestAnimationFrame(processar)
  }, [])

  useEffect(() => {
    frameRef.current = requestAnimationFrame(processar)
    return () => cancelAnimationFrame(frameRef.current)
  }, [processar])
}
