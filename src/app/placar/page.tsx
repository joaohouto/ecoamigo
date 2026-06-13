"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { usePlacar } from "@/hooks/usePlacar";
import { useGamepad } from "@/hooks/useGamepad";
import { useGamepadStatus } from "@/hooks/useGamepadStatus";
import type { EntradaPlacarLocal, EntradaPlacar, Jogo } from "@/types";
import GamepadHint from "@/components/GamepadHint";
import { GamepadIcon } from "@/components/GamepadIcon";
import { FEmoji } from "@/components/FEmoji";
import { TecladoVirtual } from "@/components/TecladoVirtual";

const TOP_N = 10;
const POLL_INTERVAL_MS = 30_000;

const NOME_JOGO: Record<Jogo, { emoji: string; label: string }> = {
  sons: { emoji: "🎵", label: "Sons" },
  quiz: { emoji: "🌿", label: "Quiz" },
};

function Medalha({ pos }: { pos: number }) {
  if (pos === 1) return <FEmoji size={22}>🥇</FEmoji>;
  if (pos === 2) return <FEmoji size={22}>🥈</FEmoji>;
  if (pos === 3) return <FEmoji size={22}>🥉</FEmoji>;
  return <>{pos}º</>;
}

function formatarData(ts: string | Date): string {
  return new Date(ts).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Indicador de conexão
// ---------------------------------------------------------------------------

function IndicadorConexao({ online }: { online: boolean }) {
  return (
    <div
      className={`flex items-center gap-1 text-xs font-bold ${online ? "text-verde-acento" : "text-gray-400"}`}
      style={{ fontFamily: "var(--font-nunito)" }}
    >
      <FEmoji size={16}>{online ? "☁️" : "📴"}</FEmoji>
      <span>{online ? "Online" : "Offline"}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tabela de ranking
// ---------------------------------------------------------------------------

interface EntradaDisplay {
  nome: string;
  pontuacao: number;
  jogo: Jogo;
  timestamp: string | Date;
  destaque?: boolean;
}

function TabelaPlacar({
  titulo,
  icone,
  corHeader,
  entradas,
  carregando,
  offline,
}: {
  titulo: string;
  icone: string;
  corHeader: string;
  entradas: EntradaDisplay[];
  carregando?: boolean;
  offline?: boolean;
}) {
  const top = entradas.slice(0, TOP_N);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col flex-1 min-w-0">
      <div className={`px-5 py-3 flex items-center gap-2 ${corHeader}`}>
        <FEmoji size={22}>{icone}</FEmoji>
        <h2
          className="text-white text-xl font-bold"
          style={{ fontFamily: "var(--font-fredoka)" }}
        >
          {titulo}
        </h2>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-14">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="block"
          >
            <FEmoji size={40}>⏳</FEmoji>
          </motion.span>
        </div>
      ) : offline ? (
        <div className="flex flex-col items-center justify-center py-14 text-gray-400 gap-2">
          <FEmoji size={48}>📴</FEmoji>
          <p style={{ fontFamily: "var(--font-nunito)" }}>Sem conexão</p>
        </div>
      ) : top.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-gray-400 gap-2">
          <FEmoji size={48}>🌱</FEmoji>
          <p style={{ fontFamily: "var(--font-nunito)" }}>
            Nenhuma entrada ainda
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {top.map((entrada, i) => (
            <motion.li
              key={`${entrada.nome}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 px-5 py-3 ${
                entrada.destaque
                  ? "bg-yellow-50"
                  : i % 2 === 0
                    ? "bg-white"
                    : "bg-gray-50/60"
              }`}
            >
              <span
                className="text-base min-w-[2.5rem] font-bold text-marrom-terra"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                <Medalha pos={i + 1} />
              </span>

              <span
                className={`flex-1 font-bold truncate text-sm md:text-base ${
                  entrada.destaque ? "text-verde-primario" : "text-gray-800"
                }`}
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                {entrada.nome}
                {entrada.destaque && (
                  <span className="ml-1 text-xs text-verde-acento font-normal">
                    ← você
                  </span>
                )}
              </span>

              <span className="text-xs text-gray-400 hidden sm:flex flex-shrink-0 items-center gap-1">
                <FEmoji size={14}>{NOME_JOGO[entrada.jogo].emoji}</FEmoji>
                {NOME_JOGO[entrada.jogo].label}
              </span>

              <span className="text-xs text-gray-300 hidden md:block flex-shrink-0">
                {formatarData(entrada.timestamp)}
              </span>

              <span
                className="font-bold text-verde-primario text-lg min-w-[4rem] text-right flex-shrink-0"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                {entrada.pontuacao}
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Formulário de registro
// ---------------------------------------------------------------------------

function FormRegistro({
  pontuacao,
  jogo,
  nomeInicial,
  online,
  onSalvar,
  onPular,
}: {
  pontuacao: number;
  jogo: Jogo;
  nomeInicial: string;
  online: boolean;
  onSalvar: (nome: string) => Promise<string | null>;
  onPular: () => void;
}) {
  const [nome, setNome] = useState(nomeInicial);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { conectado, tipo } = useGamepadStatus();

  useGamepad({
    onAlternativo: () => { if (!enviando) onPular(); },
  });

  const validarLocalmente = (n: string): string | null => {
    const t = n.trim();
    if (t.length < 2) return "Nome muito curto (mínimo 2 caracteres).";
    if (t.length > 20) return "Nome muito longo (máximo 20 caracteres).";
    if (!/^[a-zA-ZÀ-ú0-9 ]+$/.test(t))
      return "Use apenas letras, números e espaços.";
    return null;
  };

  const submeter = async () => {
    if (enviando) return;
    const erroLocal = validarLocalmente(nome);
    if (erroLocal) {
      setErro(erroLocal);
      return;
    }

    setErro("");
    setEnviando(true);
    const erroApi = await onSalvar(nome.trim());
    if (erroApi) {
      setErro(erroApi);
      setEnviando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submeter();
  };

  return (
    <motion.div
      className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
    >
      {/* Banner de pontuação */}
      <div className="bg-verde-primario px-6 py-4 flex items-center justify-between">
        <div>
          <p
            className="text-white/80 text-sm"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            <FEmoji size={16}>{NOME_JOGO[jogo].emoji}</FEmoji>{" "}
            {NOME_JOGO[jogo].label} — sua pontuação
          </p>
          <p
            className="text-white text-5xl font-bold leading-none"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            {pontuacao}{" "}
            <span className="text-2xl font-normal opacity-80">pts</span>
          </p>
        </div>
        <FEmoji size={72}>🏆</FEmoji>
      </div>

      <div className="px-6 py-5">
        <p
          className="text-marrom-terra font-bold text-lg mb-4"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          Registre seu nome no placar!
        </p>

        {conectado ? (
          /* Teclado virtual (gamepad) */
          <TecladoVirtual
            valor={nome}
            onChange={(v) => {
              setNome(v);
              setErro("");
            }}
            onConfirmar={submeter}
          />
        ) : (
          /* Input convencional (teclado/mouse) */
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <input
                type="text"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  setErro("");
                }}
                placeholder="Seu apelido"
                maxLength={20}
                autoFocus
                className={`
                  flex-1 px-4 py-3 rounded-xl border-2 text-lg text-gray-800 outline-none
                  transition-colors placeholder-gray-300
                  ${erro ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-verde-primario"}
                `}
                style={{ fontFamily: "var(--font-nunito)" }}
              />
              <motion.button
                type="submit"
                disabled={enviando || nome.trim().length < 2}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-verde-primario text-white rounded-xl text-lg font-bold hover:bg-verde-acento transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                {enviando ? (
                  "..."
                ) : online ? (
                  <>
                    <FEmoji size={16}>🌐</FEmoji> Enviar
                  </>
                ) : (
                  <>
                    <FEmoji size={16}>💾</FEmoji> Salvar
                  </>
                )}
              </motion.button>
            </div>
          </form>
        )}

        <AnimatePresence>
          {erro && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-500 text-sm mt-2"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              {erro}
            </motion.p>
          )}
        </AnimatePresence>

        {!online && (
          <p
            className="text-gray-400 text-xs mt-2"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            <FEmoji size={14}>📴</FEmoji> Sem conexão — será salvo apenas
            localmente
          </p>
        )}

        {conectado && enviando && (
          <p
            className="text-verde-primario text-sm mt-2 text-center"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Salvando...
          </p>
        )}

        <button
          type="button"
          onClick={onPular}
          className="mt-4 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors underline-offset-2 hover:underline"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          {conectado && <GamepadIcon botao="alternativo" tipo={tipo} padrao size={16} />}
          Pular e ver o placar →
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

export default function PlacarPage() {
  const { estado, jogoAtual, pontuacao, nomeJogador, resetar, setNome } =
    useGameStore();
  const {
    placarLocal,
    placarGlobal,
    carregandoGlobal,
    online,
    salvar,
    buscarGlobal,
  } = usePlacar();
  const router = useRouter();

  const temScore = estado === "finalizado" && jogoAtual !== null;
  const [mostrarForm, setMostrarForm] = useState(temScore);
  const [nomeRegistrado, setNomeRegistrado] = useState("");
  const [aba, setAba] = useState<"local" | "global">("local");

  // Gamepad: B volta ao menu (só quando não há form de registro aberto)
  useGamepad({
    onVoltar: () => {
      if (!mostrarForm) router.push("/");
    },
  });

  // Fetch global imediato + polling a cada 30s
  useEffect(() => {
    buscarGlobal();
    const id = setInterval(buscarGlobal, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [buscarGlobal]);

  const handleSalvar = useCallback(
    async (nome: string): Promise<string | null> => {
      if (!jogoAtual) return null;

      // Tenta enviar ao global se online
      if (online) {
        try {
          const res = await fetch("/api/placar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, pontuacao, jogo: jogoAtual }),
          });

          const data = await res.json();

          // 400 = erro de validação (profanidade, nome inválido) — não salva local e retorna erro
          if (res.status === 400) {
            return (data.mensagem as string) ?? "Nome inválido.";
          }

          // Qualquer outro caso: salva local e tenta atualizar global
          salvar(nome, pontuacao, jogoAtual);
          if (res.ok) buscarGlobal();
        } catch {
          // Erro de rede: salva só local
          salvar(nome, pontuacao, jogoAtual);
        }
      } else {
        salvar(nome, pontuacao, jogoAtual);
      }

      setNome(nome);
      setNomeRegistrado(nome);
      resetar();
      setMostrarForm(false);
      return null;
    },
    [jogoAtual, pontuacao, online, salvar, buscarGlobal, setNome, resetar],
  );

  const handlePular = useCallback(() => {
    resetar();
    setMostrarForm(false);
  }, [resetar]);

  // Prepara entradas para exibição
  const localDisplay: EntradaDisplay[] = placarLocal
    .slice(0, TOP_N)
    .map((e: EntradaPlacarLocal) => ({
      ...e,
      destaque: e.nome === nomeRegistrado,
    }));

  const globalDisplay: EntradaDisplay[] = placarGlobal
    .slice(0, TOP_N)
    .map((e: EntradaPlacar) => ({
      nome: e.nome,
      pontuacao: e.pontuacao,
      jogo: e.jogo,
      timestamp: e.timestamp ?? new Date(),
      destaque: e.nome === nomeRegistrado,
    }));

  return (
    <main className="min-h-screen bg-fundo flex flex-col items-center gap-6 px-4 py-8">
      {/* Cabeçalho */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div>
          <h1
            className="text-4xl md:text-5xl text-marrom-terra"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            <FEmoji size={44}>🏆</FEmoji> Placar
          </h1>
          <p
            className="text-marrom-terra/60 text-sm mt-0.5"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Guardiões do Pantanal
          </p>
        </div>
      </div>

      {/* Formulário de registro (visível só após terminar um jogo) */}
      <AnimatePresence>
        {mostrarForm && jogoAtual && (
          <FormRegistro
            pontuacao={pontuacao}
            jogo={jogoAtual}
            nomeInicial={nomeJogador}
            online={online}
            onSalvar={handleSalvar}
            onPular={handlePular}
          />
        )}
      </AnimatePresence>

      {/* Rankings */}
      <div className="w-full max-w-4xl flex flex-col gap-4">
        {/* Tabs (mobile) */}
        <div className="flex sm:hidden gap-2">
          {(["local", "global"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setAba(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
                aba === t
                  ? "bg-marrom-terra text-white"
                  : "bg-white text-marrom-terra"
              }`}
              style={{ fontFamily: "var(--font-fredoka)" }}
            >
              {t === "local" ? (
                <>
                  <FEmoji size={16}>🏠</FEmoji> Local
                </>
              ) : (
                <>
                  <FEmoji size={16}>🌐</FEmoji> Global
                </>
              )}
            </button>
          ))}
        </div>

        {/* Painéis lado a lado (desktop) / aba ativa (mobile) */}
        <div className="flex gap-4">
          <div
            className={`flex-1 min-w-0 flex-col ${aba === "local" ? "flex" : "hidden sm:flex"}`}
          >
            <TabelaPlacar
              titulo="Local"
              icone="🏠"
              corHeader="bg-marrom-terra"
              entradas={localDisplay}
            />
          </div>

          <div
            className={`flex-1 min-w-0 flex-col ${aba === "global" ? "flex" : "hidden sm:flex"}`}
          >
            <TabelaPlacar
              titulo="Global"
              icone="🌐"
              corHeader="bg-azul-reciclagem"
              entradas={globalDisplay}
              carregando={carregandoGlobal && globalDisplay.length === 0}
              offline={!online && globalDisplay.length === 0}
            />
          </div>
        </div>
      </div>

      <GamepadHint hints={[{ botao: "voltar", label: "Voltar ao menu" }]} />

      {/* Voltar ao menu */}
      <div className="flex justify-center mt-2">
        <Link
          href="/"
          className="px-8 py-3 bg-marrom-terra text-white rounded-full text-lg font-bold hover:opacity-90 transition-opacity shadow"
          style={{ fontFamily: "var(--font-fredoka)" }}
        >
          ← Início
        </Link>
      </div>
    </main>
  );
}
