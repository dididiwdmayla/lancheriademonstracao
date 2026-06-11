"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { WHATSAPP_NUMBER } from "@/lib/menu";

export default function CheckoutModal() {
  const { cart, total, isCheckoutOpen, setIsCheckoutOpen, clearCart } = useCart();
  
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [observacoesGlobais, setObservacoesGlobais] = useState("");
  
  const [showSummary, setShowSummary] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const formatPhone = (val: string) => {
    const raw = val.replace(/\D/g, "");
    let match = raw.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (!match) return val;
    return !match[2] 
      ? match[1] 
      : `(${match[1]}) ${match[2]}` + (match[3] ? `-${match[3]}` : "");
  };

  const isNomeValid = nome.trim().length > 2;
  const isEnderecoValid = endereco.trim().length > 5;
  const isTelefoneValid = telefone.replace(/\D/g, "").length >= 10;
  
  const isFormValid = isNomeValid && isEnderecoValid && isTelefoneValid;

  const handleCheckout = () => {
    if (!isFormValid) return;

    let text = `*NOVO PEDIDO — INGARANDI BURGER!*\n\n`;
    text += `*Cliente:* ${nome}\n`;
    text += `*Telefone:* ${telefone}\n`;
    text += `*Endereço:* ${endereco}\n\n`;
    text += `*PEDIDO:*\n`;

    cart.forEach(c => {
      const itemBasePrice = c.item.preco;
      const adicionaisTotal = c.adicionais.reduce((sum, a) => sum + (a.item.preco * a.quantidade), 0);
      const molhosTotal = c.molhos.reduce((sum, m) => sum + (m.item.preco * m.quantidade), 0);
      const lineTotal = (itemBasePrice + adicionaisTotal + molhosTotal) * c.quantidade;
      
      text += `${c.quantidade}x ${c.item.nome} (R$ ${lineTotal.toFixed(2).replace('.', ',')})\n`;
      if (c.adicionais.length > 0) {
        c.adicionais.forEach(a => {
          text += `   + ${a.quantidade}x ${a.item.nome} (R$ ${(a.item.preco * a.quantidade).toFixed(2).replace('.', ',')})\n`;
        });
      }
      if (c.molhos.length > 0) {
        c.molhos.forEach(m => {
          text += `   + molho ${m.quantidade}x ${m.item.nome} (R$ ${(m.item.preco * m.quantidade).toFixed(2).replace('.', ',')})\n`;
        });
      }
      if (c.observacao) {
        text += `   Obs: ${c.observacao}\n`;
      }
    });

    text += `\n*TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n`;
    
    if (observacoesGlobais) {
      text += `\nObs gerais: ${observacoesGlobais}`;
    }

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
    
    // Clear cart and show success view
    clearCart();
    setIsSent(true);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    if (isSent) {
      setTimeout(() => {
        setIsSent(false); // Reset for next time after animation
      }, 500);
    }
  };

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-marrom-900/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            className="relative bg-marrom-900 w-full md:max-w-xl max-h-[95vh] rounded-t-[32px] md:rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-creme/20 text-creme"
          >
            {isSent ? (
              <div className="p-12 flex flex-col items-center justify-center text-center h-[60vh] md:h-auto">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mb-6 text-alface"
                >
                  <CheckCircle size={80} strokeWidth={1.5} />
                </motion.div>
                <h2 className="font-display text-3xl text-amarelo italic uppercase mb-4">Pedido Enviado!</h2>
                <p className="font-body text-creme/80 mb-10 max-w-sm">
                  Agora é só finalizar a conversa com nosso atendente no WhatsApp. Seu pedido já está sendo preparado!
                </p>
                <button 
                  onClick={handleClose}
                  className="bg-laranja text-white font-bold tracking-widest uppercase py-4 px-8 rounded-xl shadow-lg hover:opacity-90 transition-opacity w-full"
                >
                  VOLTAR AO CARDÁPIO
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b border-creme/10 bg-marrom-900 shrink-0 z-10">
                  <h2 className="font-display text-2xl text-creme italic uppercase">FINALIZAR PEDIDO</h2>
                  <button 
                    onClick={handleClose}
                    className="w-10 h-10 bg-marrom-900 rounded-full border border-creme/20 flex items-center justify-center hover:bg-creme hover:text-marrom-900 transition-colors"
                    aria-label="Fechar"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto font-body bg-marrom-900 pb-8">
                  {/* Collapsible Summary */}
                  <div className="border-b border-creme/10 bg-white/5">
                    <button 
                      onClick={() => setShowSummary(!showSummary)}
                      className="w-full flex items-center justify-between p-4 font-bold text-sm tracking-widest uppercase text-creme hover:bg-white/5 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        Resumo do Pedido <span className="bg-amarelo text-marrom-900 px-2 py-0.5 rounded-full text-[10px]">{cart.length} itens</span>
                      </span>
                      {showSummary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    
                    <AnimatePresence>
                      {showSummary && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-marrom-900/50 px-4"
                        >
                          <div className="py-4 space-y-3">
                            {cart.map(c => (
                              <div key={c.cartItemId} className="flex justify-between text-sm items-start">
                                <div className="flex gap-3">
                                  <span className="font-mono font-bold text-creme/60">{c.quantidade}x</span>
                                  <div>
                                    <p className="font-bold text-creme">{c.item.nome}</p>
                                    {c.adicionais.map(a => (
                                      <p key={a.item.id} className="text-xs text-creme/50">+ {a.quantidade}x {a.item.nome}</p>
                                    ))}
                                    {c.molhos.map(m => (
                                      <p key={m.item.id} className="text-xs text-creme/50">+ molho {m.quantidade}x {m.item.nome}</p>
                                    ))}
                                  </div>
                                </div>
                                <span className="font-mono text-alface">
                                  R$ {((c.item.preco + c.adicionais.reduce((s,a) => s + a.item.preco*a.quantidade, 0) + c.molhos.reduce((s,m) => s + m.item.preco*m.quantidade, 0)) * c.quantidade).toFixed(2).replace('.', ',')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <form className="space-y-6 p-6" onSubmit={e => e.preventDefault()}>
                    <div>
                      <label className="block text-sm font-bold text-creme/80 mb-1 tracking-widest uppercase text-xs">Nome Completo *</label>
                      <input 
                        type="text" 
                        required
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-3 bg-marrom-900/50 focus:outline-none transition-colors text-creme placeholder:text-creme/30 ${
                          !isNomeValid && nome.length > 0 ? "border-tomate focus:border-tomate" : "border-creme/20 focus:border-amarelo"
                        }`}
                        placeholder="Seu nome"
                      />
                      {!isNomeValid && nome.length > 0 && <p className="text-tomate text-xs mt-1">Nome muito curto.</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-creme/80 mb-1 tracking-widest uppercase text-xs">Telefone / WhatsApp *</label>
                      <input 
                        type="tel" 
                        required
                        value={telefone}
                        onChange={e => setTelefone(formatPhone(e.target.value))}
                        className={`w-full border rounded-xl px-4 py-3 bg-marrom-900/50 focus:outline-none transition-colors text-creme placeholder:text-creme/30 ${
                          !isTelefoneValid && telefone.length > 0 ? "border-tomate focus:border-tomate" : "border-creme/20 focus:border-amarelo"
                        }`}
                        placeholder="(44) 99999-9999"
                        maxLength={15}
                      />
                      {!isTelefoneValid && telefone.length > 0 && <p className="text-tomate text-xs mt-1">Insira um número válido (com DDD).</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-creme/80 mb-1 tracking-widest uppercase text-xs">Endereço de Entrega *</label>
                      <textarea 
                        required
                        value={endereco}
                        onChange={e => setEndereco(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-3 bg-marrom-900/50 focus:outline-none transition-colors resize-none h-20 text-creme placeholder:text-creme/30 mb-1 ${
                          !isEnderecoValid && endereco.length > 0 ? "border-tomate focus:border-tomate" : "border-creme/20 focus:border-amarelo"
                        }`}
                        placeholder="Rua, Número, Bairro, Referência (Sarandi-PR)"
                      />
                      {!isEnderecoValid && endereco.length > 0 ? (
                        <p className="text-tomate text-xs">Endereço muito curto.</p>
                      ) : (
                        <p className="text-alface text-xs">* Entregamos apenas em Sarandi - PR</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-creme/80 mb-1 tracking-widest uppercase text-xs">Observações (Troco, etc.)</label>
                      <textarea 
                        value={observacoesGlobais}
                        onChange={e => setObservacoesGlobais(e.target.value)}
                        className="w-full border border-creme/20 rounded-xl px-4 py-3 bg-marrom-900/50 focus:outline-none focus:border-amarelo transition-colors resize-none h-16 text-creme placeholder:text-creme/30"
                        placeholder="Precisa de troco para quanto?"
                      />
                    </div>
                  </form>
                </div>

                <div className="p-6 bg-marrom-900 border-t border-creme/10 shrink-0">
                   <button 
                      onClick={handleCheckout}
                      disabled={!isFormValid}
                      className={`w-full font-bold tracking-widest uppercase text-lg py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${
                        isFormValid 
                          ? "bg-[#25D366] text-white shadow-lg hover:opacity-90 cursor-pointer" 
                          : "bg-marrom-900/50 border border-creme/10 text-creme/40 cursor-not-allowed"
                      }`}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                      FINALIZAR R$ {total.toFixed(2).replace('.', ',')}
                    </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
