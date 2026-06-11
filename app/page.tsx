"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryNav from "@/components/CategoryNav";
import BurgerCard from "@/components/BurgerCard";
import CompactSection from "@/components/CompactSection";
import CustomizeSheet from "@/components/CustomizeSheet";
import CartDrawer from "@/components/CartDrawer";
import CheckoutModal from "@/components/CheckoutModal";
import UpsellToast from "@/components/UpsellToast";
import Footer from "@/components/Footer";
import DecorativeElement from "@/components/DecorativeElement";

import { Lanche } from "@/lib/menu";
import { useMenu } from "@/hooks/useMenu";

export default function Home() {
  const { data, loading, error, refetch } = useMenu();
  const [selectedBurger, setSelectedBurger] = useState<Lanche | null>(null);
  
  // State for UpsellToast
  const [lastAddedLancheId, setLastAddedLancheId] = useState<string | null>(null);

  const handleBurgerAdded = (lanche: Lanche) => {
    setLastAddedLancheId(lanche.id);
  };

  const handleToastAccept = (lanche: Lanche) => {
    setLastAddedLancheId(null); // Clear toast triggers
    setSelectedBurger(lanche);
  };

  const handleToastClose = () => {
    setLastAddedLancheId(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-marrom-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-creme/20 border-t-amarelo rounded-full animate-spin mb-4" />
          <p className="font-display italic uppercase text-creme">Preparando a cozinha...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-marrom-900 flex flex-col items-center justify-center p-4">
        <h2 className="font-display text-2xl text-tomate italic uppercase mb-2">Ops! Tivemos um problema.</h2>
        <p className="text-creme/60 font-body mb-6 text-center max-w-sm">{error || "Não foi possível carregar o cardápio."}</p>
        <button 
          onClick={refetch}
          className="bg-laranja text-white font-bold px-6 py-3 rounded-full hover:opacity-90 uppercase tracking-widest text-sm"
        >
          TENTAR NOVAMENTE
        </button>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-marrom-900 selection:bg-amarelo selection:text-marrom-900 overflow-x-hidden">
      <Header />
      <Hero />
      <CategoryNav />

      {/* BURGERS SECTION */}
      {data.lanches.length > 0 && (
        <section id="hamburgueres" className="pt-16 pb-8 px-4 max-w-7xl mx-auto relative z-10">
          <div className="mb-12 flex items-center justify-between border-b border-creme/10 pb-4">
            <h2 className="font-display text-4xl md:text-5xl text-amarelo italic uppercase">Nosso Cardápio</h2>
            <span className="text-xs text-alface font-mono hidden sm:inline-block">#SARANDIPREMIUM</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
            {data.lanches.map((burger) => (
              <BurgerCard 
                key={burger.id} 
                burger={burger} 
                onSelect={(b) => {
                  setLastAddedLancheId(null);
                  setSelectedBurger(b as Lanche); // BurgerCard passes logic, we adapt type
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Decorative 1 */}
      <div className="relative w-full h-10 -mt-10 mb-10 z-0">
        <DecorativeElement src="/assets/decorativos/tomate-fatia.png" side="left" rotate={12} width={200} height={200} />
      </div>

      {/* BEBIDAS SECTION */}
      <CompactSection id="bebidas" title="Bebidas" items={data.bebidas} />

      {/* Decorative 2 */}
      <div className="relative w-full h-10 z-0">
        <DecorativeElement src="/assets/decorativos/queijo-escorrendo.png" side="right" rotate={-8} width={240} height={240} className="-mt-20" />
      </div>

      {/* ACOMPANHAMENTOS SECTION */}
      <CompactSection id="acompanhamentos" title="Acompanhamentos" items={data.acompanhamentos} />

      {/* Decorative 3 */}
      <div className="relative w-full h-10 z-0">
        <DecorativeElement src="/assets/decorativos/bacon-tira.png" side="left" rotate={-15} width={280} height={280} className="-mt-24" />
      </div>

      <Footer />

      {/* Global Modals */}
      <CustomizeSheet 
        lanche={selectedBurger} 
        isOpen={!!selectedBurger} 
        onClose={() => setSelectedBurger(null)} 
        onAdded={handleBurgerAdded}
      />
      
      {/* Toast appears only when there is a recent added lanche ID */}
      {lastAddedLancheId && (
         <UpsellToast 
            lastAddedLancheId={lastAddedLancheId} 
            onAccept={handleToastAccept} 
            onClose={handleToastClose} 
         />
      )}

      <CartDrawer />
      <CheckoutModal />
      
    </main>
  );
}
