# ECO AMIGO — Pantanal Tech App

> Arquivo de contexto para o Claude Code. Leia este arquivo inteiro antes de qualquer ação.

---

## Visão Geral do Projeto

App educativo interativo para o stand do **Pantanal Tech**, voltado a crianças (a partir de ~6 anos), adolescentes e adultos. O visitante chega ao stand, interage com os jogos na TV ou em dispositivos, acumula pontos e pode registrar seu nome no placar.

**Nome:** ECO AMIGO  
**Slogan:** "Juntos por um mundo mais verde!"  
**Repositório:** Next.js com App Router + TypeScript

---

## Identidade Visual

| Token | Valor |
|---|---|
| Verde primário | `#2D7D2D` |
| Verde acento | `#4CAF50` |
| Marrom terra | `#8B4513` |
| Fundo | `#F5F5E8` (creme) |
| Azul reciclagem | `#1565C0` |
| Tipografia | Fredoka One (títulos) + Nunito (corpo) — Google Fonts |

Tom: alegre, lúdico, sem ser infantilizado. Funciona para qualquer faixa etária.  
Animações com **Framer Motion (motion/react)** são bem-vindas em todas as telas.

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS |
| Animações | Framer Motion (motion/react) |
| Áudio | Howler.js |
| Estado global | Zustand |
| Placar local | localStorage |
| Placar remoto | MongoDB Atlas via API Route interna |
| Gamepad | Gamepad API (hook customizado `useGamepad`) |
| Filtro de profanidade | `leo-profanity` (pt-BR + en) |
| Rate limiting | `rate-limiter-flexible` (in-memory) |

---

## Estrutura de Rotas

```
/                  → Home / Menu principal
/sons              → Jogo dos Sons do Pantanal
/quiz              → Quiz Pantanal
/placar            → Placar geral (local + remoto)
/api/placar        → API Route — CRUD no MongoDB Atlas
```

---

## Responsividade e Dispositivos

O app deve funcionar bem em:

- **TV do stand** (principal — via navegador em modo quiosque, landscape)
- Desktop / notebook
- Tablet
- Celular (portrait e landscape)

Use Tailwind breakpoints padrão. Na TV, fontes e botões devem ser grandes o suficiente para interação à distância. Priorize layout landscape para telas grandes.

---

## Suporte a Gamepad

Implementar hook `useGamepad` que mapeie:

- **D-pad / analógico esquerdo** → navegar entre opções/cards
- **Botão A (Xbox) / Cruz (PlayStation)** → confirmar seleção
- **Botão B / Círculo** → voltar / cancelar
- **Start / Options** → iniciar rodada / pausar

O hook deve funcionar no menu principal e dentro de ambos os jogos.

---

## Jogo 1 — Sons do Pantanal (`/sons`)

### Funcionamento
1. Um som de animal é reproduzido automaticamente (via Howler.js)
2. O visitante vê 4 cards, cada um com a ilustração de um animal
3. Seleciona o animal que acredita ter feito aquele som
4. Feedback visual + sonoro imediato (acerto/erro)
5. Próxima rodada

### Animais incluídos (expansível)
- Tuiuiú
- Jacaré
- Capivara
- Arara
- Onça
- Anta

### Assets
- Sons em `/public/sounds/` (MP3 e OGG para compatibilidade)
- Ilustrações em `/public/animals/` (PNG com fundo transparente, idealmente 512×512)

### Pontuação
- +100 pontos por acerto
- Bônus de velocidade: +50 se responder em menos de 5s, +25 em menos de 10s
- Rodada padrão: 6 perguntas (uma por animal), embaralhadas

### Lógica das opções
- A cada rodada, 1 animal correto + 3 distratores sorteados aleatoriamente dos outros animais
- Garantir que os distratores nunca se repitam em uma mesma pergunta

---

## Jogo 2 — Quiz Pantanal (`/quiz`)

### Funcionamento
1. Pergunta de múltipla escolha aparece na tela (4 opções)
2. Timer de 20 segundos por pergunta
3. Visitante seleciona uma opção
4. Feedback imediato + pontuação acumulada
5. Ao fim, tela de resultado com total de pontos

### Banco de Perguntas
- Arquivo estático: `/data/perguntas.json`
- Mínimo de 30 perguntas no banco
- A cada rodada, sortear 15 perguntas aleatórias
- Categorias:
  - `animais` — fauna do Pantanal
  - `bioma` — características do Pantanal
  - `sustentabilidade` — atitudes e consciência ambiental
  - `coleta_seletiva` — cores das lixeiras, reciclagem

### Estrutura do JSON de perguntas

```ts
interface Pergunta {
  id: string
  categoria: 'animais' | 'bioma' | 'sustentabilidade' | 'coleta_seletiva'
  enunciado: string
  opcoes: string[]          // sempre 4 opções
  resposta_correta: number  // índice (0–3)
  explicacao?: string       // frase curta exibida após o acerto/erro
}
```

### Pontuação
- +100 pontos por acerto
- Bônus de velocidade: +50 se responder em menos de 5s, +25 em menos de 10s
- Tempo esgotado sem resposta: 0 pontos

---

## Placar (`/placar`)

### Comportamento
- Salva nome + pontuação + jogo (`sons` | `quiz`) + timestamp no **localStorage** (local first)
- Exibe ranking local na tela imediatamente
- Botão **"Enviar ao placar geral"** → POST para `/api/placar` → MongoDB Atlas
- Exibe ranking global separado do local
- Graceful fallback: sem internet, apenas salva local e esconde botão de envio sem erro

### Tela do Placar
- Pode ficar aberta na TV entre partidas como "attractor screen"
- Mostrar Top 10 local e Top 10 global, lado a lado ou em abas
- Atualizar o ranking global a cada 30s via polling (se online)

---

## API Route — `/api/placar`

### `GET /api/placar`
Retorna os top 20 scores do MongoDB, ordenados por `pontuacao` DESC.

### `POST /api/placar`
Body:
```ts
{
  nome: string        // máx. 20 chars
  pontuacao: number
  jogo: 'sons' | 'quiz'
}
```
Insere o documento e retorna o registro criado.

### Conexão com MongoDB Atlas
- Connection string em variável de ambiente: `MONGODB_URI`
- Database: `ecoamigo`
- Collection: `placar`
- Usar driver nativo `mongodb` (não Mongoose)
- Criar arquivo `/lib/mongodb.ts` com singleton de conexão

---

## Proteção do Placar

Toda submissão ao `POST /api/placar` deve passar pelas seguintes camadas de validação, **nesta ordem**. Qualquer falha retorna `400` com mensagem amigável (em português).

### 1. Rate Limiting (anti-spam)
- Usar `rate-limiter-flexible` com store em memória (sem Redis — o app roda local)
- Limite: **5 submissões por IP a cada 10 minutos**
- Em caso de excesso: retornar `429` com mensagem `"Calma aí! Aguarde alguns minutos para enviar novamente."`
- Criar instância singleton em `/lib/rateLimiter.ts`

### 2. Validação do Nome
```ts
// Regras — rejeitar se qualquer uma falhar:
nome.length >= 2                          // mínimo 2 caracteres
nome.length <= 20                         // máximo 20 caracteres
/^[a-zA-ZÀ-ú0-9 ]+$/.test(nome)         // só letras (incl. acentos), números e espaços
nome.trim().length >= 2                   // não pode ser só espaços
```
Mensagem de erro: `"Nome inválido. Use entre 2 e 20 letras ou números."`

### 3. Filtro de Profanidade
- Usar `leo-profanity`
- Adicionar wordlist pt-BR: `filter.add(ptBrWords)` — manter lista em `/lib/profanityList.ts`
- Checar `filter.check(nome)`
- Se detectado: retornar `400` com mensagem `"Que tal um apelido mais divertido? 🌿"`
- **Não revelar** qual palavra foi bloqueada

### 4. Validação do Score (anti-cheat)
Calcular o score máximo possível por jogo e rejeitar qualquer valor acima:

```ts
const SCORE_MAXIMO = {
  sons: 6 * (100 + 50),   // 6 perguntas × (acerto + bônus máx) = 900
  quiz: 15 * (100 + 50),  // 15 perguntas × (acerto + bônus máx) = 2250
}

if (pontuacao > SCORE_MAXIMO[jogo]) {
  return 400, "Pontuação inválida."
}

if (pontuacao < 0) {
  return 400, "Pontuação inválida."
}
```

### 5. Validação do Campo `jogo`
- Aceitar apenas: `'sons'` ou `'quiz'`
- Qualquer outro valor: `400`

### Estrutura do documento salvo no MongoDB
```ts
{
  nome: string          // já sanitizado (trim + normalizado)
  pontuacao: number
  jogo: 'sons' | 'quiz'
  ip: string            // hash do IP (não salvar IP raw — privacidade)
  criadoEm: Date
}
```

> Salvar hash do IP (ex: `crypto.createHash('sha256').update(ip).digest('hex')`) permite detectar abusos sem armazenar dado pessoal.

### Arquivo de wordlist pt-BR (`/lib/profanityList.ts`)
Manter uma lista manual de palavrões comuns em português brasileiro. Começar com pelo menos 20 termos. O Claude Code deve gerar essa lista — não precisa de aprovação humana, é conhecimento público para fins de moderação.

---

## Local First — Regras de Comportamento

- Todos os assets (sons, imagens, perguntas) estão em `/public` ou `/data` — zero dependência de rede para jogar
- O app NUNCA deve quebrar por falta de internet
- Chamadas ao MongoDB Atlas ficam em `try/catch` com fallback silencioso
- Indicador sutil de status de conexão na tela do placar (ícone de nuvem com/sem sinal)

---

## Estrutura de Pastas Sugerida

```
/
├── app/
│   ├── page.tsx                  # Home / Menu
│   ├── sons/page.tsx
│   ├── quiz/page.tsx
│   ├── placar/page.tsx
│   └── api/
│       └── placar/route.ts
├── components/
│   ├── AnimalCard.tsx
│   ├── QuizCard.tsx
│   ├── PlacarTabela.tsx
│   ├── GamepadCursor.tsx
│   └── ui/                       # botões, timers, feedback, etc.
├── hooks/
│   ├── useGamepad.ts
│   ├── useSound.ts
│   └── usePlacar.ts
├── lib/
│   ├── mongodb.ts
│   ├── rateLimiter.ts
│   ├── profanityList.ts
│   └── utils.ts
├── store/
│   └── gameStore.ts              # Zustand
├── data/
│   └── perguntas.json
├── public/
│   ├── sounds/                   # tuiuiu.mp3, jacare.mp3, etc.
│   └── animals/                  # tuiuiu.png, jacare.png, etc.
├── types/
│   └── index.ts
└── CLAUDE.md
```

---

## Variáveis de Ambiente

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/ecoamigo
```

Criar `.env.local` (não commitado) e `.env.example` (commitado, com valores em branco).

---

## Assets Pendentes (a serem providenciados)

Os itens abaixo ainda não existem no projeto e devem ser adicionados manualmente pelo time antes do evento:

- [ ] Arquivos de som de cada animal (`/public/sounds/`)
- [ ] Ilustrações dos animais em PNG fundo transparente (`/public/animals/`)
- [ ] Arte/logo do ECO AMIGO (já existe como imagem JPG — converter para uso no app)

Enquanto os assets reais não chegarem, use **placeholders** para sons (arquivo MP3 silencioso) e ilustrações (retângulo colorido com o nome do animal).

---

## Convenções de Código

- **TypeScript strict mode** ativado
- Componentes em PascalCase, hooks em camelCase com prefixo `use`
- Sem `any` — tipar tudo
- Imports absolutos via `@/` (configurar em `tsconfig.json`)
- Comentários em português (o time é brasileiro)
- Mensagens de commit em português

---

## O que NÃO fazer

- Não usar `Supabase` — o banco é **MongoDB Atlas**
- Não usar `Prisma` ou `Mongoose` — usar o driver nativo `mongodb`
- Não usar `Redux` — o estado global é **Zustand**
- Não hardcodar a connection string — sempre via `process.env.MONGODB_URI`
- Não quebrar o app se o MongoDB estiver offline
