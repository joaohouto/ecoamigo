'use client'
import { useState, useEffect } from 'react'

export type TipoGamepad = 'xbox' | 'playstation' | 'generico'

export interface GamepadStatus {
  conectado: boolean
  tipo: TipoGamepad
}

function detectarTipo(id: string): TipoGamepad {
  const l = id.toLowerCase()
  if (l.includes('xbox') || l.includes('xinput') || l.includes('045e')) return 'xbox'
  if (
    l.includes('playstation') ||
    l.includes('dualshock') ||
    l.includes('dualsense') ||
    l.includes('054c')
  )
    return 'playstation'
  return 'generico'
}

function lerGamepadAtivo(): GamepadStatus {
  const gps = navigator.getGamepads()
  for (const gp of gps) {
    if (gp) return { conectado: true, tipo: detectarTipo(gp.id) }
  }
  return { conectado: false, tipo: 'generico' }
}

export function useGamepadStatus(): GamepadStatus {
  const [status, setStatus] = useState<GamepadStatus>({ conectado: false, tipo: 'generico' })

  useEffect(() => {
    // Verifica gamepads já conectados na montagem
    setStatus(lerGamepadAtivo())

    const onConectado = (e: GamepadEvent) => {
      setStatus({ conectado: true, tipo: detectarTipo(e.gamepad.id) })
    }

    const onDesconectado = () => {
      setStatus(lerGamepadAtivo())
    }

    window.addEventListener('gamepadconnected', onConectado)
    window.addEventListener('gamepaddisconnected', onDesconectado)

    return () => {
      window.removeEventListener('gamepadconnected', onConectado)
      window.removeEventListener('gamepaddisconnected', onDesconectado)
    }
  }, [])

  return status
}
