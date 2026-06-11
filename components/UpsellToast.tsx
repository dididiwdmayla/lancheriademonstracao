import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Lanche } from "@/lib/menu";
import { useMenu } from "@/hooks/useMenu";
import { useCart } from "@/context/CartContext";

type UpsellToastProps = {
  lastAddedLancheId: string | null;
  onAccept: (lanche: Lanche) => void;
  onClose: () => void;
};

export default function UpsellToast({ lastAddedLancheId, onAccept, onClose }: UpsellToastProps) {
  const { data } = useMenu();
  const { cart } = useCart();
  const [suggestion, setSuggestion] = useState<Lanche | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100

  // Determine suggestion
  useEffect(() => {
    if (!data || !lastAddedLancheId) {
      setSuggestion(null);
      return;
    }
    
    // items in cart
    const lancheIdsInCart = new Set(cart.filter(c => c.isLanche).map(c => c.item.id));
    
    // Try to find a MAIS PEDIDO not in cart
    let candidate = data.lanches.find(l => l.tag === "MAIS PEDIDO" && !lancheIdsInCart.has(l.id));
    if (!candidate) {
      // Find any burger not in cart
      candidate = data.lanches.find(l => !lancheIdsInCart.has(l.id));
    }
    
    if (candidate) {
      setSuggestion(candidate);
      setProgress(0); // Reset progress when new suggestion appears
    } else {
      setSuggestion(null);
    }
  }, [data, lastAddedLancheId, cart]);

  // Auto-dismiss logic with requestAnimationFrame for smooth progress
  useEffect(() => {
    if (!suggestion) return;
    
    const DURATION = 4000;
    let startTime: number | null = null;
    let animationFrameId: number;
    let accumulatedTime = 0;

    const animate = (timestamp: number) => {
      if (isHovered) {
        // Just maintain state
        startTime = null;
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      if (startTime === null) {
        startTime = timestamp;
      }

      const deltaTime = timestamp - startTime;
      accumulatedTime += deltaTime;
      startTime = timestamp;

      const newProgress = Math.min((accumulatedTime / DURATION) * 100, 100);
      setProgress(newProgress);

      if (accumulatedTime >= DURATION) {
        onClose(); // Auto dismiss
      } else {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [suggestion, isHovered, onClose]);

  if (!suggestion) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-6 z-50 w-[calc(100vw-32px)] max-w-[360px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
      >
        <div className="bg-marrom-900 border border-creme/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto text-creme p-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 bg-white/5 rounded-xl flex-shrink-0 border border-creme/10">
              <Image src={suggestion.imagem} alt={suggestion.nome} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-body text-xs text-creme/80 mb-1">Que tal levar um também?</p>
              <h4 className="font-display italic uppercase text-lg text-amarelo leading-none">{suggestion.nome}</h4>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={onClose}
              className="flex-1 py-2 rounded-lg font-bold text-xs uppercase bg-white/5 text-creme/60 hover:text-creme hover:bg-white/10 transition-colors"
            >
              AGORA NÃO
            </button>
            <button 
              onClick={() => onAccept(suggestion)}
              className="flex-1 py-2 rounded-lg font-bold text-xs uppercase bg-laranja text-white hover:opacity-90 transition-opacity"
            >
              SIM, ESCOLHER
            </button>
          </div>
          
          {/* Progress Bar container */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
            {/* The progress bar itself */}
            <div 
              className="h-full bg-amarelo origin-left transition-transform duration-[16ms] ease-linear"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
