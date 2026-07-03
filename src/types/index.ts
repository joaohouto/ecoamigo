export type Jogo = 'sons' | 'quiz' | 'direito'

export type CategoriaQuiz =
  | 'animais'
  | 'bioma'
  | 'sustentabilidade'
  | 'coleta_seletiva'

export type CategoriaDireito =
  | 'constitucional'
  | 'civil'
  | 'penal'
  | 'trabalhista'

export type DificuldadePergunta = 'facil' | 'medio' | 'dificil'

export interface Pergunta {
  id: string
  dificuldade: DificuldadePergunta
  categoria: CategoriaQuiz
  enunciado: string
  opcoes: string[]         // sempre 4 opções
  resposta_correta: number // índice (0–3)
  explicacao?: string
}

export interface PerguntaDireito {
  id: string
  dificuldade: DificuldadePergunta
  categoria: CategoriaDireito
  enunciado: string
  opcoes: string[]         // sempre 4 opções
  resposta_correta: number // índice (0–3)
  explicacao?: string
}

export interface Animal {
  id: string
  nome: string
  nomeExibicao: string
  imagemUrl: string
  somUrl: string
}

export interface EntradaPlacar {
  _id?: string
  nome: string
  pontuacao: number
  jogo: Jogo
  timestamp: Date | string
}

export interface EntradaPlacarLocal {
  id: string
  nome: string
  pontuacao: number
  jogo: Jogo
  timestamp: string
  enviado: boolean
}

export type EstadoJogo = 'idle' | 'jogando' | 'finalizado'
