"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import todasPerguntas from "@/data/perguntas-direito.json";
import { useGameStore } from "@/store/gameStore";
import { useGamepad } from "@/hooks/useGamepad";
import { useGamepadStatus } from "@/hooks/useGamepadStatus";
import type { PerguntaDireito } from "@/types";
import { tocarUI } from "@/lib/uiSounds";
import GamepadHint from "@/components/GamepadHint";
import DialogSair from "@/components/DialogSair";
import { GamepadIcon } from "@/components/GamepadIcon";
import { FEmoji } from "@/components/FEmoji";

const TOTAL_PERGUNTAS = 10;
const TEMPO_MAX = 30;
const PONTOS_ACERTO = 100;
const BONUS_RAPIDO = 50;
const BONUS_MEDIO = 25;

const LETRAS = ["A", "B", "C", "D"] as const;

const EMOJI_CATEGORIA: Record<string, string> = {
  constitucional: "⚖️",
  civil: "📜",
  penal: "🚔",
  trabalhista: "👷",
};

const LABEL_CATEGORIA: Record<string, string> = {
  constitucional: "Constitucional",
  civil: "Civil",
  penal: "Penal",
  trabalhista: "Trabalhista",
};

function embaralhar<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

type FaseRodada = "respondendo" | "feedback";

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
          animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <FEmoji size={96}>⚖️</FEmoji>
        </motion.span>
        <h1
          className="text-5xl md:text-6xl text-azul-reciclagem mb-3"
          style={{ fontFamily: "var(--font-fredoka)" }}
        >
          Quiz de Direito
        </h1>
        <p
          className="text-lg md:text-xl text-marrom-terra max-w-md mx-auto"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          Teste seus conhecimentos jurídicos!
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
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          Como jogar:
        </h2>
        <ul
          className="space-y-2 text-marrom-terra text-base"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          <li className="flex items-center gap-2">
            <FEmoji size={20}>⚖️</FEmoji> {TOTAL_PERGUNTAS} perguntas por rodada
            (fácil ao difícil)
          </li>
          <li className="flex items-center gap-2">
            <FEmoji size={20}>⏱️</FEmoji> {TEMPO_MAX} segundos por pergunta
          </li>
          <li className="flex items-center gap-2">
            <FEmoji size={20}>✅</FEmoji> +{PONTOS_ACERTO} pts por resposta
            correta
          </li>
          <li className="flex items-center gap-2">
            <FEmoji size={20}>⚡</FEmoji> Resposta em menos de 5s = bônus de +
            {BONUS_RAPIDO} pts!
          </li>
          <li className="flex items-center gap-2">
            <FEmoji size={20}>🗂️</FEmoji> Temas: Constitucional, Civil, Penal e
            Trabalhista
          </li>
        </ul>
      </motion.div>

      <motion.button
        onClick={onIniciar}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3 px-12 py-4 bg-azul-reciclagem text-white rounded-full text-2xl font-bold shadow-lg hover:opacity-90 transition-opacity"
        style={{ fontFamily: "var(--font-fredoka)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {conectado && (
          <GamepadIcon botao="confirmar" tipo={tipo} padrao size={26} />
        )}
        Começar! <FEmoji size={22}>⚖️</FEmoji>
      </motion.button>
    </main>
  );
}

// ---------------------------------------------------------------------------
// TelaFinal
// ---------------------------------------------------------------------------

function TelaFinal({
  pontuacao,
  acertos,
  onReiniciar,
}: {
  pontuacao: number;
  acertos: number;
  onReiniciar: () => void;
}) {
  const { conectado, tipo } = useGamepadStatus();
  const maximo = TOTAL_PERGUNTAS * (PONTOS_ACERTO + BONUS_RAPIDO);
  const pct = Math.round((acertos / TOTAL_PERGUNTAS) * 100);

  const { emoji, texto } =
    pct >= 80
      ? {
          emoji: "🏆",
          texto: "Mestre do Direito! Conhecimento jurídico incrível!",
        }
      : pct >= 60
        ? { emoji: "⚖️", texto: "Muito bem! Você manda bem no Direito!" }
        : pct >= 40
          ? { emoji: "📖", texto: "Bom começo! Continue estudando as leis!" }
          : {
              emoji: "📚",
              texto: "Que tal revisar mais um pouco a legislação?",
            };

  return (
    <main className="min-h-screen bg-fundo flex flex-col items-center justify-center gap-6 px-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <FEmoji size={88} className="block mb-3">
          {emoji}
        </FEmoji>
        <h1
          className="text-5xl text-azul-reciclagem mb-2"
          style={{ fontFamily: "var(--font-fredoka)" }}
        >
          Fim do Quiz!
        </h1>
        <p
          className="text-xl text-marrom-terra"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
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
            <p
              className="text-sm text-gray-400 mb-1"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Acertos
            </p>
            <p
              className="text-5xl font-bold text-verde-primario"
              style={{ fontFamily: "var(--font-fredoka)" }}
            >
              {acertos}
              <span className="text-2xl text-gray-400 font-normal">
                /{TOTAL_PERGUNTAS}
              </span>
            </p>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <p
              className="text-sm text-gray-400 mb-1"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Pontuação
            </p>
            <p
              className="text-5xl font-bold text-azul-reciclagem"
              style={{ fontFamily: "var(--font-fredoka)" }}
            >
              {pontuacao}
            </p>
          </div>
        </div>
        <p
          className="text-xs text-gray-300 mt-2"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          máximo: {maximo} pts
        </p>
      </motion.div>

      <div className="flex flex-wrap gap-3 justify-center">
        <motion.button
          onClick={onReiniciar}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-8 py-3 bg-azul-reciclagem text-white rounded-full text-xl font-bold hover:opacity-90 transition-opacity shadow"
          style={{ fontFamily: "var(--font-fredoka)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {conectado && (
            <GamepadIcon botao="confirmar" tipo={tipo} padrao size={22} />
          )}
          Jogar de novo!
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            href="/placar"
            className="flex items-center gap-2 px-8 py-3 bg-verde-primario text-white rounded-full text-xl font-bold hover:bg-verde-acento transition-colors shadow"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            {conectado && (
              <GamepadIcon botao="acao" tipo={tipo} padrao size={22} />
            )}
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
            {conectado && (
              <GamepadIcon botao="voltar" tipo={tipo} padrao size={22} />
            )}
            Menu
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// TimerBar
// ---------------------------------------------------------------------------

function TimerBar({ tempo, maximo }: { tempo: number; maximo: number }) {
  const pct = (tempo / maximo) * 100;

  const cor =
    pct > 50 ? "bg-verde-acento" : pct > 25 ? "bg-yellow-400" : "bg-red-500";

  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <motion.div
        className={`h-full rounded-full transition-colors duration-500 ${cor}`}
        style={{ width: `${pct}%` }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: "linear" }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Jogo principal
// ---------------------------------------------------------------------------

export default function QuizDireitoPage() {
  const { estado, iniciarJogo, finalizarJogo, adicionarPontos, pontuacao } =
    useGameStore();
  const router = useRouter();
  const [mostrarDialogSair, setMostrarDialogSair] = useState(false);
  const { conectado } = useGamepadStatus();

  const [rodada, setRodada] = useState<PerguntaDireito[]>([]);
  const [indice, setIndice] = useState(0);
  const [fase, setFase] = useState<FaseRodada>("respondendo");
  const [selecionado, setSelecionado] = useState<number | null>(null);
  const [esgotou, setEsgotou] = useState(false);
  const [tempo, setTempo] = useState(TEMPO_MAX);
  const [acertos, setAcertos] = useState(0);
  const [tempoInicio, setTempoInicio] = useState(0);
  const [foco, setFoco] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const perguntaAtual = rodada[indice];

  const pararTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Retoma o countdown a partir do tempo atual (sem resetar para TEMPO_MAX)
  const retomarTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setTempo((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
  }, []);

  const confirmarSair = useCallback(() => {
    pararTimer();
    useGameStore.getState().resetar();
    router.push("/");
  }, [pararTimer, router]);

  const iniciarTimer = useCallback(() => {
    pararTimer();
    setTempo(TEMPO_MAX);
    setTempoInicio(Date.now());
    timerRef.current = setInterval(() => {
      setTempo((t) => {
        if (t <= 1) return 0;
        return t - 1;
      });
    }, 1000);
  }, [pararTimer]);

  // Tempo esgotou → tratar como erro e avançar
  useEffect(() => {
    if (tempo === 0 && fase === "respondendo") {
      pararTimer();
      setEsgotou(true);
      setSelecionado(null);
      setFase("feedback");
    }
  }, [tempo, fase, pararTimer]);

  const avancar = useCallback(() => {
    tocarUI("navegar");
    const proximo = indice + 1;
    if (proximo >= TOTAL_PERGUNTAS) {
      finalizarJogo();
      return;
    }
    setIndice(proximo);
    setSelecionado(null);
    setEsgotou(false);
    setFase("respondendo");
    iniciarTimer();
  }, [indice, finalizarJogo, iniciarTimer]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      pararTimer();
      // Limpa estado de jogo em andamento ao sair da página (ex: usuário volta ao menu)
      if (useGameStore.getState().estado === "jogando") {
        useGameStore.getState().resetar();
      }
    };
  }, [pararTimer]);

  // Resetar foco a cada nova pergunta
  useEffect(() => {
    setFoco(0);
  }, [indice]);

  // Som de tick nos últimos 5 segundos
  useEffect(() => {
    if (tempo > 0 && tempo <= 5 && fase === "respondendo") {
      tocarUI("tick");
    }
  }, [tempo, fase]);

  // Gamepad
  useGamepad({
    onCima: () => {
      if (!mostrarDialogSair && fase === "respondendo") {
        setFoco((f) => (f - 1 + 4) % 4);
        tocarUI("navegar");
      }
    },
    onBaixo: () => {
      if (!mostrarDialogSair && fase === "respondendo") {
        setFoco((f) => (f + 1) % 4);
        tocarUI("navegar");
      }
    },
    onEsquerda: () => {
      if (!mostrarDialogSair && fase === "respondendo") {
        setFoco((f) => (f - 1 + 4) % 4);
        tocarUI("navegar");
      }
    },
    onDireita: () => {
      if (!mostrarDialogSair && fase === "respondendo") {
        setFoco((f) => (f + 1) % 4);
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
      if (fase === "respondendo") responder(foco);
      else if (fase === "feedback") avancar();
    },
    onVoltar: () => {
      if (mostrarDialogSair) {
        setMostrarDialogSair(false);
        retomarTimer();
        return;
      }
      if (estado === "idle" || estado === "finalizado") {
        router.push("/");
        return;
      }
      if (estado === "jogando" && fase === "respondendo") {
        pararTimer();
        setMostrarDialogSair(true);
      } else if (estado === "jogando") setMostrarDialogSair(true);
    },
    onAcao: () => {
      if (mostrarDialogSair) return;
      if (estado === "finalizado") {
        router.push("/placar");
        return;
      }
    },
  });

  const iniciar = useCallback(() => {
    tocarUI("iniciar");
    pararTimer();
    iniciarJogo("direito");
    // Seleção por dificuldade: 3 fácil + 4 médio + 3 difícil = 10
    const banco = todasPerguntas as PerguntaDireito[];
    const faceis = embaralhar(
      banco.filter((p) => p.dificuldade === "facil"),
    ).slice(0, 3);
    const medias = embaralhar(
      banco.filter((p) => p.dificuldade === "medio"),
    ).slice(0, 4);
    const dificeis = embaralhar(
      banco.filter((p) => p.dificuldade === "dificil"),
    ).slice(0, 3);
    const sorteadas = embaralhar([...faceis, ...medias, ...dificeis]);
    setRodada(sorteadas);
    setIndice(0);
    setSelecionado(null);
    setEsgotou(false);
    setAcertos(0);
    setFase("respondendo");
    // Timer inicia no próximo tick para garantir que o estado já foi aplicado
    setTimeout(() => {
      setTempo(TEMPO_MAX);
      setTempoInicio(Date.now());
      timerRef.current = setInterval(() => {
        setTempo((t) => (t <= 1 ? 0 : t - 1));
      }, 1000);
    }, 0);
  }, [pararTimer, iniciarJogo]);

  const responder = (opcaoIdx: number) => {
    if (fase !== "respondendo" || !perguntaAtual) return;

    tocarUI("selecionar");

    pararTimer();
    const elapsed = (Date.now() - tempoInicio) / 1000;
    const correto = opcaoIdx === perguntaAtual.resposta_correta;

    setSelecionado(opcaoIdx);
    setEsgotou(false);
    setFase("feedback");

    if (correto) {
      tocarUI("acertar");
      let pts = PONTOS_ACERTO;
      if (elapsed < 5) pts += BONUS_RAPIDO;
      else if (elapsed < 10) pts += BONUS_MEDIO;
      adicionarPontos(pts);
      setAcertos((a) => a + 1);
    } else {
      tocarUI("errar");
    }
  };

  // ---------------------------------------------------------------------------
  // Renders condicionais
  // ---------------------------------------------------------------------------

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
        <TelaFinal
          pontuacao={pontuacao}
          acertos={acertos}
          onReiniciar={iniciar}
        />
        <GamepadHint
          hints={[
            { botao: "confirmar", label: "Jogar de novo" },
            { botao: "acao", label: "Ver Placar" },
            { botao: "voltar", label: "Menu" },
          ]}
        />
      </>
    );

  if (!perguntaAtual) return null;

  // ---------------------------------------------------------------------------
  // Tela do jogo
  // ---------------------------------------------------------------------------

  const respostaCorreta = perguntaAtual.resposta_correta;
  const hintsJogo =
    fase === "feedback"
      ? [{ botao: "confirmar" as const, label: "Próxima" }]
      : [
          { botao: "dpad" as const, label: "Navegar" },
          { botao: "confirmar" as const, label: "Responder" },
        ];

  return (
    <main className="min-h-screen bg-fundo flex flex-col items-center justify-center gap-5 px-4 py-8">
      {/* Barra de topo */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <div>
          <p
            className="text-xs text-marrom-terra uppercase tracking-wide"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Pergunta
          </p>
          <p
            className="text-3xl font-bold text-azul-reciclagem"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            {indice + 1}
            <span className="text-lg text-marrom-terra font-normal">
              {" "}
              / {TOTAL_PERGUNTAS}
            </span>
          </p>
        </div>

        {/* Bolinhas de progresso */}
        <div className="hidden sm:flex gap-1 items-center flex-wrap justify-center max-w-[200px]">
          {Array.from({ length: TOTAL_PERGUNTAS }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i < indice
                  ? "w-3 h-3 bg-verde-acento"
                  : i === indice
                    ? "w-4 h-4 bg-azul-reciclagem"
                    : "w-2 h-2 bg-gray-300"
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

      {/* Timer */}
      <div className="w-full max-w-2xl flex items-center gap-3">
        <TimerBar tempo={tempo} maximo={TEMPO_MAX} />
        <span
          className={`text-lg font-bold min-w-[2.5rem] text-right transition-colors ${
            tempo <= 5 ? "text-red-500" : "text-marrom-terra"
          }`}
          style={{ fontFamily: "var(--font-fredoka)" }}
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
            <FEmoji size={24}>
              {EMOJI_CATEGORIA[perguntaAtual.categoria] ?? "❓"}
            </FEmoji>
            <span
              className="text-sm font-bold text-azul-reciclagem uppercase tracking-wide"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              {LABEL_CATEGORIA[perguntaAtual.categoria] ??
                perguntaAtual.categoria}
            </span>
          </div>

          {/* Enunciado */}
          <p
            className="text-xl md:text-2xl text-gray-800 leading-snug"
            style={{ fontFamily: "var(--font-nunito)", fontWeight: 700 }}
          >
            {perguntaAtual.enunciado}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Opções */}
      <div className="w-full max-w-2xl flex flex-col gap-3">
        {perguntaAtual.opcoes.map((opcao, i) => {
          let variante: "normal" | "correto" | "errado" | "neutro" = "normal";
          if (fase === "feedback") {
            if (i === respostaCorreta) variante = "correto";
            else if (i === selecionado) variante = "errado";
            else variante = "neutro";
          }

          const estilos = {
            normal:
              "border-gray-200 hover:border-azul-reciclagem hover:bg-blue-50 bg-white",
            correto: "border-verde-acento bg-green-50 text-verde-primario",
            errado: "border-red-400 bg-red-50 text-red-600",
            neutro: "border-gray-100 bg-gray-50 opacity-50",
          };

          const letraEstilo = {
            normal: "bg-gray-100 text-gray-500",
            correto: "bg-verde-acento text-white",
            errado: "bg-red-400 text-white",
            neutro: "bg-gray-200 text-gray-400",
          };

          return (
            <motion.button
              key={i}
              onClick={() => responder(i)}
              disabled={fase !== "respondendo"}
              whileHover={fase === "respondendo" ? { scale: 1.01 } : {}}
              whileTap={fase === "respondendo" ? { scale: 0.99 } : {}}
              className={`
                flex items-center gap-4 w-full rounded-xl border-2 p-4
                text-left transition-all duration-200 cursor-pointer
                disabled:cursor-default
                ${estilos[variante]}
                ${fase === "respondendo" && i === foco && conectado ? "ring-4 ring-yellow-400 ring-offset-1" : ""}
              `}
            >
              <span
                className={`
                  flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
                  text-base font-bold transition-colors duration-200
                  ${letraEstilo[variante]}
                `}
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                {LETRAS[i]}
              </span>
              <span
                className="text-base md:text-lg font-semibold text-gray-700"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                {opcao}
              </span>
              {fase === "feedback" && i === respostaCorreta && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto text-2xl"
                >
                  ✓
                </motion.span>
              )}
              {fase === "feedback" &&
                i === selecionado &&
                i !== respostaCorreta && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto text-2xl"
                  >
                    ✗
                  </motion.span>
                )}
            </motion.button>
          );
        })}
      </div>

      <GamepadHint hints={[...hintsJogo, { botao: "voltar", label: "Sair" }]} />

      {mostrarDialogSair && (
        <DialogSair
          onConfirmar={confirmarSair}
          onCancelar={() => {
            setMostrarDialogSair(false);
            retomarTimer();
          }}
        />
      )}

      {/* Feedback / explicação + botão de avanço */}
      <AnimatePresence>
        {fase === "feedback" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className={`
              w-full max-w-2xl rounded-2xl px-5 py-4 text-white
              ${esgotou ? "bg-orange-500" : selecionado === respostaCorreta ? "bg-verde-acento" : "bg-red-500"}
            `}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p
                  className="text-lg font-bold mb-1"
                  style={{ fontFamily: "var(--font-fredoka)" }}
                >
                  {esgotou
                    ? "⏰ Tempo esgotado!"
                    : selecionado === respostaCorreta
                      ? "✓ Correto!"
                      : "✗ Incorreto!"}
                </p>
                {perguntaAtual.explicacao && (
                  <p
                    className="text-sm opacity-90"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
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
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                {indice + 1 >= TOTAL_PERGUNTAS ? "Ver resultado" : "Próxima"} →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
