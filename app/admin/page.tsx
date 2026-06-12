"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { LogOut, AlertTriangle, PlayCircle } from "lucide-react";

type PedidoStatus = "em_preparo" | "saiu_entrega" | "concluido" | "cancelado" | "aguardando_pagamento";

function formatStatus(status: PedidoStatus) {
  switch(status) {
    case "em_preparo": return "EM PREPARO";
    case "saiu_entrega": return "SAIU PRA ENTREGA";
    case "concluido": return "CONCLUÍDO";
    case "cancelado": return "CANCELADO";
    case "aguardando_pagamento": return "AGUARDANDO PAGAMENTO";
  }
}

function getStatusColor(status: PedidoStatus) {
  switch(status) {
    case "em_preparo": return "bg-amarelo text-marrom-900";
    case "saiu_entrega": return "bg-laranja text-white";
    case "concluido": return "bg-alface text-white";
    case "cancelado": return "bg-tomate text-white";
    case "aguardando_pagamento": return "bg-marrom-600 text-white";
  }
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loadingObj, setLoadingObj] = useState(true);
  
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [siteAtivo, setSiteAtivo] = useState(true);
  const [recebendoPedidos, setRecebendoPedidos] = useState(true);
  const [filter, setFilter] = useState<"todos" | PedidoStatus>("todos");
  
  const [showKillConfirm, setShowKillConfirm] = useState(false);
  const [killInput, setKillInput] = useState("");

  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastOrderCountRef = useRef(0);
  
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin/login");
      } else {
        setLoadingObj(false);
      }
    });
    return () => unsubAuth();
  }, [router]);

  useEffect(() => {
    if (loadingObj) return;

    // config/site listener
    const unsubConfig = onSnapshot(doc(db, "config", "site"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSiteAtivo(data.siteAtivo ?? true);
        setRecebendoPedidos(data.recebendoPedidos ?? true);
      }
    });

    // pedidos listener
    const q = query(collection(db, "pedidos"), orderBy("criadoEm", "desc"));
    const unsubPedidos = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Sound logic
      if (docs.length > lastOrderCountRef.current && lastOrderCountRef.current > 0 && soundEnabled) {
        playAlertSound();
      }
      lastOrderCountRef.current = docs.length;
      
      setPedidos(docs);
    });

    return () => {
      unsubConfig();
      unsubPedidos();
    };
  }, [loadingObj, soundEnabled]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    setSoundEnabled(true);
  };

  const playAlertSound = () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  };

  const updateStatus = async (id: string, newStatus: PedidoStatus) => {
    await updateDoc(doc(db, "pedidos", id), { status: newStatus });
  };
  
  const toggleRecebendo = async () => {
    await updateDoc(doc(db, "config", "site"), { recebendoPedidos: !recebendoPedidos });
  };

  const killSite = async () => {
    if (killInput.toUpperCase() === "PARAR") {
      await updateDoc(doc(db, "config", "site"), { siteAtivo: false });
      setShowKillConfirm(false);
      setKillInput("");
    }
  };

  const reviveSite = async () => {
    await updateDoc(doc(db, "config", "site"), { siteAtivo: true });
  };

  if (loadingObj) {
    return <div className="min-h-screen bg-marrom-900 flex items-center justify-center text-creme font-bold">Carregando...</div>;
  }

  const filteredPedidos = pedidos.filter(p => filter === "todos" || p.status === filter);

  return (
    <div className="min-h-screen bg-creme font-body text-marrom-900 pb-16">
      {/* Header */}
      <header className="bg-marrom-900 text-creme p-4 sticky top-0 z-30 shadow-md flex items-center justify-between">
        <div>
           <h1 className="font-display italic uppercase text-2xl text-amarelo">Painel de Pedidos</h1>
           <p className="text-xs font-mono opacity-60">Operação em Tempo Real</p>
        </div>
        <div className="flex items-center gap-4">
           {!soundEnabled && (
             <button onClick={initAudio} className="flex items-center gap-2 bg-amarelo text-marrom-900 px-3 py-1.5 rounded uppercase font-bold text-xs">
                <PlayCircle size={16} /> Ativar Som
             </button>
           )}
           <button onClick={() => signOut(auth)} className="flex items-center gap-2 hover:text-amarelo">
              <LogOut size={20} />
              <span className="hidden sm:inline font-bold tracking-widest text-xs uppercase">Sair</span>
           </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-8">
        
        {/* Emergency Controls */}
        <section className="bg-white border-2 border-tomate rounded-2xl p-6 shadow-sm">
           <div className="flex items-center gap-2 mb-4 text-tomate">
             <AlertTriangle size={24} />
             <h2 className="font-display italic uppercase text-xl">Controles de Emergência</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-marrom-900/10 p-4 rounded-xl flex items-center justify-between">
                 <div>
                   <h3 className="font-bold">Pausar Pedidos</h3>
                   <p className="text-sm opacity-70">Site fica no ar, mas checkout é bloqueado.</p>
                 </div>
                 <button 
                  onClick={toggleRecebendo}
                  className={`px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-sm transition-colors ${recebendoPedidos ? 'bg-marrom-900 text-white' : 'bg-alface text-white'}`}
                 >
                   {recebendoPedidos ? "PAUSAR" : "RELIGAR"}
                 </button>
              </div>

              <div className="border border-marrom-900/10 p-4 rounded-xl flex items-center justify-between">
                 <div>
                   <h3 className="font-bold">Desligar Site Público</h3>
                   <p className="text-sm opacity-70">O site entra em modo de manutenção imediato.</p>
                 </div>
                 {!siteAtivo ? (
                    <button 
                      onClick={reviveSite}
                      className="px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-sm bg-alface text-white"
                    >
                      RELIGAR SITE
                    </button>
                 ) : (
                    <button 
                      onClick={() => setShowKillConfirm(true)}
                      className="px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-sm bg-tomate text-white"
                    >
                      DESLIGAR
                    </button>
                 )}
              </div>
           </div>

           {showKillConfirm && (
             <div className="mt-4 p-4 bg-tomate/10 border border-tomate rounded-xl flex flex-col md:flex-row items-center gap-4">
               <span className="font-bold text-tomate">Digite <code className="bg-white px-2 rounded">PARAR</code> para confirmar:</span>
               <input 
                 type="text" 
                 value={killInput}
                 onChange={e => setKillInput(e.target.value)}
                 className="px-3 py-2 border border-tomate rounded bg-white w-32 focus:outline-none" 
               />
               <button 
                 disabled={killInput.toUpperCase() !== "PARAR"}
                 onClick={killSite}
                 className="px-4 py-2 bg-tomate text-white font-bold rounded disabled:opacity-50"
               >
                 CONFIRMAR DESLIGAMENTO
               </button>
               <button onClick={() => setShowKillConfirm(false)} className="px-4 py-2 text-marrom-900 underline font-bold text-sm">Cancelar</button>
             </div>
           )}
        </section>

        {/* Board */}
        <section>
          <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
             {["todos", "em_preparo", "saiu_entrega", "concluido", "cancelado"].map((status: any) => (
                <button 
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-full font-bold uppercase text-xs tracking-widest whitespace-nowrap border-2 ${
                    filter === status ? "bg-marrom-900 text-creme border-marrom-900" : "bg-white text-marrom-900 border-marrom-900/10 hover:border-marrom-900/30"
                  }`}
                >
                  {status === "todos" ? "TODOS" : formatStatus(status)}
                </button>
             ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {filteredPedidos.map(pedido => (
               <div key={pedido.id} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-marrom-900/10 flex flex-col">
                  {/* Top Header */}
                  <div className="flex justify-between items-start mb-4">
                     <div>
                       <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase mb-2 inline-block ${getStatusColor(pedido.status)}`}>
                         {formatStatus(pedido.status)}
                       </span>
                       <h2 className="font-display text-4xl text-marrom-900 italic">{pedido.codigo}</h2>
                     </div>
                     <div className="text-right">
                       <span className="block text-xs uppercase tracking-widest text-marrom-900/60 mb-1">TOTAL</span>
                       <span className="font-mono text-3xl text-alface font-black block">
                          R$ {pedido.total.toFixed(2).replace('.', ',')}
                       </span>
                     </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-creme p-3 rounded-xl mb-4 text-sm">
                     <p className="font-bold capitalize">{pedido.cliente.nome}</p>
                     <p className="font-mono opacity-80 mb-1">{pedido.cliente.telefone}</p>
                     <p className="opacity-80">{pedido.cliente.endereco}</p>
                     <div className="mt-2 pt-2 border-t border-marrom-900/10">
                       <span className="font-bold text-xs uppercase tracking-widest text-marrom-900/60">Pagamento: </span>
                       <span className="font-bold uppercase text-xs">
                          {pedido.formaPagamento === "na_entrega" ? `Na entrega (${pedido.detalhePagamentoEntrega})` : "Online"}
                       </span>
                     </div>
                  </div>

                  {/* Items */}
                  <div className="flex-1 space-y-3 mb-6">
                     {pedido.itens.map((item: any, idx: number) => (
                       <div key={idx} className="flex gap-2 text-sm border-b border-marrom-900/5 pb-2 last:border-0 last:pb-0">
                          <span className="font-mono font-bold">{item.quantidade}x</span>
                          <div>
                            <p className="font-bold">{item.nome}</p>
                            {item.adicionais?.map((a: any, i: number) => <p key={i} className="text-xs opacity-70">+ {a.qtd}x {a.nome}</p>)}
                            {item.molhos?.map((m: any, i: number) => <p key={i} className="text-xs opacity-70">+ molho {m.qtd}x {m.nome}</p>)}
                            {item.observacao && <p className="text-xs mt-1 text-tomate italic">Obs: {item.observacao}</p>}
                          </div>
                       </div>
                     ))}
                     {pedido.observacoesGerais && (
                       <div className="bg-amarelo/20 p-2 rounded text-xs">
                         <span className="font-bold uppercase tracking-widest text-[10px]">Obs Gerais:</span><br/>{pedido.observacoesGerais}
                       </div>
                     )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                     {pedido.status === "em_preparo" && (
                        <button onClick={() => updateStatus(pedido.id, "saiu_entrega")} className="col-span-2 bg-laranja text-white py-2 rounded-lg font-bold uppercase tracking-widest text-xs">Marcar "Saiu p/ Entrega"</button>
                     )}
                     {pedido.status === "saiu_entrega" && (
                        <button onClick={() => updateStatus(pedido.id, "concluido")} className="col-span-2 bg-alface text-white py-2 rounded-lg font-bold uppercase tracking-widest text-xs">Marcar "Concluído"</button>
                     )}
                     {pedido.status !== "cancelado" && pedido.status !== "concluido" && (
                        <button onClick={() => { if(confirm("Deseja realmente cancelar este pedido?")) updateStatus(pedido.id, "cancelado") }} className="col-span-2 bg-marrom-900/10 text-tomate py-2 rounded-lg font-bold uppercase tracking-widest text-xs">Cancelar Pedido</button>
                     )}
                  </div>
               </div>
             ))}
             {filteredPedidos.length === 0 && (
               <div className="col-span-full py-12 text-center text-marrom-900/60 font-bold uppercase tracking-widest text-sm">
                 Nenhum pedido encontrado.
               </div>
             )}
          </div>
        </section>
      </main>
    </div>
  );
}
