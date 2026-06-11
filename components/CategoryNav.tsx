"use client";

import { useEffect, useState } from "react";

const CATEGORIES = [
  { id: "hamburgueres", label: "Hambúrgueres" },
  { id: "bebidas", label: "Bebidas" },
  { id: "acompanhamentos", label: "Acompanhamentos" },
];

export default function CategoryNav() {
  const [activeId, setActiveId] = useState("hamburgueres");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; // Offset for header

      for (const category of CATEGORIES) {
        const element = document.getElementById(category.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveId(category.id);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Trigger once on mount
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <nav className="sticky top-16 z-30 bg-marrom-900/95 backdrop-blur-md border-y border-creme/10 shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex items-center gap-3 md:gap-6 overflow-x-auto scrollbar-hide py-3 snap-x">
          {CATEGORIES.map((cat) => (
            <li key={cat.id} className="flex-shrink-0 snap-start">
              <button
                onClick={() => scrollToSection(cat.id)}
                className={`px-5 py-2 rounded-full font-bold text-[10px] md:text-xs uppercase whitespace-nowrap transition-all ${
                  activeId === cat.id 
                    ? "bg-amarelo text-marrom-900 font-black italic shadow-md" 
                    : "border border-creme/20 text-creme/70 hover:opacity-100 hover:bg-white/5"
                }`}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
