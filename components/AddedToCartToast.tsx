"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

type AddedToCartToastProps = {
  itemName: string | null;
  onClose: () => void;
};

export default function AddedToCartToast({ itemName, onClose }: AddedToCartToastProps) {
  const { setIsCartOpen } = useCart();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!itemName) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(0);
    const duration = 4000;
    const interval = 40; // update roughly 100 times over 4 seconds
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          onClose();
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [itemName, onClose]);

  return (
    <AnimatePresence>
      {itemName && (
        <motion.div
           initial={{ x: 100, opacity: 0, scale: 0.95 }}
           animate={{ x: 0, opacity: 1, scale: 1 }}
           exit={{ x: 100, opacity: 0, scale: 0.95 }}
           className="w-full max-w-[320px] pointer-events-auto"
        >
          <div className="bg-creme rounded-[24px] p-4 flex flex-col md:flex-row md:items-center gap-4 shadow-2xl border border-creme/5 overflow-hidden relative">
            
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-marrom-900/10 w-full">
              <div 
                className="h-full bg-amarelo transition-all ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-alface text-creme rounded-full flex items-center justify-center shrink-0">
                <Check size={20} strokeWidth={3} />
              </div>
              <div>
                <p className="font-display italic uppercase text-alface mb-0 leading-tight text-sm">Na sacola!</p>
                <p className="font-body font-bold text-marrom-900 text-sm line-clamp-1">{itemName}</p>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 ml-auto shrink-0 md:ml-4">
              <button 
                onClick={() => {
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-marrom-600 hover:bg-marrom-900/5 rounded-full flex-1 md:flex-initial"
              >
                Continuar
              </button>
              <button 
                onClick={() => {
                  onClose();
                  setIsCartOpen(true);
                }}
                className="px-4 py-2 bg-laranja text-creme rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex-1 md:flex-initial shadow-md"
              >
                Ver Sacola
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
