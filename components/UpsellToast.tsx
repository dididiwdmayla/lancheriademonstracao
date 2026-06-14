"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { Lanche } from "@/lib/menu";

type UpsellToastProps = {
  suggestedLanche: Lanche | null;
  onAccept: () => void;
  onClose: () => void;
};

export default function UpsellToast({ suggestedLanche, onAccept, onClose }: UpsellToastProps) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!suggestedLanche) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(0);
    const duration = 3000;
    const interval = 30;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (isPaused) return prev;
        if (prev >= 100) {
          clearInterval(timer);
          onClose();
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [suggestedLanche, isPaused, onClose]);

  return (
    <AnimatePresence>
      {suggestedLanche && (
        <motion.div
          initial={{ x: 100, opacity: 0, scale: 0.95 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 100, opacity: 0, scale: 0.95 }}
          className="w-full max-w-[320px] pointer-events-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className="bg-creme rounded-[20px] p-3 flex flex-col gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-marrom-900/10 overflow-hidden relative">
            
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-marrom-900/5 w-full">
              <div 
                className="h-full bg-amarelo transition-all ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-marrom-900/5 rounded-xl shrink-0 p-1 relative border border-marrom-900/10">
                <Image src={suggestedLanche.imagem} fill alt={suggestedLanche.nome} className="object-contain" />
              </div>
              <div>
                 <p className="font-display text-xs italic uppercase leading-none mb-1 text-marrom-900">Que tal um {suggestedLanche.nome}?</p>
                 <p className="font-mono text-[10px] text-alface font-bold">R$ {suggestedLanche.preco.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>

            <div className="flex gap-2 w-full mt-1">
              <button 
                onClick={onClose}
                className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-marrom-600 hover:bg-marrom-900/5 rounded-full flex-1"
              >
                Agora não
              </button>
              <button 
                onClick={onAccept}
                className="px-3 py-2 bg-marrom-900 text-creme rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-marrom-900/90 transition-colors flex-1"
              >
                Sim
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
