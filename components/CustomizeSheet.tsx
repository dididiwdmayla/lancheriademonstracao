import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { X, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Lanche, Adicional, ItemSimples, CartItemAddon, CartItemMolho } from "@/lib/menu";
import { useMenu } from "@/hooks/useMenu";

type CustomizeSheetProps = {
  lanche: Lanche | null;
  isOpen: boolean;
  onClose: () => void;
  onAdded: (lanche: Lanche) => void;
};

export default function CustomizeSheet({ lanche, isOpen, onClose, onAdded }: CustomizeSheetProps) {
  const { cart, addItem } = useCart();
  const { data } = useMenu();

  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");
  
  // State for steppers
  const [adicionaisCounts, setAdicionaisCounts] = useState<Record<string, number>>({});
  const [molhosCounts, setMolhosCounts] = useState<Record<string, number>>({});
  const [bebidasCounts, setBebidasCounts] = useState<Record<string, number>>({});
  const [acompanhamentosCounts, setAcompanhamentosCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen && lanche) {
      setQuantity(1);
      setObservation("");
      setAdicionaisCounts({});
      setMolhosCounts({});
      setBebidasCounts({});
      setAcompanhamentosCounts({});
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, lanche]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!lanche || !data) return null;

  const handleUpdateCount = (setter: React.Dispatch<React.SetStateAction<Record<string, number>>>, id: string, delta: number, max: number = 3) => {
    setter(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, Math.min(max, current + delta));
      const newState = { ...prev };
      if (next === 0) {
        delete newState[id];
      } else {
        newState[id] = next;
      }
      return newState;
    });
  };

  const handleAddToCart = () => {
    if (!lanche) return;

    // Build CartItemAddon array
    const cartAdicionais: CartItemAddon[] = [];
    Object.entries(adicionaisCounts).forEach(([id, qty]) => {
      const addon = data.adicionais.find(a => a.id === id);
      if (addon) cartAdicionais.push({ item: addon, quantidade: qty });
    });

    // Build CartItemMolho array
    const cartMolhos: CartItemMolho[] = [];
    Object.entries(molhosCounts).forEach(([id, qty]) => {
      const molho = data.molhos.find(m => m.id === id);
      if (molho) cartMolhos.push({ item: molho, quantidade: qty });
    });

    // Add main burger
    addItem(lanche, quantity, true, cartAdicionais, cartMolhos, observation);

    // Add drinks as separate items
    Object.entries(bebidasCounts).forEach(([id, qty]) => {
      const bebida = data.bebidas.find(b => b.id === id);
      if (bebida) addItem(bebida, qty, false, [], [], "");
    });

    // Add sides as separate items
    Object.entries(acompanhamentosCounts).forEach(([id, qty]) => {
      const acomp = data.acompanhamentos.find(a => a.id === id);
      if (acomp) addItem(acomp, qty, false, [], [], "");
    });

    onAdded(lanche);
    onClose();
  };

  const calculateTotal = () => {
    let t = lanche.preco;
    Object.entries(adicionaisCounts).forEach(([id, qty]) => {
      const addon = data.adicionais.find(a => a.id === id);
      if (addon) t += addon.preco * qty;
    });
    Object.entries(molhosCounts).forEach(([id, qty]) => {
      const molho = data.molhos.find(m => m.id === id);
      if (molho) t += molho.preco * qty;
    });
    
    // Burger quantity total
    t = t * quantity;

    Object.entries(bebidasCounts).forEach(([id, qty]) => {
      const bebida = data.bebidas.find(b => b.id === id);
      if (bebida) t += bebida.preco * qty;
    });
    Object.entries(acompanhamentosCounts).forEach(([id, qty]) => {
      const acomp = data.acompanhamentos.find(a => a.id === id);
      if (acomp) t += acomp.preco * qty;
    });

    return t;
  };

  const total = calculateTotal();

  const StepperRow = ({ item, count, onUpdate, max = 3 }: { item: Adicional | ItemSimples, count: number, onUpdate: (delta: number) => void, max?: number }) => (
    <div className={`flex items-center p-3 rounded-xl border transition-colors ${count > 0 ? 'border-amarelo bg-amarelo/5' : 'border-creme/10 hover:border-creme/30'}`}>
      <div className="relative w-10 h-10 bg-white/5 rounded-lg flex-shrink-0 mr-4 p-1 border border-creme/10">
        <Image src={item.imagem} alt={item.nome} fill className="object-contain drop-shadow-sm" />
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <span className="font-body text-creme font-bold text-sm leading-tight">{item.nome}</span>
        <span className="font-mono text-alface font-bold text-xs mt-0.5">
          + R$ {item.preco.toFixed(2).replace('.', ',')}
        </span>
      </div>
      <div className="flex items-center bg-marrom-900 border border-creme/20 rounded-full h-8">
        <button onClick={() => onUpdate(-1)} className={`w-8 h-full flex items-center justify-center rounded-l-full transition-colors ${count > 0 ? 'text-creme hover:text-amarelo' : 'text-creme/20'}`} disabled={count === 0}><Minus size={14} /></button>
        <span className="font-mono font-bold text-sm w-4 text-center text-creme">{count}</span>
        <button onClick={() => onUpdate(1)} className={`w-8 h-full flex items-center justify-center rounded-r-full transition-colors ${count < max ? 'text-creme hover:text-amarelo' : 'text-creme/20'}`} disabled={count === max}><Plus size={14} /></button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center md:items-end justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-marrom-900/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-marrom-900 w-full md:max-w-2xl h-[95vh] md:h-[85vh] md:mb-8 rounded-t-[32px] md:rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-creme/20"
          >
            {/* Header / Close */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-marrom-900 rounded-full border border-creme/20 text-creme flex items-center justify-center hover:bg-creme hover:text-marrom-900 transition-colors shadow-lg"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-32">
              
              <div className="flex flex-col md:flex-row gap-6 mb-8 mt-4">
                {/* Image */}
                <div className="relative aspect-square w-full md:w-48 bg-marrom-900/5 rounded-2xl flex-shrink-0 border border-creme/10">
                  <Image 
                    src={lanche.imagem} 
                    alt={lanche.nome} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 192px"
                    className="object-contain p-4 drop-shadow-md"
                  />
                </div>
                
                {/* Info */}
                <div>
                  <h2 className="font-display text-creme italic uppercase text-3xl mb-2 leading-none">
                    {lanche.nome}
                  </h2>
                  <p className="font-body text-creme/60 text-sm mb-4">
                    {lanche.descricao}
                  </p>
                  <p className="font-mono text-alface font-bold text-xl">
                    R$ {lanche.preco.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>

              {/* Addons */}
              {data.adicionais.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-display text-amarelo italic uppercase text-lg mb-4 tracking-tight">TURBINE SEU LANCHE</h3>
                  <div className="space-y-3">
                    {data.adicionais.map(addon => (
                      <StepperRow 
                        key={addon.id} 
                        item={addon} 
                        count={adicionaisCounts[addon.id] || 0} 
                        onUpdate={(d) => handleUpdateCount(setAdicionaisCounts, addon.id, d)} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Molhos */}
              {data.molhos.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-display text-amarelo italic uppercase text-lg mb-4 tracking-tight">MOLHOS</h3>
                  <div className="space-y-3">
                    {data.molhos.map(molho => (
                      <StepperRow 
                        key={molho.id} 
                        item={molho} 
                        count={molhosCounts[molho.id] || 0} 
                        onUpdate={(d) => handleUpdateCount(setMolhosCounts, molho.id, d)} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Bebidas */}
              {data.bebidas.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-display text-amarelo italic uppercase text-lg mb-4 tracking-tight">BEBIDAS</h3>
                  <div className="space-y-3">
                    {data.bebidas.map(bebida => (
                      <StepperRow 
                        key={bebida.id} 
                        item={bebida} 
                        count={bebidasCounts[bebida.id] || 0} 
                        onUpdate={(d) => handleUpdateCount(setBebidasCounts, bebida.id, d)} 
                        max={10}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Acompanhamentos */}
              {data.acompanhamentos.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-display text-amarelo italic uppercase text-lg mb-4 tracking-tight">ACOMPANHAMENTOS</h3>
                  <div className="space-y-3">
                    {data.acompanhamentos.map(acomp => (
                      <StepperRow 
                        key={acomp.id} 
                        item={acomp} 
                        count={acompanhamentosCounts[acomp.id] || 0} 
                        onUpdate={(d) => handleUpdateCount(setAcompanhamentosCounts, acomp.id, d)} 
                        max={10}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Stepper + Observation */}
              <div className="flex flex-col md:flex-row gap-6">
                 <div className="flex-shrink-0">
                   <h3 className="font-display text-creme/60 tracking-widest uppercase text-xs mb-3">QUANTIDADE DO LANCHE</h3>
                   <div className="flex items-center gap-4 bg-marrom-900 border border-creme/20 rounded-full p-1 w-full md:w-auto shadow-inner">
                     <button 
                       onClick={() => setQuantity(Math.max(1, quantity - 1))}
                       className="w-10 h-10 rounded-full hover:bg-creme/10 flex items-center justify-center text-creme transition-colors"
                     >
                       <Minus size={20} />
                     </button>
                     <span className="font-mono font-bold text-xl min-w-[20px] text-center text-creme">
                       {quantity}
                     </span>
                     <button 
                       onClick={() => setQuantity(quantity + 1)}
                       className="w-10 h-10 rounded-full hover:bg-creme/10 flex items-center justify-center text-creme transition-colors"
                     >
                       <Plus size={20} />
                     </button>
                   </div>
                 </div>

                 <div className="flex-1">
                   <h3 className="font-display text-creme/60 tracking-widest uppercase text-xs mb-3">OBSERVAÇÃO (OPCIONAL)</h3>
                   <textarea 
                     value={observation}
                     onChange={(e) => setObservation(e.target.value)}
                     placeholder="Tirar molho, ponto da carne, etc..."
                     className="w-full bg-marrom-900/50 border border-creme/20 rounded-xl p-3 font-body text-sm text-creme focus:outline-none focus:border-amarelo transition-colors resize-none h-24 placeholder:text-creme/30"
                   />
                 </div>
              </div>

            </div>

            {/* Sticky Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-marrom-900 border-t border-creme/20 p-4">
              <button 
                onClick={handleAddToCart}
                className="w-full bg-laranja text-white font-bold tracking-widest uppercase text-lg py-4 rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-4"
              >
                <span>ADICIONAR</span>
                <span className="font-mono bg-marrom-900/30 px-3 py-1 rounded">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
