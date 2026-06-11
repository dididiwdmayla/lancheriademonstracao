"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ItemSimples } from "@/lib/menu";
import { useCart } from "@/context/CartContext";
import { Plus, Check } from "lucide-react";

type CompactCardProps = {
  item: ItemSimples;
};

function CompactCard({ item }: CompactCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (added) return;
    // Add item as a single product, no addons/sauces, empty observation
    addItem(item, 1, false, [], [], "");
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  return (
    <div className="flex-shrink-0 w-[150px] md:w-[180px] bg-creme p-3 rounded-2xl flex flex-col shadow-lg snap-start border border-creme/5 group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="relative w-full aspect-square bg-marrom-900/5 rounded-xl p-2 mb-3 shrink-0">
        <Image
          src={item.imagem}
          alt={item.nome}
          fill
          className="object-contain drop-shadow-sm transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 150px, 180px"
        />
      </div>
      <div className="flex flex-col flex-1">
        <h3 className="font-body font-bold text-marrom-900 text-sm leading-tight mb-2 line-clamp-2">
          {item.nome}
        </h3>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-mono text-alface font-bold text-sm">
            R$ {item.preco.toFixed(2).replace('.', ',')}
          </span>
          <button
            onClick={handleAdd}
            disabled={added}
            aria-label={`Adicionar ${item.nome}`}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-md ${
              added 
                ? 'bg-alface text-creme' 
                : 'bg-laranja text-white hover:opacity-90 active:scale-95'
            }`}
          >
            {added ? <Check size={16} strokeWidth={4} /> : <Plus size={18} strokeWidth={3} />}
          </button>
        </div>
      </div>
    </div>
  );
}

type Props = {
  id: string;
  title: string;
  items: ItemSimples[];
};

export default function CompactSection({ id, title, items }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  return (
    <section id={id} className="pt-8 pb-12 px-4 max-w-7xl mx-auto relative z-10">
      <div className="mb-6 flex items-center border-b border-creme/10 pb-3">
        <h2 className="font-display text-2xl md:text-3xl text-amarelo italic uppercase tracking-tighter">
          {title}
        </h2>
      </div>
      
      <div className="relative">
        {/* Fade right indicator */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-marrom-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-marrom-900 to-transparent z-10 pointer-events-none md:hidden" />
        
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-6 pt-2 -mx-4 px-4 md:mx-0 md:px-0"
        >
          {items.map(item => (
            <CompactCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
