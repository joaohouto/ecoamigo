'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { useGamepad } from '@/hooks/useGamepad'

interface ItemMenu {
  href: string
  titulo: string
  descricao: string
  emoji: string
  corFundo: string
  corTexto: string
}

const itensMenu: ItemMenu[] = [
  {
    href: '/sons',
    titulo: 'Sons do Pantanal',
    descricao: 'Ouça o som e descubra qual animal fez esse barulho!',
    emoji: '🎵',
    corFundo: '#2D7D2D',
    corTexto: '#fff',
  },
  {
    href: '/quiz',
    titulo: 'Quiz Pantanal',
    descricao: 'Responda perguntas sobre o maior santuário natural do Brasil!',
    emoji: '🌿',
    corFundo: '#1565C0',
    corTexto: '#fff',
  },
  {
    href: '/placar',
    titulo: 'Placar',
    descricao: 'Veja quem são os maiores guardiões do Pantanal!',
    emoji: '🏆',
    corFundo: '#8B4513',
    corTexto: '#fff',
  },
]

const variantesContainer = {
  oculto: {},
  visivel: {
    transition: { staggerChildren: 0.15 },
  },
}

const variantesCard = {
  oculto: { opacity: 0, y: 40 },
  visivel: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Home() {
  const [foco, setFoco] = useState(0)
  const router = useRouter()

  useGamepad({
    onEsquerda: () => setFoco((f) => Math.max(0, f - 1)),
    onDireita: () => setFoco((f) => Math.min(itensMenu.length - 1, f + 1)),
    onCima: () => setFoco((f) => Math.max(0, f - 1)),
    onBaixo: () => setFoco((f) => Math.min(itensMenu.length - 1, f + 1)),
    onConfirmar: () => router.push(itensMenu[foco].href),
  })

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-fundo">
      {/* Cabeçalho */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1
          className="text-5xl md:text-7xl lg:text-8xl text-verde-primario mb-3 leading-tight"
          style={{ fontFamily: 'var(--font-fredoka)' }}
        >
          🌱 ECO AMIGO
        </h1>
        <p
          className="text-xl md:text-2xl text-marrom-terra font-semibold"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          Juntos por um mundo mais verde!
        </p>
      </motion.div>

      {/* Cards do menu */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl"
        variants={variantesContainer}
        initial="oculto"
        animate="visivel"
      >
        {itensMenu.map((item, idx) => (
          <motion.div key={item.href} variants={variantesCard}>
            <Link href={item.href} className="block">
              <motion.div
                className={`rounded-3xl p-8 cursor-pointer shadow-lg flex flex-col items-center text-center gap-4 select-none transition-shadow ${
                  foco === idx ? 'ring-4 ring-white ring-offset-4 ring-offset-fundo shadow-2xl' : ''
                }`}
                style={{ backgroundColor: item.corFundo, color: item.corTexto }}
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <span className="text-6xl md:text-7xl">{item.emoji}</span>
                <h2
                  className="text-2xl md:text-3xl font-bold leading-tight"
                  style={{ fontFamily: 'var(--font-fredoka)' }}
                >
                  {item.titulo}
                </h2>
                <p
                  className="text-sm md:text-base opacity-90"
                  style={{ fontFamily: 'var(--font-nunito)' }}
                >
                  {item.descricao}
                </p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Rodapé */}
      <motion.div
        className="mt-12 text-center flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p
          className="text-sm text-marrom-terra/70 font-semibold"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          Pantanal Tech — Stand Interativo
        </p>
        <p
          className="text-xs text-marrom-terra/50"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          Uma realização do{' '}
          <span className="font-semibold text-marrom-terra/70">
            Curso de Direito da UEMS Aquidauana
          </span>
        </p>
      </motion.div>
    </main>
  )
}
