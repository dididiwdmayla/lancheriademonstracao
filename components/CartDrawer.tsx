"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import menuData from "@/public/assets/menu.json";

export default function CartDrawer() {
  const { cart, removeItem, updateQuantity, total, isCartOpen, setIsCartOpen, setIsUpsellOpen, setIsCheckoutOpen } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCartOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsCartOpen(false);
    };
    if (isCartOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  const handleCheckout = () => {
    setIsCartOpen(false);
    // Add small delay to let drawer closing animation start before opening checkout
    setTimeout(() => setIsCheckoutOpen(true), 150);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-marrom-900/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full md:w-[420px] bg-marrom-900 h-full shadow-2xl flex flex-col border-l border-creme/10 text-creme"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-creme/10 shrink-0">
              <h2 className="font-display text-2xl text-creme flex items-center gap-3 italic uppercase">
                <ShoppingBag size={24} />
                MEU PEDIDO
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-10 h-10 bg-marrom-900 rounded-full border border-creme/20 flex items-center justify-center hover:bg-amarelo hover:text-marrom-900 hover:border-amarelo transition-colors"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 font-body">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <Image src="/assets/geral/prato-vazio-migalhas.png" alt="Empty" width={120} height={120} className="opacity-50 mb-6 grayscale" />
                  <p className="font-display text-xl text-creme mb-2">SEU CARRINHO ESTÁ VAZIO</p>
                  <p className="text-sm">Bateu aquela fome? Adicione algo gostoso!</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 bg-creme text-marrom-900 font-bold px-6 py-3 rounded-full hover:bg-amarelo transition-colors"
                  >
                    VER CARDÁPIO
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((cartItem) => {
                    const itemBasePrice = cartItem.item.preco;
                    const adicionaisTotal = cartItem.adicionais.reduce((sum, a) => sum + (a.item.preco * a.quantidade), 0);
                    const molhosTotal = cartItem.molhos.reduce((sum, m) => sum + (m.item.preco * m.quantidade), 0);
                    const lineTotal = (itemBasePrice + adicionaisTotal + molhosTotal) * cartItem.quantidade;
                    
                    return (
                      <div key={cartItem.cartItemId} className="flex gap-4 p-4 bg-marrom-900 border border-creme/20 rounded-3xl shadow-lg relative pr-10">
                        <div className="relative w-20 h-20 flex-shrink-0 bg-marrom-900/5 rounded-2xl overflow-hidden shrink-0 border border-creme/5">
                          <Image src={cartItem.item.imagem} alt={cartItem.item.nome} fill className="object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="font-display font-black text-creme italic uppercase leading-tight mb-1">{cartItem.item.nome}</h4>
                          
                          {cartItem.adicionais.length > 0 && (
                            <p className="text-xs text-creme/60 mb-1">
                              + {cartItem.adicionais.map(a => `${a.quantidade}x ${a.item.nome}`).join(", ")}
                            </p>
                          )}
                          
                          {cartItem.molhos.length > 0 && (
                            <p className="text-xs text-creme/60 mb-1">
                              + molho {cartItem.molhos.map(m => `${m.quantidade}x ${m.item.nome}`).join(", ")}
                            </p>
                          )}
                          
                          {cartItem.observacao && (
                            <p className="text-[10px] text-amarelo italic mb-2">
                              Obs: {cartItem.observacao}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-auto pt-2">
                            <div className="flex items-center bg-marrom-900 border border-creme/20 rounded-full">
                              <button onClick={() => updateQuantity(cartItem.cartItemId, -1)} className="w-7 h-7 flex items-center justify-center text-creme hover:text-amarelo rounded-full"><Minus size={14} /></button>
                              <span className="font-mono font-bold text-sm w-6 text-center">{cartItem.quantidade}</span>
                              <button onClick={() => updateQuantity(cartItem.cartItemId, 1)} className="w-7 h-7 flex items-center justify-center text-creme hover:text-amarelo rounded-full"><Plus size={14} /></button>
                            </div>
                            <span className="font-mono font-bold text-alface">
                              R$ {lineTotal.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeItem(cartItem.cartItemId)}
                          className="absolute top-4 right-4 text-creme/40 hover:text-tomate transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="bg-marrom-900 p-6 flex flex-col gap-4 shadow-[0_-10px_40px_rgba(26,15,10,0.5)] z-10 border-t border-creme/10">
                <div className="bg-marrom-900 border border-creme/20 p-5 rounded-[32px] shadow-2xl flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-creme/60">Seu Pedido</span>
                    <span className="text-2xl font-mono text-alface font-bold">R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="bg-amarelo text-marrom-900 px-6 py-3 rounded-2xl font-bold uppercase text-sm tracking-tighter flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    Finalizar
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path></svg>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
