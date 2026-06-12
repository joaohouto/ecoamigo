import leoProfanity from 'leo-profanity'

// Palavrões comuns em português brasileiro
const palavroesPtBr = [
  'merda',
  'porra',
  'caralho',
  'buceta',
  'viado',
  'puta',
  'puto',
  'cu',
  'cuzao',
  'fdp',
  'filhadaputa',
  'arrombado',
  'corno',
  'vagabunda',
  'vadia',
  'desgraca',
  'desgracado',
  'filhodaputa',
  'foda',
  'fodase',
  'boiola',
  'otario',
  'imbecil',
  'idiota',
  'babaca',
  'burro',
  'cretino',
]

leoProfanity.loadDictionary('en')
leoProfanity.add(palavroesPtBr)

// Tabela de substituições leetspeak → letra equivalente
const LEET: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '2': 'z',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '6': 'g',
  '7': 't',
  '8': 'b',
  '9': 'g',
  '@': 'a',
  '$': 's',
  '!': 'i',
  '+': 't',
  '|': 'i',
}

function normalizarLeet(texto: string): string {
  return texto
    .toLowerCase()
    .split('')
    .map((c) => LEET[c] ?? c)
    .join('')
}

// Remove acentos para comparação (ex: "desgraça" → "desgraca")
function removerAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/**
 * Verifica profanidade contra o nome original, sem acentos e com leet normalizado.
 * Exportada para uso na API Route — não chamar no cliente.
 */
export function verificarProfanidade(nome: string): boolean {
  const semAcento = removerAcentos(nome.toLowerCase())
  const normalizado = normalizarLeet(semAcento)
  return (
    leoProfanity.check(nome) ||
    leoProfanity.check(semAcento) ||
    leoProfanity.check(normalizado)
  )
}

export const filter = leoProfanity
