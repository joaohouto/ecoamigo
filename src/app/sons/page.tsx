"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Howl as HowlType } from "howler";
import { ANIMAIS } from "@/data/animais";
import { useGameStore } from "@/store/gameStore";
import { useGamepad } from "@/hooks/useGamepad";
import type { Animal } from "@/types";
import { tocarUI } from "@/lib/uiSounds";
import GamepadHint from "@/components/GamepadHint";
import DialogSair from "@/components/DialogSair";
import { GamepadIcon } from "@/components/GamepadIcon";
import { useGamepadStatus } from "@/hooks/useGamepadStatus";
import { FEmoji } from "@/components/FEmoji";

const TOTAL_RODADAS = 6;
const PONTOS_ACERTO = 100;
const BONUS_RAPIDO = 50;
const BONUS_MEDIO = 25;
const DURACAO_FEEDBACK_MS = 1800;

const EMOJI_ANIMAIS: Record<string, string> = {
  tuiuiu:   "🦤",
  urutau:   "🦉",
  jacare:   "🐊",
  capivara: "🐾",
  arara:    "🦜",
  onca:     "🐆",
  anta:     "🦏",
  seriema:  "🦅",
  loboguara: "🐺",
  bemtevi:  "🐦",
  cervo:    "🦌",
  tamandua: "🐜",
  papagaio: "🦜",
};

const CORES_CARD: Record<string, string> = {
  tuiuiu:   "#E3F2FD",
  urutau:   "#EDE7F6",
  jacare:   "#E8F5E9",
  capivara: "#FFF3E0",
  arara:    "#FCE4EC",
  onca:     "#FFF9C4",
  anta:     "#F3E5F5",
  seriema:  "#FFF8E1",
  loboguara: "#FFEBEE",
  bemtevi:  "#E8F5E9",
  cervo:    "#FBE9E7",
  tamandua: "#F9FBE7",
  papagaio: "#E0F7FA",
};

function embaralhar<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

type FaseRodada = "tocando" | "aguardando" | "respondido";
type EstadoCard = "normal" | "correto" | "errado" | "neutro";

// ---------------------------------------------------------------------------
// AnimalCard
// ---------------------------------------------------------------------------

interface AnimalCardProps {
  animal: Animal;
  estadoCard: EstadoCard;
  onClick: () => void;
  disabled: boolean;
  focado: boolean;
}

function AnimalCard({
  animal,
  estadoCard,
  onClick,
  disabled,
  focado,
}: AnimalCardProps) {
  const [imgErro, setImgErro] = useState(false);
  const { conectado } = useGamepadStatus();

  const bordas: Record<EstadoCard, string> = {
    normal: `border-transparent hover:border-verde-acento hover:shadow-lg${focado && conectado ? " ring-4 ring-yellow-400 ring-offset-2" : ""}`,
    correto: "border-verde-acento bg-green-50",
    errado: "border-red-400 bg-red-50",
    neutro: "border-transparent opacity-50",
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative rounded-2xl border-4 p-4 flex flex-col items-center gap-3
        bg-white shadow-md transition-all duration-200 cursor-pointer
        disabled:cursor-default w-full
        ${bordas[estadoCard]}
      `}
    >
      <div
        className="w-full aspect-[4/3] rounded-xl overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: CORES_CARD[animal.id] ?? "#F5F5E8" }}
      >
        {!imgErro ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={animal.imagemUrl}
            alt={animal.nomeExibicao}
            className="w-full h-full object-cover"
            onError={() => setImgErro(true)}
          />
        ) : (
          <FEmoji size={110}>{EMOJI_ANIMAIS[animal.id] ?? "🐾"}</FEmoji>
        )}
      </div>

      <span
        className="text-xl md:text-2xl font-bold text-verde-primario"
        style={{ fontFamily: "var(--font-fredoka)" }}
      >
        {animal.nomeExibicao}
      </span>

      <AnimatePresence>
        {estadoCard === "correto" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-3 -right-3 bg-verde-acento text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-md"
          >
            ✓
          </motion.div>
        )}
        {estadoCard === "errado" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-md"
          >
            ✗
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// TelaInicio
// ---------------------------------------------------------------------------

function TelaInicio({ onIniciar }: { onIniciar: () => void }) {
  const { conectado, tipo } = useGamepadStatus();
  return (
    <main className="min-h-screen bg-fundo flex flex-col items-center justify-center gap-8 px-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.span
          className="block mb-4"
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <FEmoji size={96}>🎵</FEmoji>
        </motion.span>
        <h1
          className="text-5xl md:text-6xl text-verde-primario mb-3"
          style={{ fontFamily: "var(--font-fredoka)" }}
        >
          Sons do Pantanal
        </h1>
        <p
          className="text-lg md:text-xl text-marrom-terra max-w-md mx-auto"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          Ouça o som e descubra qual animal do Pantanal está chamando!
        </p>
      </motion.div>

      <motion.div
        className="bg-white rounded-2xl p-6 shadow-md max-w-sm w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2
          className="text-xl text-verde-primario mb-3 font-bold"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          Como jogar:
        </h2>
        <ul
          className="space-y-2 text-marrom-terra text-base"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          <li className="flex items-center gap-2"><FEmoji size={20}>🔊</FEmoji> Um som de animal será tocado automaticamente</li>
          <li className="flex items-center gap-2"><FEmoji size={20}>👆</FEmoji> Toque no card do animal correto</li>
          <li className="flex items-center gap-2"><FEmoji size={20}>⚡</FEmoji> Resposta rápida = mais pontos bônus!</li>
          <li className="flex items-center gap-2"><FEmoji size={20}>🎯</FEmoji> {TOTAL_RODADAS} rodadas no total</li>
        </ul>
      </motion.div>

      <motion.button
        onClick={onIniciar}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3 px-12 py-4 bg-verde-primario text-white rounded-full text-2xl font-bold shadow-lg hover:bg-verde-acento transition-colors"
        style={{ fontFamily: "var(--font-fredoka)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {conectado && <GamepadIcon botao="confirmar" tipo={tipo} padrao size={26} />}
        Começar! <FEmoji size={22}>🌿</FEmoji>
      </motion.button>

    </main>
  );
}

// ---------------------------------------------------------------------------
// TelaFinal
// ---------------------------------------------------------------------------

function TelaFinal({
  pontuacao,
  onReiniciar,
}: {
  pontuacao: number;
  onReiniciar: () => void;
}) {
  const { conectado, tipo } = useGamepadStatus();
  const maximo = TOTAL_RODADAS * (PONTOS_ACERTO + BONUS_RAPIDO);
  const pct = Math.round((pontuacao / maximo) * 100);

  const { emoji, texto } =
    pct >= 80
      ? { emoji: "🏆", texto: "Incrível! Você é um expert do Pantanal!" }
      : pct >= 50
        ? { emoji: "🌿", texto: "Muito bem! Você conhece a fauna pantaneira!" }
        : {
            emoji: "🌱",
            texto: "Continue explorando o Pantanal! Tente de novo!",
          };

  return (
    <main className="min-h-screen bg-fundo flex flex-col items-center justify-center gap-6 px-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <FEmoji size={88} className="block mb-3">{emoji}</FEmoji>
        <h1
          className="text-5xl text-verde-primario mb-2"
          style={{ fontFamily: "var(--font-fredoka)" }}
        >
          Fim do jogo!
        </h1>
        <p
          className="text-xl text-marrom-terra"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          {texto}
        </p>
      </motion.div>

      <motion.div
        className="bg-white rounded-3xl p-8 shadow-xl text-center min-w-[240px]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <p
          className="text-base text-marrom-terra mb-1"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          Sua pontuação
        </p>
        <motion.p
          className="text-7xl font-bold text-verde-primario"
          style={{ fontFamily: "var(--font-fredoka)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {pontuacao}
        </motion.p>
        <p
          className="text-sm text-gray-400 mt-1"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          de {maximo} pontos possíveis
        </p>
      </motion.div>

      <div className="flex flex-wrap gap-3 justify-center">
        <motion.button
          onClick={onReiniciar}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-8 py-3 bg-verde-primario text-white rounded-full text-xl font-bold hover:bg-verde-acento transition-colors shadow"
          style={{ fontFamily: "var(--font-fredoka)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {conectado && <GamepadIcon botao="confirmar" tipo={tipo} padrao size={22} />}
          Jogar de novo!
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            href="/placar"
            className="flex items-center gap-2 px-8 py-3 bg-azul-reciclagem text-white rounded-full text-xl font-bold hover:opacity-90 transition-opacity shadow"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            {conectado && <GamepadIcon botao="acao" tipo={tipo} padrao size={22} />}
            Ver Placar
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link
            href="/"
            className="flex items-center gap-2 px-8 py-3 border-2 border-marrom-terra text-marrom-terra rounded-full text-xl font-bold hover:bg-marrom-terra hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            {conectado && <GamepadIcon botao="voltar" tipo={tipo} padrao size={22} />}
            Menu
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Jogo principal
// ---------------------------------------------------------------------------

export default function SonsPage() {
  const { estado, iniciarJogo, finalizarJogo, adicionarPontos, pontuacao } =
    useGameStore();
  const router = useRouter();

  const [sequencia, setSequencia] = useState<Animal[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [opcoes, setOpcoes] = useState<Animal[]>([]);
  const [animalCorreto, setAnimalCorreto] = useState<Animal | null>(null);
  const [fase, setFase] = useState<FaseRodada>("tocando");
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [acertou, setAcertou] = useState<boolean | null>(null);
  const [tempoInicio, setTempoInicio] = useState(0);
  const [foco, setFoco] = useState(0);

  const howlRef = useRef<HowlType | null>(null);
  const [mostrarDialogSair, setMostrarDialogSair] = useState(false);
  const [repetindo, setRepetindo] = useState(false);
  const { tipo: tipoGamepad } = useGamepadStatus();

  // Refs — garantem que os handlers do gamepad sempre leem valores atuais,
  // independente do ciclo de re-render do React (evita stale closure).
  const faseRef = useRef<FaseRodada>("tocando");
  faseRef.current = fase;
  const animalCorretoRef = useRef<Animal | null>(null);
  animalCorretoRef.current = animalCorreto;
  const mostrarDialogSairRef = useRef(false);
  mostrarDialogSairRef.current = mostrarDialogSair;

  const carregarESom = useCallback((url: string, aoTerminar: () => void) => {
    howlRef.current?.stop();
    howlRef.current?.unload();

    import("howler").then(({ Howl }) => {
      const h = new Howl({
        src: [url],
        html5: true,
        onend: aoTerminar,
        onloaderror: () => setTimeout(aoTerminar, 800),
        onplayerror: () => setTimeout(aoTerminar, 800),
      });
      howlRef.current = h as unknown as HowlType;
      h.play();
    });
  }, []);

  const prepararRodada = useCallback(
    (seq: Animal[], indice: number) => {
      const correto = seq[indice];
      const distratores = embaralhar(
        ANIMAIS.filter((a) => a.id !== correto.id),
      ).slice(0, 3);
      const novasOpcoes = embaralhar([correto, ...distratores]);

      setAnimalCorreto(correto);
      setOpcoes(novasOpcoes);
      setSelecionado(null);
      setAcertou(null);
      setRepetindo(false);
      setFase("tocando");
      setTempoInicio(Date.now()); // cronômetro começa quando o som inicia

      carregarESom(correto.somUrl, () => {
        // Só avança se o usuário ainda não respondeu durante o som
        setFase((prev) => (prev === "tocando" ? "aguardando" : prev));
      });
    },
    [carregarESom],
  );

  const confirmarSair = useCallback(() => {
    howlRef.current?.stop();
    useGameStore.getState().resetar();
    router.push("/");
  }, [router]);

  const iniciar = useCallback(() => {
    tocarUI("iniciar");
    iniciarJogo("sons");
    const seq = embaralhar([...ANIMAIS]).slice(0, TOTAL_RODADAS);
    setSequencia(seq);
    setIndiceAtual(0);
    prepararRodada(seq, 0);
  }, [iniciarJogo, prepararRodada]);

  useEffect(() => {
    return () => {
      howlRef.current?.stop();
      howlRef.current?.unload();
      // Limpa estado de jogo em andamento ao sair da página (ex: usuário volta ao menu)
      if (useGameStore.getState().estado === "jogando") {
        useGameStore.getState().resetar();
      }
    };
  }, []);

  // Resetar foco a cada nova rodada
  useEffect(() => {
    setFoco(0);
  }, [indiceAtual]);

  // Gamepad — grid 2×2: esq/dir ±1 coluna, cima/baixo ±1 linha (wrap circular)
  useGamepad({
    onEsquerda: () => {
      if (!mostrarDialogSair && fase !== "respondido") {
        setFoco((f) => (f - 1 + 4) % 4);
        tocarUI("navegar");
      }
    },
    onDireita: () => {
      if (!mostrarDialogSair && fase !== "respondido") {
        setFoco((f) => (f + 1) % 4);
        tocarUI("navegar");
      }
    },
    onCima: () => {
      if (!mostrarDialogSair && fase !== "respondido") {
        setFoco((f) => (f - 2 + 4) % 4);
        tocarUI("navegar");
      }
    },
    onBaixo: () => {
      if (!mostrarDialogSair && fase !== "respondido") {
        setFoco((f) => (f + 2) % 4);
        tocarUI("navegar");
      }
    },
    onConfirmar: () => {
      if (mostrarDialogSair) {
        confirmarSair();
        return;
      }
      if (estado === "idle" || estado === "finalizado") {
        iniciar();
        return;
      }
      if (fase !== "respondido" && opcoes[foco]) responder(opcoes[foco]);
    },
    onVoltar: () => {
      if (mostrarDialogSair) {
        setMostrarDialogSair(false);
        return;
      }
      if (estado === "idle" || estado === "finalizado") {
        router.push("/");
        return;
      }
      if (estado === "jogando") setMostrarDialogSair(true);
    },
    onAcao: () => {
      if (mostrarDialogSairRef.current) return;
      if (estado === "finalizado") { router.push("/placar"); return; }
      if (faseRef.current === "aguardando") repetirSom();
    },
  });

  const repetirSom = () => {
    const animal = animalCorretoRef.current;
    if (!animal || faseRef.current !== "aguardando") return;
    // Para o som anterior sem atribuir onstop — o callback assíncrono do onstop
    // chegaria depois do setRepetindo(true) e apagaria a animação
    howlRef.current?.off();
    howlRef.current?.stop();
    howlRef.current?.unload();
    setRepetindo(true);
    import("howler").then(({ Howl }) => {
      const h = new Howl({
        src: [animal.somUrl],
        html5: true,
        onend: () => setRepetindo(false),
        onloaderror: () => setRepetindo(false),
      });
      howlRef.current = h as unknown as HowlType;
      h.play();
    });
  };

  const responder = (animal: Animal) => {
    if (fase === "respondido" || !animalCorreto) return;

    // Para o som se o usuário respondeu antes dele terminar
    if (fase === "tocando") {
      howlRef.current?.stop();
    }

    setRepetindo(false);
    tocarUI("selecionar");

    const correto = animal.id === animalCorreto.id;
    const elapsed = (Date.now() - tempoInicio) / 1000;

    setSelecionado(animal.id);
    setAcertou(correto);
    setFase("respondido");

    if (correto) {
      tocarUI("acertar");
      let pts = PONTOS_ACERTO;
      if (elapsed < 5) pts += BONUS_RAPIDO;
      else if (elapsed < 10) pts += BONUS_MEDIO;
      adicionarPontos(pts);
    } else {
      tocarUI("errar");
    }

    setTimeout(() => {
      const proximo = indiceAtual + 1;
      if (proximo >= TOTAL_RODADAS) {
        finalizarJogo();
      } else {
        setIndiceAtual(proximo);
        prepararRodada(sequencia, proximo);
      }
    }, DURACAO_FEEDBACK_MS);
  };

  if (estado === "idle")
    return (
      <>
        <TelaInicio onIniciar={iniciar} />
        <GamepadHint
          hints={[
            { botao: "confirmar", label: "Começar" },
            { botao: "voltar", label: "Menu" },
          ]}
        />
      </>
    );
  if (estado === "finalizado")
    return (
      <>
        <TelaFinal pontuacao={pontuacao} onReiniciar={iniciar} />
        <GamepadHint
          hints={[
            { botao: "confirmar", label: "Jogar de novo" },
            { botao: "acao", label: "Ver Placar" },
            { botao: "voltar", label: "Menu" },
          ]}
        />
      </>
    );

  // ---------------------------------------------------------------------------
  // Tela do jogo
  // ---------------------------------------------------------------------------
  return (
    <main className="min-h-screen bg-fundo flex flex-col items-center justify-center gap-6 px-4 py-8">
      {/* Barra superior */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <div>
          <p
            className="text-xs text-marrom-terra uppercase tracking-wide"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Rodada
          </p>
          <p
            className="text-3xl font-bold text-verde-primario"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            {indiceAtual + 1}
            <span className="text-lg text-marrom-terra font-normal">
              {" "}
              / {TOTAL_RODADAS}
            </span>
          </p>
        </div>

        {/* Bolinhas de progresso */}
        <div className="flex gap-2 items-center">
          {Array.from({ length: TOTAL_RODADAS }).map((_, i) => (
            <motion.div
              key={i}
              className={`rounded-full transition-colors ${
                i < indiceAtual
                  ? "w-3 h-3 bg-verde-acento"
                  : i === indiceAtual
                    ? "w-4 h-4 bg-verde-primario"
                    : "w-3 h-3 bg-gray-300"
              }`}
            />
          ))}
        </div>

        <div className="text-right">
          <p
            className="text-xs text-marrom-terra uppercase tracking-wide"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Pontos
          </p>
          <p
            className="text-3xl font-bold text-marrom-terra"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            {pontuacao}
          </p>
        </div>
      </div>

      {/* Instrução + botão de som */}
      <AnimatePresence mode="wait">
        {fase === "tocando" ? (
          <motion.div
            key="tocando"
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.span
              className="block"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 0.7 }}
            >
              <FEmoji size={64}>🔊</FEmoji>
            </motion.span>
            <p
              className="text-xl text-marrom-terra"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Ouça o som...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="aguardando"
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p
              className="text-2xl md:text-3xl font-bold text-marrom-terra text-center"
              style={{ fontFamily: "var(--font-fredoka)" }}
            >
              Qual animal faz esse som?
            </p>
            <motion.button
              onClick={repetirSom}
              disabled={fase === "respondido"}
              animate={repetindo ? { scale: [1, 1.04, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full transition-colors text-sm font-bold disabled:opacity-40 ${
                repetindo
                  ? "bg-verde-primario text-white shadow"
                  : "bg-verde-primario/10 hover:bg-verde-primario/20 text-verde-primario"
              }`}
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              <GamepadIcon
                botao="acao"
                tipo={tipoGamepad}
                color={repetindo ? "rgba(255,255,255,0.35)" : "#4CAF50"}
                size={20}
              />
              {repetindo ? "Tocando..." : "Ouvir de novo"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de cards */}
      <motion.div
        key={`cards-${indiceAtual}`}
        className="grid grid-cols-2 gap-4 w-full max-w-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {opcoes.map((animal) => {
          let estadoCard: EstadoCard = "normal";
          if (selecionado !== null) {
            if (animal.id === animalCorreto?.id) estadoCard = "correto";
            else if (animal.id === selecionado) estadoCard = "errado";
            else estadoCard = "neutro";
          }

          return (
            <AnimalCard
              key={animal.id}
              animal={animal}
              estadoCard={estadoCard}
              onClick={() => responder(animal)}
              disabled={fase === "respondido"}
              focado={fase !== "respondido" && opcoes.indexOf(animal) === foco}
            />
          );
        })}
      </motion.div>

      <GamepadHint
        hints={[
          { botao: "dpad", label: "Navegar" },
          { botao: "confirmar", label: "Selecionar" },
          { botao: "acao", label: "Ouvir de novo" },
          { botao: "voltar", label: "Sair" },
        ]}
      />

      {mostrarDialogSair && (
        <DialogSair
          onConfirmar={confirmarSair}
          onCancelar={() => setMostrarDialogSair(false)}
        />
      )}

      {/* Toast de feedback */}
      <AnimatePresence>
        {fase === "respondido" && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className={`
              fixed bottom-14 left-1/2 -translate-x-1/2 z-[60]
              px-8 py-3 rounded-full text-white text-xl font-bold shadow-2xl
              ${acertou ? "bg-verde-acento" : "bg-red-500"}
            `}
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            {acertou ? (
              <>✓ Correto! <FEmoji size={22}>🎉</FEmoji></>
            ) : (
              <>✗ Era {animalCorreto?.nomeExibicao}!</>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
