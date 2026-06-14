"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Clock } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { itemCount, setIsCartOpen } = useCart();
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const router = useRouter();

  const loadOrders = () => {
    try {
      const existing = JSON.parse(localStorage.getItem('ingarandi-meus-pedidos') || '[]');
      const recent = existing.filter((p: any) => Date.now() - p.criadoEm < 24 * 60 * 60 * 1000);
      setActiveOrders(recent);
      if (existing.length !== recent.length) {
        localStorage.setItem('ingarandi-meus-pedidos', JSON.stringify(recent));
      }
    } catch {
      setActiveOrders([]);
    }
  };

  useEffect(() => {
    loadOrders();
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("order-updated", loadOrders);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("order-updated", loadOrders);
    };
  }, []);

  const handleOrdersClick = () => {
    if (activeOrders.length === 1) {
      router.push(`/pedido/${activeOrders[0].docId}`);
    } else {
      // For now, if multiple, go to the newest one.
      router.push(`/pedido/${activeOrders[activeOrders.length - 1].docId}`);
    }
  };

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

        <div className="flex-1 flex justify-end gap-3 items-center">
          {activeOrders.length > 0 && (
            <button 
              onClick={handleOrdersClick}
              className="relative flex items-center gap-2 bg-marrom-900/80 backdrop-blur-md border border-amarelo/30 px-3 py-2 rounded-full text-amarelo font-bold text-xs uppercase tracking-widest hover:bg-marrom-900 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-laranja animate-pulse shrink-0" />
              <span className="hidden sm:inline">Meu Pedido</span>
              <Clock size={16} className="sm:hidden" />
            </button>
          )}

          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative bg-amarelo p-3 rounded-full text-marrom-900 shadow-[0_4px_14px_0_rgba(255,217,61,0.39)] hover:scale-105 transition-all"
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
