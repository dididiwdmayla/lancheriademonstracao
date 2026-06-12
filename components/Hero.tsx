"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { OPEN_DAYS, OPEN_HOUR, CLOSE_HOUR } from "@/lib/menu";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Hero() {
  const [isOpenByClock, setIsOpenByClock] = useState<boolean | null>(null);
  const [recebendoPedidos, setRecebendoPedidos] = useState<boolean | null>(null);

  useEffect(() => {
    // Config listener
    const unsub = onSnapshot(doc(db, "config", "site"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRecebendoPedidos(data.recebendoPedidos ?? true);
      } else {
        setRecebendoPedidos(true);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    // Calculate if we're open
    const checkAvailability = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      
      const isDayOpen = OPEN_DAYS.includes(day);
      const isHourOpen = hour >= OPEN_HOUR && hour < CLOSE_HOUR;
      
      setIsOpenByClock(isDayOpen && isHourOpen);
    };
    
    checkAvailability();
    const interval = setInterval(checkAvailability, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const scrollToMenu = () => {
    const el = document.getElementById("cardapio");
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 80, // Offset for sticky headers
        behavior: "smooth"
      });
    }
  };

  const isActuallyOpen = isOpenByClock && recebendoPedidos;

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-marrom-900">
      {/* Background Image - Absolute positioned */}
      <div className="absolute inset-0 w-full h-full z-0 bg-marrom-900">
        <Image
          src="/assets/geral/hero-bg.jpg"
          alt="Ingarandi Burger Artesanal"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-marrom-900 via-marrom-900/70 to-marrom-900/30 z-10" />
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center px-4 w-full pt-16">
        
        {/* Open/Close Badge */}
        {isOpenByClock !== null && recebendoPedidos !== null && (
          <div className="mb-8 flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest uppercase">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isActuallyOpen ? 'bg-alface' : 'bg-tomate'}`}></span>
            <span className="text-creme/80">
              {isActuallyOpen ? "ESTAMOS ABERTOS" : "ESTAMOS FECHADOS"}
            </span>
          </div>
        )}

        {/* Hero Title */}
        {/* Using standard text stroke approaches */}
        <div className="text-center flex flex-col items-center leading-[0.85] mb-6">
          <h1 
            className="font-display text-amarelo text-[clamp(4.5rem,15vw,10rem)] tracking-tighter italic uppercase"
            style={{
              WebkitTextStroke: "8px #1a0f0a",
              filter: "drop-shadow(10px 10px 0px #1a0f0a)",
              paintOrder: "stroke fill"
            }}
          >
            INGARANDI
          </h1>
          <h1 
            className="font-display text-amarelo text-[clamp(4.5rem,15vw,10rem)] tracking-tighter italic uppercase"
            style={{
              WebkitTextStroke: "8px #1a0f0a",
              filter: "drop-shadow(10px 10px 0px #1a0f0a)",
              paintOrder: "stroke fill"
            }}
          >
            BURGER!
          </h1>
        </div>

        {/* Subtitle */}
        <p className="font-body text-creme/80 text-lg md:text-2xl font-light mb-10 text-center max-w-sm md:max-w-xl leading-relaxed">
          Hambúrgueres artesanais feitos com <span className="text-amarelo font-bold">obsessão</span>
        </p>

        {/* CTA */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={scrollToMenu}
          className="bg-laranja text-white font-bold text-lg uppercase px-10 py-5 rounded-full shadow-xl shadow-orange-950/40 hover:opacity-90 transition-all font-body tracking-wider"
        >
          VER CARDÁPIO
        </motion.button>

      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-creme/80">
        <span className="font-display text-sm tracking-widest uppercase">ROLE</span>
        <motion.div
           animate={{ y: [0, 8, 0] }}
           transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
