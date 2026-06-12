"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronDown, ChevronUp, CheckCircle, Wallet, CreditCard, Banknote, Smartphone } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { WHATSAPP_NUMBER } from "@/lib/menu";
import { criarPedido, FormaPagamento, DetalhePagamentoEntrega } from "@/lib/pedidos";

export default function CheckoutModal() {
  const { cart, total, isCheckoutOpen, setIsCheckoutOpen, clearCart } = useCart();
  
  const [step, setStep] = useState<"dados" | "pagamento" | "sucesso">("dados");
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [observacoesGlobais, setObservacoesGlobais] = useState("");
  
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pedidoCodigo, setPedidoCodigo] = useState<string>("");

  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("na_entrega");
  const [detalhePagamento, setDetalhePagamento] = useState<DetalhePagamentoEntrega>(null);

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
  
  const isDadosValid = isNomeValid && isEnderecoValid && isTelefoneValid;
  const isPagamentoValid = formaPagamento === "na_entrega" && detalhePagamento !== null;

  const handleCreateOrder = async () => {
    if (!isPagamentoValid) return;
    
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      const result = await criarPedido(
        cart, 
        { nome, telefone, endereco },
        formaPagamento,
        detalhePagamento,
        observacoesGlobais
      );
      
      setPedidoCodigo(result.codigo);
      clearCart();
      setStep("sucesso");
    } catch (err: any) {
      setSubmitError(err.message || "Erro ao processar pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppFollowUp = () => {
    let text = `*NOVO PEDIDO ${pedidoCodigo} — INGARANDI BURGER!*\n\n`;
    text += `*Cliente:* ${nome}\n`;
    text += `*Telefone:* ${telefone}\n`;
    text += `*Endereço:* ${endereco}\n`;
    text += `*Pagamento:* Na entrega (${detalhePagamento})\n\n`;
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
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    if (step === "sucesso") {
      setTimeout(() => {
        setStep("dados"); 
        setPedidoCodigo("");
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
            {step === "sucesso" ? (
              <div className="p-12 flex flex-col items-center justify-center text-center h-[60vh] md:h-auto">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mb-6 text-alface"
                >
                  <CheckCircle size={80} strokeWidth={1.5} />
                </motion.div>
                <h2 className="font-display text-4xl text-amarelo italic uppercase mb-2">{pedidoCodigo}</h2>
                <h3 className="font-display text-2xl text-creme italic uppercase mb-4">Pedido Confirmado!</h3>
                <p className="font-body text-creme/80 mb-10 max-w-sm">
                  Agora é só aguardar! Se quiser, você pode acompanhar seu pedido pelo nosso WhatsApp.
                </p>
                <button 
                  onClick={handleWhatsAppFollowUp}
                  className="bg-[#25D366] text-white font-bold tracking-widest uppercase py-4 px-8 rounded-xl shadow-lg hover:opacity-90 transition-opacity w-full mb-4 flex items-center justify-center gap-2"
                >
                  <Smartphone size={20} />
                  ACOMPANHAR PELO WHATSAPP
                </button>
                <button 
                  onClick={handleClose}
                  className="bg-marrom-900/50 border border-creme/20 text-creme font-bold tracking-widest uppercase py-4 px-8 rounded-xl hover:bg-white/5 transition-opacity w-full"
                >
                  VOLTAR AO CARDÁPIO
                </button>
              </div>
            ) : step === "pagamento" ? (
              <>
                <div className="flex items-center justify-between p-6 border-b border-creme/10 bg-marrom-900 shrink-0 z-10">
                  <h2 className="font-display text-2xl text-creme italic uppercase">PAGAMENTO</h2>
                  <button 
                    onClick={handleClose}
                    className="w-10 h-10 bg-marrom-900 rounded-full border border-creme/20 flex items-center justify-center hover:bg-creme hover:text-marrom-900 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {submitError && (
                    <div className="bg-tomate/20 border border-tomate p-4 rounded-xl text-creme text-sm font-bold text-center">
                      {submitError}
                    </div>
                  )}
                  
                  <div className="space-y-4">
                     <button
                        onClick={() => setFormaPagamento("na_entrega")}
                        className={`w-full p-4 border rounded-xl flex items-center gap-4 transition-colors ${
                          formaPagamento === "na_entrega" ? "bg-amarelo/10 border-amarelo text-amarelo" : "border-creme/20 text-creme"
                        }`}
                      >
                        <Wallet size={24} />
                        <span className="font-bold tracking-widest uppercase">Pagar na Entrega</span>
                      </button>

                      {formaPagamento === "na_entrega" && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pl-10 space-y-3">
                           <button 
                             onClick={() => setDetalhePagamento("dinheiro")} 
                             className={`w-full flex items-center gap-3 p-3 border rounded-xl text-sm font-bold tracking-widest uppercase transition-colors ${detalhePagamento === "dinheiro" ? "bg-white/10 border-creme text-white" : "border-creme/10 text-creme/60"}`}
                           >
                              <Banknote size={20} /> Dinheiro
                           </button>
                           <button 
                             onClick={() => setDetalhePagamento("cartao")} 
                             className={`w-full flex items-center gap-3 p-3 border rounded-xl text-sm font-bold tracking-widest uppercase transition-colors ${detalhePagamento === "cartao" ? "bg-white/10 border-creme text-white" : "border-creme/10 text-creme/60"}`}
                           >
                              <CreditCard size={20} /> Cartão
                           </button>
                           <button 
                             onClick={() => setDetalhePagamento("pix")} 
                             className={`w-full flex items-center gap-3 p-3 border rounded-xl text-sm font-bold tracking-widest uppercase transition-colors ${detalhePagamento === "pix" ? "bg-white/10 border-creme text-white" : "border-creme/10 text-creme/60"}`}
                           >
                              <Smartphone size={20} /> Pix
                           </button>
                        </motion.div>
                      )}

                      <button
                        disabled
                        className="w-full p-4 border border-creme/10 rounded-xl flex items-center justify-between opacity-50 cursor-not-allowed"
                      >
                        <div className="flex items-center gap-4 text-creme/50">
                          <CreditCard size={24} />
                          <span className="font-bold tracking-widest uppercase">Pagar Online</span>
                        </div>
                        <span className="bg-marrom-600 px-2 py-1 rounded text-[10px] font-bold text-creme">EM BREVE</span>
                      </button>
                  </div>
                </div>

                <div className="p-6 bg-marrom-900 border-t border-creme/10 shrink-0 flex gap-4">
                     <button 
                        onClick={() => setStep("dados")}
                        disabled={isSubmitting}
                        className="font-bold tracking-widest uppercase text-creme hover:text-white px-4"
                     >
                       Voltar
                     </button>
                     <button 
                        onClick={handleCreateOrder}
                        disabled={!isPagamentoValid || isSubmitting}
                        className={`flex-1 font-bold tracking-widest uppercase py-4 rounded-xl flex items-center justify-center transition-all ${
                          isPagamentoValid && !isSubmitting
                            ? "bg-alface text-white shadow-lg hover:opacity-90 cursor-pointer" 
                            : "bg-marrom-900/50 border border-creme/10 text-creme/40 cursor-not-allowed"
                        }`}
                      >
                        {isSubmitting ? "PROCESSANDO..." : `CONFIRMAR R$ ${total.toFixed(2).replace('.', ',')}`}
                      </button>
                </div>
              </>
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
                      onClick={() => setStep("pagamento")}
                      disabled={!isDadosValid}
                      className={`w-full font-bold tracking-widest uppercase text-lg py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${
                        isDadosValid 
                          ? "bg-alface text-white shadow-lg hover:opacity-90 cursor-pointer" 
                          : "bg-marrom-900/50 border border-creme/10 text-creme/40 cursor-not-allowed"
                      }`}
                    >
                      CONTINUAR
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
