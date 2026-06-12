'use client'
import { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'

export function useSound(src: string | string[]) {
  const howlRef = useRef<Howl | null>(null)
  const [tocando, setTocando] = useState(false)
  const srcs = Array.isArray(src) ? src : [src]

  useEffect(() => {
    howlRef.current = new Howl({
      src: srcs,
      onend: () => setTocando(false),
      onstop: () => setTocando(false),
    })

    return () => {
      howlRef.current?.unload()
    }
    // Recriar apenas quando o src mudar — comparação por valor via JSON
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(srcs)])

  const tocar = () => {
    howlRef.current?.play()
    setTocando(true)
  }

  const parar = () => {
    howlRef.current?.stop()
    setTocando(false)
  }

  return { tocar, parar, tocando }
}
