"use client";

import { useEffect, useState, use } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PedidoStatus } from "@/lib/pedidos";
import { ArrowLeft, Clock, ChefHat, Bike, CheckCircle, AlertTriangle, BellRing } from "lucide-react";
import { useRouter } from "next/navigation";

// Formatter
function formatCurrency(value: number) {
  return "R$ " + value.toFixed(2).replace(".", ",");
}

const statusMap: Record<PedidoStatus, { title: string; desc: string, icon: any, color: string }> = {
  aguardando_pagamento: { title: "Aguardando", desc: "Confirmação de pagamento", icon: Clock, color: "text-amarelo" },
  pago: { title: "Pago!", desc: "Aguardando cozinha", icon: CheckCircle, color: "text-alface" },
  em_preparo: { title: "Em Preparo", desc: "Sua fome está na chapa", icon: ChefHat, color: "text-amarelo" },
  saiu_entrega: { title: "Saiu pra Entrega", desc: "O motoboy tá voando", icon: Bike, color: "text-amarelo" },
  concluido: { title: "Entregue", desc: "Bom apetite!", icon: CheckCircle, color: "text-alface" },
  cancelado: { title: "Cancelado", desc: "Pedido cancelado", icon: AlertTriangle, color: "text-tomate" },
};

const getStatusOrder = (formaPagamento: string) => {
   if (formaPagamento === "online") {
      return ["aguardando_pagamento", "pago", "em_preparo", "saiu_entrega", "concluido"];
   }
   return ["em_preparo", "saiu_entrega", "concluido"];
};

export default function PedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [pedido, setPedido] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(() => {
    // Determine if we should ask for push
    if ("Notification" in window) {
      if (Notification.permission === "default" && !localStorage.getItem("ingarandi-push-asked")) {
        setShowNotificationPrompt(true);
      }
    }
  }, []);

  const handleAskNotification = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    localStorage.setItem("ingarandi-push-asked", "true");
    setShowNotificationPrompt(false);
  };

  const handleDismissNotification = () => {
    localStorage.setItem("ingarandi-push-asked", "true");
    setShowNotificationPrompt(false);
  };

  useEffect(() => {
    let lastStatus = "";

    const unsub = onSnapshot(doc(db, "pedidos", id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPedido(data);
        setLoading(false);

        // Notify if status changed
        if (lastStatus && lastStatus !== data.status && data.status !== "aguardando_pagamento") {
          const m = getStatusMessage(data.status);
          if (m) {
            // TODO: FCM for real push when app is closed. For now, browser Notification API.
            if ("Notification" in window && Notification.permission === "granted" && document.visibilityState === "hidden") {
              new Notification("Ingarandi Burger!", { body: m });
            } else {
              // Custom toast or just native notification if we prefer
              if ("Notification" in window && Notification.permission === "granted") {
                 new Notification("Ingarandi Burger!", { body: m });
              }
            }
          }
        }
        lastStatus = data.status;

      } else {
         setError(true);
         setLoading(false);
      }
    }, (err) => {
      console.error(err);
      // Wait to see if it heals, don't show full error
    });

    return () => unsub();
  }, [id]);

  if (loading) {
     return <div className="min-h-screen bg-marrom-900 flex justify-center items-center"><div className="w-8 h-8 rounded-full border-t-2 border-amarelo animate-spin" /></div>;
  }

  if (error || !pedido) {
     return (
        <div className="min-h-screen bg-marrom-900 flex flex-col justify-center items-center p-4 text-center">
            <h1 className="text-creme font-display text-4xl italic uppercase mb-2">Ops!</h1>
            <p className="text-marrom-600 mb-6">Pedido não encontrado ou ID inválido.</p>
            <button onClick={() => router.push("/")} className="bg-laranja text-creme px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:opacity-90">Ver Cardápio</button>
        </div>
     );
  }

  const orderedStatuses = getStatusOrder(pedido.formaPagamento);
  const statusIndex = orderedStatuses.indexOf(pedido.status);

  return (
    <div className="min-h-screen bg-marrom-900 text-creme font-body pb-20">
      {/* Header Space */}
      <div className="pt-6 pb-4 px-4 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="text-amarelo p-2 hover:bg-amarelo/10 rounded-full transition-colors flex items-center gap-2">
           <ArrowLeft size={20} />
           <span className="font-bold text-xs uppercase tracking-widest hidden sm:inline">Voltar</span>
        </button>
        <div className="font-display italic uppercase text-lg">Acompanhamento</div>
        <div className="w-10"></div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-4">
        
        {/* Notification Prompt */}
        {showNotificationPrompt && (
           <div className="bg-amarelo text-marrom-900 p-4 rounded-3xl mb-6 shadow-xl relative overflow-hidden flex flex-col gap-3">
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 bg-marrom-900 rounded-full flex items-center justify-center shrink-0 text-amarelo">
                    <BellRing size={20} />
                 </div>
                 <div>
                    <p className="font-bold mb-1 leading-snug">Quer ser avisado quando seu pedido sair pra entrega?</p>
                    <p className="text-xs opacity-80 leading-snug">Ative os avisos do navegador.</p>
                 </div>
              </div>
              <div className="flex gap-2 w-full mt-1">
                 <button onClick={handleDismissNotification} className="flex-1 py-2 text-xs font-bold uppercase tracking-widest hover:bg-marrom-900/10 rounded-full">Depois</button>
                 <button onClick={handleAskNotification} className="flex-1 py-2 bg-marrom-900 text-creme text-xs font-bold uppercase tracking-widest rounded-full hover:bg-marrom-900/90 shadow-md">Ativar Avisos</button>
              </div>
           </div>
        )}

        <h1 className="text-5xl border-b border-creme/10 pb-4 font-display italic text-amarelo uppercase tracking-tighter text-center">
           {pedido.codigo}
        </h1>

        {/* Timeline */}
        <div className="py-8 px-2 border-b border-creme/10">
          {pedido.status === "cancelado" ? (
             <div className="bg-tomate/10 border border-tomate/30 p-6 rounded-3xl text-center">
                 <AlertTriangle size={32} className="text-tomate mx-auto mb-3" />
                 <h2 className="font-display italic uppercase text-tomate text-xl mb-2">Pedido Cancelado</h2>
                 <p className="text-sm text-creme/80">Por favor, entre em contato pelo nosso WhatsApp para mais informações.</p>
             </div>
          ) : (
             <div className="relative border-l border-creme/10 ml-6 flex flex-col gap-10 mt-2">
                {orderedStatuses.map((s, idx) => {
                  const sInfo = statusMap[s as PedidoStatus];
                  const Icon = sInfo.icon;
                  const isPast = idx < statusIndex;
                  const isCurrent = idx === statusIndex;
                  const isFuture = idx > statusIndex;

                  return (
                    <div key={s} className="relative pl-8">
                       {/* Node */}
                       <div className={`absolute -left-3 top-[-2px] w-6 h-6 rounded-full flex items-center justify-center border-4 border-marrom-900 ${isPast ? 'bg-amarelo' : isCurrent ? 'bg-amarelo' : 'bg-creme/10'}`}>
                          {isPast && <CheckCircle size={12} className="text-marrom-900 bg-amarelo rounded-full" />}
                       </div>
                       
                       {/* Current Ping */}
                       {isCurrent && (
                          <div className="absolute -left-[14px] top-[-4px] w-7 h-7 rounded-full bg-amarelo opacity-40 animate-ping" />
                       )}

                       {/* Content */}
                       <div className={`${isPast ? 'opacity-70' : isFuture ? 'opacity-30' : 'opacity-100'}`}>
                          <div className="flex items-center gap-2 mb-1">
                             <Icon size={18} className={isCurrent ? sInfo.color : "text-creme"} />
                             <h3 className={`font-display italic uppercase ${isCurrent ? "text-xl text-creme" : "text-sm text-creme/80"}`}>{sInfo.title}</h3>
                          </div>
                          {isCurrent && <p className="text-sm font-bold text-amarelo">{sInfo.desc}</p>}
                       </div>
                    </div>
                  );
                })}
             </div>
          )}
        </div>

        {/* Order Details */}
        <div className="py-6">
           <h3 className="text-xs uppercase tracking-widest text-marrom-600 font-bold mb-4">Resumo do Pedido</h3>
           <div className="flex flex-col gap-3">
              {pedido.itens.map((item: any, i: number) => (
                 <div key={i} className="flex gap-3 justify-between bg-creme/5 p-3 rounded-2xl">
                    <div className="flex gap-3">
                        <div className="font-mono text-sm font-bold w-6 text-marrom-600">{item.quantidade}x</div>
                        <div>
                           <div className="font-bold font-display italic uppercase text-creme text-sm">{item.nome}</div>
                           {item.adicionais && item.adicionais.length > 0 && (
                              <div className="text-xs text-marrom-600 mt-1">
                                 + {item.adicionais.map((a:any) => `${a.qtd}x ${a.nome}`).join(", ")}
                              </div>
                           )}
                        </div>
                    </div>
                 </div>
              ))}
           </div>
           
           <div className="mt-6 flex justify-between items-center bg-amarelo text-marrom-900 p-4 rounded-3xl">
              <span className="font-bold text-sm uppercase tracking-widest">Total</span>
              <span className="font-mono font-bold text-xl">{formatCurrency(pedido.total)}</span>
           </div>
        </div>

      </div>
    </div>
  );
}

function getStatusMessage(status: string) {
   if (status === "em_preparo") return "Seu pedido está na chapa! 🔥";
   if (status === "saiu_entrega") return "Saiu pra entrega! 🛵";
   if (status === "concluido") return "Pedido entregue. Bom apetite! 🍔";
   return "";
}
