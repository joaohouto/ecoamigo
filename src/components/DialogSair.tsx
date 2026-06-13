"use client";
import { motion } from "motion/react";
import { useGamepadStatus } from "@/hooks/useGamepadStatus";
import { GamepadIcon } from "@/components/GamepadIcon";
import { FEmoji } from "@/components/FEmoji";

interface Props {
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function DialogSair({ onConfirmar, onCancelar }: Props) {
  const { tipo } = useGamepadStatus();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4"
      >
        <div className="text-center mb-5 p-3">
          <FEmoji size={56}>🚪</FEmoji>
          <h2
            className="text-2xl font-bold text-marrom-terra mt-2"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            Sair do jogo?
          </h2>
          <p
            className="text-sm text-gray-400 mt-1"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Seu progresso será perdido.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            <GamepadIcon botao="voltar" tipo={tipo} />
            Continuar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 py-4 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            <GamepadIcon
              botao="confirmar"
              tipo={tipo}
              color="rgba(255,255,255,0.35)"
            />
            Sair
          </button>
        </div>
      </motion.div>
    </div>
  );
}
