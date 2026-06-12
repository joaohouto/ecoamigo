import { create } from 'zustand'
import type { Jogo, EstadoJogo, Pergunta, Animal } from '@/types'

interface GameStore {
  jogoAtual: Jogo | null
  estado: EstadoJogo
  pontuacao: number
  nomeJogador: string
  perguntaAtual: number
  perguntas: Pergunta[]
  animais: Animal[]

  setNome: (nome: string) => void
  iniciarJogo: (jogo: Jogo) => void
  finalizarJogo: () => void
  adicionarPontos: (pontos: number) => void
  avancarPergunta: () => void
  setPerguntas: (perguntas: Pergunta[]) => void
  setAnimais: (animais: Animal[]) => void
  resetar: () => void
}

const estadoInicial = {
  jogoAtual: null as Jogo | null,
  estado: 'idle' as EstadoJogo,
  pontuacao: 0,
  nomeJogador: '',
  perguntaAtual: 0,
  perguntas: [] as Pergunta[],
  animais: [] as Animal[],
}

export const useGameStore = create<GameStore>((set) => ({
  ...estadoInicial,

  setNome: (nome) => set({ nomeJogador: nome }),

  iniciarJogo: (jogo) =>
    set({ jogoAtual: jogo, estado: 'jogando', pontuacao: 0, perguntaAtual: 0 }),

  finalizarJogo: () => set({ estado: 'finalizado' }),

  adicionarPontos: (pontos) =>
    set((s) => ({ pontuacao: s.pontuacao + pontos })),

  avancarPergunta: () =>
    set((s) => ({ perguntaAtual: s.perguntaAtual + 1 })),

  setPerguntas: (perguntas) => set({ perguntas }),

  setAnimais: (animais) => set({ animais }),

  resetar: () => set(estadoInicial),
}))
