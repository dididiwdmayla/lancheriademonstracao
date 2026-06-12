"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate, useReducedMotion, AnimatePresence } from "motion/react";
import { Lanche } from "@/lib/menu";

const HOVER_MESSAGE = "JÁ COMERAM ESSE! 😋";

type Props = {
  burger: Lanche;
  onSelect: (burger: Lanche) => void;
};

export default function BurgerCard({ burger, onSelect }: Props) {
  const shouldReduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const radius = useMotionValue(0);
  const [isLensActive, setIsLensActive] = useState(false);
  
  // High stiffness for fast, snappy but smooth radius animation
  const smoothRadius = useSpring(radius, { stiffness: 400, damping: 30 });
  const clipPath = useMotionTemplate`circle(${shouldReduceMotion ? radius : smoothRadius}px at ${mouseX}px ${mouseY}px)`;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // For touch devices, activate lens temporarily on tap
    if (e.pointerType === "touch" || e.pointerType === "pen") {
      if (isLensActive) return; // Prevent overlapping taps
      
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
      
      radius.set(56);
      setIsLensActive(true);
      
      setTimeout(() => {
        radius.set(0);
        setIsLensActive(false);
      }, 800);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || e.pointerType === "pen") return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || e.pointerType === "pen") return;
    radius.set(56);
    setIsLensActive(true);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || e.pointerType === "pen") return;
    radius.set(0);
    setIsLensActive(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-creme p-4 rounded-[32px] flex flex-col sm:flex-row gap-4 shadow-2xl relative overflow-hidden group transition-all hover:bg-white"
    >
      {/* Tag */}
      {burger.tag && (
        <div className={`absolute top-3 left-3 z-10 px-2 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full ${
          burger.tag === 'NOVO' ? 'bg-amarelo text-marrom-900' : 
          burger.tag === 'MAIS PEDIDO' ? 'bg-laranja text-white' : 
          'bg-tomate text-white'
        }`}>
          {burger.tag}
        </div>
      )}

      {/* Image Area */}
      <div 
        className="relative w-full h-48 sm:w-28 sm:h-28 bg-marrom-900/5 rounded-2xl overflow-hidden shrink-0 cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <AnimatePresence>
          {isLensActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute top-2 w-full z-20 flex justify-center pointer-events-none"
            >
              <span 
                className="font-display text-amarelo text-sm md:text-base rotate-[-6deg]"
                style={{ WebkitTextStroke: "1px #2D1810" }}
              >
                {HOVER_MESSAGE}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Image */}
        <div className="absolute inset-0">
           <Image
            src={burger.imagem}
            alt={burger.nome}
            fill
            className="object-cover p-2 drop-shadow-md"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        {/* Empty plate - Revealed by clipPath */}
        <motion.div 
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ clipPath }}
        >
          <Image
            src="/assets/geral/prato-vazio-migalhas.png"
            alt="Prato vazio"
            fill
            className="object-cover p-2"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </motion.div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col justify-center flex-1">
        <h3 className="text-marrom-900 font-display font-black text-xl italic uppercase">
          {burger.nome}
        </h3>
        
        <p className="text-marrom-900/60 font-body text-xs flex-grow mb-3 leading-tight">
          {burger.descricao}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-alface font-mono font-bold text-lg">
             R$ {burger.preco.toFixed(2).replace('.', ',')}
          </span>
          <button 
            onClick={() => onSelect(burger)}
            className="bg-laranja text-white py-2 px-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-opacity"
            aria-label="ESCOLHER"
          >
            ESCOLHER
          </button>
        </div>
      </div>
    </motion.div>
  );
}
