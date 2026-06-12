'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import todasPerguntas from '@/data/perguntas.json'
import { useGameStore } from '@/store/gameStore'
import { useGamepad } from '@/hooks/useGamepad'
import type { Pergunta } from '@/types'

const TOTAL_PERGUNTAS = 15
const TEMPO_MAX = 20
const PONTOS_ACERTO = 100
const BONUS_RAPIDO = 50
const BONUS_MEDIO = 25

const LETRAS = ['A', 'B', 'C', 'D'] as const

const EMOJI_CATEGORIA: Record<string, string> = {
  animais: '🦜',
  bioma: '🌿',
  sustentabilidade: '♻️',
  coleta_seletiva: '🗑️',
}

const LABEL_CATEGORIA: Record<string, string> = {
  animais: 'Animais',
  bioma: 'Bioma',
  sustentabilidade: 'Sustentabilidade',
  coleta_seletiva: 'Coleta Seletiva',
}

function embaralhar<T>(arr: T[]): T[] {
  const c = [...arr]
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[c[i], c[j]] = [c[j], c[i]]
  }
  return c
}

type FaseRodada = 'respondendo' | 'feedback'

// ---------------------------------------------------------------------------
// TelaInicio
// ---------------------------------------------------------------------------

function TelaInicio({ onIniciar }: { onIniciar: () => void }) {
  return (
    <main className="min-h-screen bg-fundo flex flex-col items-center justify-center gap-8 px-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.span
          className="text-8xl block mb-4"
          animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          🌿
        </motion.span>
        <h1
          className="text-5xl md:text-6xl text-azul-reciclagem mb-3"
          style={{ fontFamily: 'var(--font-fredoka)' }}
        >
          Quiz Pantanal
        </h1>
        <p
          className="text-lg md:text-xl text-marrom-terra max-w-md mx-auto"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          Teste seus conhecimentos sobre o maior bioma úmido do mundo!
        </p>
      </motion.div>

      <motion.div
        className="bg-white rounded-2xl p-6 shadow-md max-w-sm w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2
          className="text-xl text-azul-reciclagem mb-4 font-bold"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          Como jogar:
        </h2>
        <ul
          className="space-y-2 text-marrom-terra text-base"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          <li>🌿 {TOTAL_PERGUNTAS} perguntas aleatórias por rodada</li>
          <li>⏱️ {TEMPO_MAX} segundos por pergunta</li>
          <li>✅ +{PONTOS_ACERTO} pts por resposta correta</li>
          <li>⚡ Resposta em menos de 5s = bônus de +{BONUS_RAPIDO} pts!</li>
          <li>🗂️ Temas: animais, bioma, sustentabilidade e reciclagem</li>
        </ul>
      </motion.div>

      <motion.button
        onClick={onIniciar}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-12 py-4 bg-azul-reciclagem text-white rounded-full text-2xl font-bold shadow-lg hover:opacity-90 transition-opacity"
        style={{ fontFamily: 'var(--font-fredoka)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Começar! 🌿
      </motion.button>

      <Link
        href="/"
        className="text-marrom-terra hover:text-azul-reciclagem transition-colors text-base"
        style={{ fontFamily: 'var(--font-nunito)' }}
      >
        ← Voltar ao Menu
      </Link>
    </main>
  )
}

// ---------------------------------------------------------------------------
// TelaFinal
// ---------------------------------------------------------------------------

function TelaFinal({
  pontuacao,
  acertos,
  onReiniciar,
}: {
  pontuacao: number
  acertos: number
  onReiniciar: () => void
}) {
  const maximo = TOTAL_PERGUNTAS * (PONTOS_ACERTO + BONUS_RAPIDO)
  const pct = Math.round((acertos / TOTAL_PERGUNTAS) * 100)

  const { emoji, texto } =
    pct >= 80
      ? { emoji: '🏆', texto: 'Mestre do Pantanal! Conhecimento incrível!' }
      : pct >= 60
      ? { emoji: '🌿', texto: 'Muito bem! Você conhece bem o Pantanal!' }
      : pct >= 40
      ? { emoji: '🌱', texto: 'Bom começo! Continue aprendendo sobre o bioma!' }
      : { emoji: '📚', texto: 'Que tal conhecer mais sobre o Pantanal?' }

  return (
    <main className="min-h-screen bg-fundo flex flex-col items-center justify-center gap-6 px-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <span className="text-8xl block mb-3">{emoji}</span>
        <h1
          className="text-5xl text-azul-reciclagem mb-2"
          style={{ fontFamily: 'var(--font-fredoka)' }}
        >
          Fim do Quiz!
        </h1>
        <p className="text-xl text-marrom-terra" style={{ fontFamily: 'var(--font-nunito)' }}>
          {texto}
        </p>
      </motion.div>

      <motion.div
        className="bg-white rounded-3xl p-8 shadow-xl text-center min-w-[260px]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex gap-8 justify-center mb-4">
          <div>
            <p className="text-sm text-gray-400 mb-1" style={{ fontFamily: 'var(--font-nunito)' }}>
              Acertos
            </p>
            <p
              className="text-5xl font-bold text-verde-primario"
              style={{ fontFamily: 'var(--font-fredoka)' }}
            >
              {acertos}
              <span className="text-2xl text-gray-400 font-normal">/{TOTAL_PERGUNTAS}</span>
            </p>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <p className="text-sm text-gray-400 mb-1" style={{ fontFamily: 'var(--font-nunito)' }}>
              Pontuação
            </p>
            <p
              className="text-5xl font-bold text-azul-reciclagem"
              style={{ fontFamily: 'var(--font-fredoka)' }}
            >
              {pontuacao}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-300 mt-2" style={{ fontFamily: 'var(--font-nunito)' }}>
          máximo: {maximo} pts
        </p>
      </motion.div>

      <div className="flex flex-wrap gap-3 justify-center">
        <motion.button
          onClick={onReiniciar}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-azul-reciclagem text-white rounded-full text-xl font-bold hover:opacity-90 transition-opacity shadow"
          style={{ fontFamily: 'var(--font-fredoka)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Jogar de novo!
        </motion.button>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <Link
            href="/placar"
            className="px-8 py-3 bg-verde-primario text-white rounded-full text-xl font-bold hover:bg-verde-acento transition-colors shadow block"
            style={{ fontFamily: 'var(--font-fredoka)' }}
          >
            Ver Placar
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <Link
            href="/"
            className="px-8 py-3 border-2 border-marrom-terra text-marrom-terra rounded-full text-xl font-bold hover:bg-marrom-terra hover:text-white transition-colors block"
            style={{ fontFamily: 'var(--font-fredoka)' }}
          >
            Menu
          </Link>
        </motion.div>
      </div>
    </main>
  )
}

// ---------------------------------------------------------------------------
// TimerBar
// ---------------------------------------------------------------------------

function TimerBar({ tempo, maximo }: { tempo: number; maximo: number }) {
  const pct = (tempo / maximo) * 100

  const cor =
    pct > 50
      ? 'bg-verde-acento'
      : pct > 25
      ? 'bg-yellow-400'
      : 'bg-red-500'

  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <motion.div
        className={`h-full rounded-full transition-colors duration-500 ${cor}`}
        style={{ width: `${pct}%` }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: 'linear' }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Jogo principal
// ---------------------------------------------------------------------------

export default function QuizPage() {
  const { estado, iniciarJogo, finalizarJogo, adicionarPontos, pontuacao } =
    useGameStore()

  const [rodada, setRodada] = useState<Pergunta[]>([])
  const [indice, setIndice] = useState(0)
  const [fase, setFase] = useState<FaseRodada>('respondendo')
  const [selecionado, setSelecionado] = useState<number | null>(null)
  const [esgotou, setEsgotou] = useState(false)
  const [tempo, setTempo] = useState(TEMPO_MAX)
  const [acertos, setAcertos] = useState(0)
  const [tempoInicio, setTempoInicio] = useState(0)
  const [foco, setFoco] = useState(0)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const perguntaAtual = rodada[indice]

  const pararTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const iniciarTimer = useCallback(() => {
    pararTimer()
    setTempo(TEMPO_MAX)
    setTempoInicio(Date.now())
    timerRef.current = setInterval(() => {
      setTempo((t) => {
        if (t <= 1) return 0
        return t - 1
      })
    }, 1000)
  }, [pararTimer])

  // Tempo esgotou → tratar como erro e avançar
  useEffect(() => {
    if (tempo === 0 && fase === 'respondendo') {
      pararTimer()
      setEsgotou(true)
      setSelecionado(null)
      setFase('feedback')
    }
  }, [tempo, fase, pararTimer])

  const avancar = useCallback(() => {
    const proximo = indice + 1
    if (proximo >= TOTAL_PERGUNTAS) {
      finalizarJogo()
      return
    }
    setIndice(proximo)
    setSelecionado(null)
    setEsgotou(false)
    setFase('respondendo')
    iniciarTimer()
  }, [indice, finalizarJogo, iniciarTimer])

  // Cleanup ao desmontar
  useEffect(() => () => pararTimer(), [pararTimer])

  // Resetar foco a cada nova pergunta
  useEffect(() => { setFoco(0) }, [indice])

  // Gamepad
  useGamepad({
    onCima:      () => { if (fase === 'respondendo') setFoco((f) => (f - 1 + 4) % 4) },
    onBaixo:     () => { if (fase === 'respondendo') setFoco((f) => (f + 1) % 4) },
    onEsquerda:  () => { if (fase === 'respondendo') setFoco((f) => (f - 1 + 4) % 4) },
    onDireita:   () => { if (fase === 'respondendo') setFoco((f) => (f + 1) % 4) },
    onConfirmar: () => {
      if (estado === 'idle' || estado === 'finalizado') { iniciar(); return }
      if (fase === 'respondendo') responder(foco)
      else if (fase === 'feedback') avancar()
    },
  })

  const iniciar = useCallback(() => {
    pararTimer()
    iniciarJogo('quiz')
    const sorteadas = embaralhar(todasPerguntas as Pergunta[]).slice(0, TOTAL_PERGUNTAS)
    setRodada(sorteadas)
    setIndice(0)
    setSelecionado(null)
    setEsgotou(false)
    setAcertos(0)
    setFase('respondendo')
    // Timer inicia no próximo tick para garantir que o estado já foi aplicado
    setTimeout(() => {
      setTempo(TEMPO_MAX)
      setTempoInicio(Date.now())
      timerRef.current = setInterval(() => {
        setTempo((t) => (t <= 1 ? 0 : t - 1))
      }, 1000)
    }, 0)
  }, [pararTimer, iniciarJogo])

  const responder = (opcaoIdx: number) => {
    if (fase !== 'respondendo' || !perguntaAtual) return

    pararTimer()
    const elapsed = (Date.now() - tempoInicio) / 1000
    const correto = opcaoIdx === perguntaAtual.resposta_correta

    setSelecionado(opcaoIdx)
    setEsgotou(false)
    setFase('feedback')

    if (correto) {
      let pts = PONTOS_ACERTO
      if (elapsed < 5) pts += BONUS_RAPIDO
      else if (elapsed < 10) pts += BONUS_MEDIO
      adicionarPontos(pts)
      setAcertos((a) => a + 1)
    }
  }

  // ---------------------------------------------------------------------------
  // Renders condicionais
  // ---------------------------------------------------------------------------

  if (estado === 'idle') return <TelaInicio onIniciar={iniciar} />

  if (estado === 'finalizado') {
    return <TelaFinal pontuacao={pontuacao} acertos={acertos} onReiniciar={iniciar} />
  }

  if (!perguntaAtual) return null

  // ---------------------------------------------------------------------------
  // Tela do jogo
  // ---------------------------------------------------------------------------

  const respostaCorreta = perguntaAtual.resposta_correta

  return (
    <main className="min-h-screen bg-fundo flex flex-col items-center justify-center gap-5 px-4 py-8">
      {/* Barra de topo */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <div>
          <p className="text-xs text-marrom-terra uppercase tracking-wide" style={{ fontFamily: 'var(--font-nunito)' }}>
            Pergunta
          </p>
          <p className="text-3xl font-bold text-azul-reciclagem" style={{ fontFamily: 'var(--font-fredoka)' }}>
            {indice + 1}
            <span className="text-lg text-marrom-terra font-normal"> / {TOTAL_PERGUNTAS}</span>
          </p>
        </div>

        {/* Bolinhas de progresso */}
        <div className="hidden sm:flex gap-1 items-center flex-wrap justify-center max-w-[200px]">
          {Array.from({ length: TOTAL_PERGUNTAS }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i < indice ? 'w-3 h-3 bg-verde-acento' : i === indice ? 'w-4 h-4 bg-azul-reciclagem' : 'w-2 h-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="text-right">
          <p className="text-xs text-marrom-terra uppercase tracking-wide" style={{ fontFamily: 'var(--font-nunito)' }}>
            Pontos
          </p>
          <p className="text-3xl font-bold text-marrom-terra" style={{ fontFamily: 'var(--font-fredoka)' }}>
            {pontuacao}
          </p>
        </div>
      </div>

      {/* Timer */}
      <div className="w-full max-w-2xl flex items-center gap-3">
        <TimerBar tempo={tempo} maximo={TEMPO_MAX} />
        <span
          className={`text-lg font-bold min-w-[2.5rem] text-right transition-colors ${
            tempo <= 5 ? 'text-red-500' : 'text-marrom-terra'
          }`}
          style={{ fontFamily: 'var(--font-fredoka)' }}
        >
          {tempo}s
        </span>
      </div>

      {/* Card da pergunta */}
      <AnimatePresence mode="wait">
        <motion.div
          key={indice}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-6"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          {/* Categoria */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{EMOJI_CATEGORIA[perguntaAtual.categoria] ?? '❓'}</span>
            <span
              className="text-sm font-bold text-azul-reciclagem uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-nunito)' }}
            >
              {LABEL_CATEGORIA[perguntaAtual.categoria] ?? perguntaAtual.categoria}
            </span>
          </div>

          {/* Enunciado */}
          <p
            className="text-xl md:text-2xl text-gray-800 leading-snug"
            style={{ fontFamily: 'var(--font-nunito)', fontWeight: 700 }}
          >
            {perguntaAtual.enunciado}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Opções */}
      <div className="w-full max-w-2xl flex flex-col gap-3">
        {perguntaAtual.opcoes.map((opcao, i) => {
          let variante: 'normal' | 'correto' | 'errado' | 'neutro' = 'normal'
          if (fase === 'feedback') {
            if (i === respostaCorreta) variante = 'correto'
            else if (i === selecionado) variante = 'errado'
            else variante = 'neutro'
          }

          const estilos = {
            normal: 'border-gray-200 hover:border-azul-reciclagem hover:bg-blue-50 bg-white',
            correto: 'border-verde-acento bg-green-50 text-verde-primario',
            errado:  'border-red-400 bg-red-50 text-red-600',
            neutro:  'border-gray-100 bg-gray-50 opacity-50',
          }

          const letraEstilo = {
            normal:  'bg-gray-100 text-gray-500',
            correto: 'bg-verde-acento text-white',
            errado:  'bg-red-400 text-white',
            neutro:  'bg-gray-200 text-gray-400',
          }

          return (
            <motion.button
              key={i}
              onClick={() => responder(i)}
              disabled={fase !== 'respondendo'}
              whileHover={fase === 'respondendo' ? { scale: 1.01 } : {}}
              whileTap={fase === 'respondendo' ? { scale: 0.99 } : {}}
              className={`
                flex items-center gap-4 w-full rounded-xl border-2 p-4
                text-left transition-all duration-200 cursor-pointer
                disabled:cursor-default
                ${estilos[variante]}
                ${fase === 'respondendo' && i === foco ? 'ring-4 ring-yellow-400 ring-offset-1' : ''}
              `}
            >
              <span
                className={`
                  flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
                  text-base font-bold transition-colors duration-200
                  ${letraEstilo[variante]}
                `}
                style={{ fontFamily: 'var(--font-fredoka)' }}
              >
                {LETRAS[i]}
              </span>
              <span
                className="text-base md:text-lg font-semibold text-gray-700"
                style={{ fontFamily: 'var(--font-nunito)' }}
              >
                {opcao}
              </span>
              {fase === 'feedback' && i === respostaCorreta && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto text-2xl"
                >
                  ✓
                </motion.span>
              )}
              {fase === 'feedback' && i === selecionado && i !== respostaCorreta && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto text-2xl"
                >
                  ✗
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Feedback / explicação + botão de avanço */}
      <AnimatePresence>
        {fase === 'feedback' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className={`
              w-full max-w-2xl rounded-2xl px-5 py-4 text-white
              ${esgotou ? 'bg-orange-500' : selecionado === respostaCorreta ? 'bg-verde-acento' : 'bg-red-500'}
            `}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p
                  className="text-lg font-bold mb-1"
                  style={{ fontFamily: 'var(--font-fredoka)' }}
                >
                  {esgotou
                    ? '⏰ Tempo esgotado!'
                    : selecionado === respostaCorreta
                    ? '✓ Correto!'
                    : '✗ Incorreto!'}
                </p>
                {perguntaAtual.explicacao && (
                  <p className="text-sm opacity-90" style={{ fontFamily: 'var(--font-nunito)' }}>
                    {perguntaAtual.explicacao}
                  </p>
                )}
              </div>

              <motion.button
                onClick={avancar}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-shrink-0 flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-4 py-2 font-bold text-sm whitespace-nowrap"
                style={{ fontFamily: 'var(--font-fredoka)' }}
              >
                {indice + 1 >= TOTAL_PERGUNTAS ? 'Ver resultado' : 'Próxima'} →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
