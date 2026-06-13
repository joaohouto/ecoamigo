// Sons de interface — singleton lazy-loaded via Howler
// Arquivo seguro para chamar em qualquer componente cliente

type SomUI = 'navegar' | 'selecionar' | 'acertar' | 'errar' | 'tick' | 'iniciar'

const ARQUIVOS: Record<SomUI, string> = {
  navegar:   '/ui/switch_001.ogg',
  selecionar: '/ui/select_001.ogg',
  acertar:   '/ui/confirmation_001.ogg',
  errar:     '/ui/error_001.ogg',
  tick:      '/ui/tick_001.ogg',
  iniciar:   '/ui/confirmation_004.ogg',
}

const VOLUME: Record<SomUI, number> = {
  navegar:   0.25,
  selecionar: 0.45,
  acertar:   0.55,
  errar:     0.50,
  tick:      0.35,
  iniciar:   0.55,
}

// Cache de instâncias — evita recarregar o mesmo arquivo várias vezes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<SomUI, any>()

export async function tocarUI(nome: SomUI): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const { Howl } = await import('howler')

    if (!cache.has(nome)) {
      const h = new Howl({
        src: [ARQUIVOS[nome]],
        volume: VOLUME[nome],
        preload: true,
      })
      cache.set(nome, h)
    }

    const h = cache.get(nome)
    h.play()
    console.log(`[uiSounds] tocarUI('${nome}') → ${ARQUIVOS[nome]}`)
  } catch {
    // Sons de UI são opcionais — falha silenciosa
  }
}
