'use client'
import { useState, useCallback } from 'react'
import type { EntradaPlacarLocal, EntradaPlacar, Jogo } from '@/types'

const CHAVE_LOCAL = 'ecoamigo_placar'

function carregarLocal(): EntradaPlacarLocal[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CHAVE_LOCAL) ?? '[]')
  } catch {
    return []
  }
}

function salvarLocal(entradas: EntradaPlacarLocal[]) {
  localStorage.setItem(CHAVE_LOCAL, JSON.stringify(entradas))
}

export function usePlacar() {
  const [placarLocal, setPlacarLocal] = useState<EntradaPlacarLocal[]>(carregarLocal)
  const [placarGlobal, setPlacarGlobal] = useState<EntradaPlacar[]>([])
  const [carregandoGlobal, setCarregandoGlobal] = useState(false)
  const [online, setOnline] = useState(true)

  const salvar = useCallback(
    (nome: string, pontuacao: number, jogo: Jogo): EntradaPlacarLocal => {
      const entrada: EntradaPlacarLocal = {
        id: crypto.randomUUID(),
        nome,
        pontuacao,
        jogo,
        timestamp: new Date().toISOString(),
        enviado: false,
      }
      const atualizadas = [...placarLocal, entrada].sort((a, b) => b.pontuacao - a.pontuacao)
      salvarLocal(atualizadas)
      setPlacarLocal(atualizadas)
      return entrada
    },
    [placarLocal],
  )

  const enviarGlobal = useCallback(
    async (entrada: EntradaPlacarLocal): Promise<boolean> => {
      try {
        const res = await fetch('/api/placar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: entrada.nome,
            pontuacao: entrada.pontuacao,
            jogo: entrada.jogo,
          }),
        })

        if (res.ok) {
          const atualizadas = placarLocal.map((e) =>
            e.id === entrada.id ? { ...e, enviado: true } : e,
          )
          salvarLocal(atualizadas)
          setPlacarLocal(atualizadas)
          setOnline(true)
          return true
        }
        return false
      } catch {
        setOnline(false)
        return false
      }
    },
    [placarLocal],
  )

  const buscarGlobal = useCallback(async () => {
    setCarregandoGlobal(true)
    try {
      const res = await fetch('/api/placar')
      if (res.ok) {
        const dados = await res.json()
        setPlacarGlobal(dados)
        setOnline(true)
      }
    } catch {
      setOnline(false)
    } finally {
      setCarregandoGlobal(false)
    }
  }, [])

  return { placarLocal, placarGlobal, carregandoGlobal, online, salvar, enviarGlobal, buscarGlobal }
}
