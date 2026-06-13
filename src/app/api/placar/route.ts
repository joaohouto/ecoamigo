import { NextRequest, NextResponse } from 'next/server'
import { conectarMongoDB } from '@/lib/mongodb'
import { rateLimiter } from '@/lib/rateLimiter'
import { verificarProfanidade } from '@/lib/profanityList'
import type { Jogo } from '@/types'

const SCORE_MAXIMO: Record<Jogo, number> = {
  sons: 6 * (100 + 50),   // 900
  quiz: 10 * (100 + 50),  // 1500
}

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

export async function GET() {
  try {
    const db = await conectarMongoDB()
    const registros = await db
      .collection('placar')
      .find({})
      .sort({ pontuacao: -1 })
      .limit(20)
      .toArray()
    return NextResponse.json(registros)
  } catch {
    // Fallback gracioso: retorna lista vazia sem expor o erro
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  // 1. Rate limiting
  const ip = getIP(req)
  try {
    await rateLimiter.consume(ip)
  } catch {
    return NextResponse.json(
      { mensagem: 'Calma aí! Aguarde alguns minutos para enviar novamente.' },
      { status: 429 },
    )
  }

  // 2. Parse do body
  let body: { nome?: unknown; pontuacao?: unknown; jogo?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ mensagem: 'Dados inválidos.' }, { status: 400 })
  }

  const { nome, pontuacao, jogo } = body

  // 3. Validação do nome
  if (
    typeof nome !== 'string' ||
    nome.length < 2 ||
    nome.length > 20 ||
    !/^[a-zA-ZÀ-ú0-9 ]+$/.test(nome) ||
    nome.trim().length < 2
  ) {
    return NextResponse.json(
      { mensagem: 'Nome inválido. Use entre 2 e 20 letras ou números.' },
      { status: 400 },
    )
  }

  // 4. Filtro de profanidade (inclui variantes leetspeak: pu74, c0rn0, etc.)
  if (verificarProfanidade(nome)) {
    return NextResponse.json(
      { mensagem: 'Que tal um apelido mais divertido? 🌿' },
      { status: 400 },
    )
  }

  // 5. Validação do jogo
  if (jogo !== 'sons' && jogo !== 'quiz') {
    return NextResponse.json({ mensagem: 'Jogo inválido.' }, { status: 400 })
  }

  // 6. Validação do score (anti-cheat)
  if (
    typeof pontuacao !== 'number' ||
    !Number.isInteger(pontuacao) ||
    pontuacao < 0 ||
    pontuacao > SCORE_MAXIMO[jogo as Jogo]
  ) {
    return NextResponse.json({ mensagem: 'Pontuação inválida.' }, { status: 400 })
  }

  // 7. Inserção no MongoDB
  try {
    const db = await conectarMongoDB()
    const doc = {
      nome: nome.trim(),
      pontuacao,
      jogo,
      timestamp: new Date(),
    }
    const resultado = await db.collection('placar').insertOne(doc)
    return NextResponse.json({ ...doc, _id: resultado.insertedId }, { status: 201 })
  } catch {
    return NextResponse.json(
      { mensagem: 'Erro ao salvar. Tente novamente.' },
      { status: 500 },
    )
  }
}
