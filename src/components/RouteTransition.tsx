'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { usePathname } from 'next/navigation'

// Duração da animação de saída em ms. Deve ser igual ao duration abaixo.
const EXIT_MS = 180

export default function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // `displayed` guarda os filhos efetivamente renderizados.
  // Enquanto a saída anima, mantemos os filhos ANTIGOS em tela.
  // Só trocamos para os novos após a animação de saída completar.
  const [displayed, setDisplayed] = useState(children)

  // Chave muda junto com `displayed` para forçar remount e aplicar `initial`.
  const [displayKey, setDisplayKey] = useState(pathname)

  const [exiting, setExiting] = useState(false)
  const prevPathRef  = useRef(pathname)
  const childrenRef  = useRef(children)
  childrenRef.current = children

  useEffect(() => {
    if (pathname === prevPathRef.current) return
    prevPathRef.current = pathname

    // 1. Anima saída da página atual
    setExiting(true)

    const t = setTimeout(() => {
      // 2. Após saída: troca conteúdo → remount → animação de entrada
      setDisplayed(childrenRef.current)
      setDisplayKey(pathname)
      setExiting(false)
    }, EXIT_MS)

    return () => clearTimeout(t)
  }, [pathname])

  return (
    <motion.div
      key={displayKey}
      initial={{ opacity: 0, y: 16 }}
      animate={exiting ? { opacity: 0, y: -16 } : { opacity: 1, y: 0 }}
      transition={{ duration: EXIT_MS / 1000, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {displayed}
    </motion.div>
  )
}
