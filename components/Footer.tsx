import { WHATSAPP_NUMBER, OPEN_DAYS } from "@/lib/menu";
import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-marrom-900 border-t-8 border-amarelo text-creme pt-16 pb-8 px-4 flex flex-col items-center overflow-hidden">
      {/* Texture Background */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-[0.13] mix-blend-soft-light">
        <Image 
          src="/assets/geral/footer-textura.png" 
          alt="Textura" 
          fill 
          className="object-cover"
        />
      </div>

      <div className="relative z-10 max-w-4xl w-full flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-12 mb-16">
        
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start max-w-xs">
          <h2 className="font-display text-amarelo tracking-tighter text-3xl mb-4"
              style={{
                WebkitTextStroke: "1px #FFD93D",
                filter: "drop-shadow(2px 2px 0px #FF914D)"
              }}>
            INGARANDI BURGER!
          </h2>
          <p className="font-body text-creme/70 text-sm leading-relaxed">
            Hambúrgueres artesanais feitos com obsessão em Sarandi. Seu novo vício.
          </p>
        </div>

        {/* Working Hours */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="font-display text-xl mb-4 uppercase tracking-widest text-creme/50">Horário</h3>
          <p className="font-body font-bold mb-1">Terça a Domingo</p>
          <p className="font-mono text-amarelo bg-amarelo/10 px-3 py-1 rounded inline-block">18:00 — 23:00</p>
        </div>

        {/* Contact */}
        <div className="flex flex-col items-center md:items-start">
           <h3 className="font-display text-xl mb-4 uppercase tracking-widest text-creme/50">Contato</h3>
           <p className="font-body text-sm mb-4">Sarandi — Paraná</p>
           <a 
             href={`https://wa.me/${WHATSAPP_NUMBER}`}
             target="_blank"
             rel="noopener noreferrer"
             className="font-body font-bold text-alface hover:text-white transition-colors flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-alface/30 hover:border-alface"
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
               <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
             </svg>
             Fazer Pedido
           </a>
        </div>
      </div>

      <div className="w-full max-w-4xl border-t border-creme/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-mono text-xs text-creme/40">© {year} Ingarandi Burger. Todos os direitos reservados.</p>
        <p className="font-mono text-xs text-creme/30">CRAFTED WITH OBSESSION</p>
      </div>
    </footer>
  );
}
