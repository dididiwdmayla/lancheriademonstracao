"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { itemCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${scrolled ? 'bg-marrom-900/40 backdrop-blur-md border-b border-creme/10' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        
        <div className="flex-1 flex justify-start">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amarelo rounded-full flex items-center justify-center border-2 border-marrom-900">
              <span className="text-marrom-900 font-display text-xl leading-none italic uppercase">I</span>
            </div>
            <span className="text-2xl font-display tracking-tighter text-creme italic uppercase hidden sm:block">INGARANDI BURGER!</span>
          </div>
        </div>

        <div className="flex-1 flex justify-end">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative bg-amarelo p-3 rounded-full text-marrom-900 shadow-lg shadow-black/20 hover:scale-105 transition-all"
            aria-label="Abrir carrinho"
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-tomate text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-marrom-900">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
