import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { CartItem } from "./menu";
import menuData from "../public/assets/menu.json";

export type FormaPagamento = "online" | "na_entrega";
export type DetalhePagamentoEntrega = "dinheiro" | "cartao" | "pix" | null;
export type PedidoStatus = "em_preparo" | "saiu_entrega" | "concluido" | "cancelado" | "aguardando_pagamento";

export interface DadosCliente {
  nome: string;
  telefone: string;
  endereco: string;
}

export const criarPedido = async (
  carrinho: CartItem[],
  dadosCliente: DadosCliente,
  formaPagamento: FormaPagamento,
  detalhePagamentoEntrega: DetalhePagamentoEntrega,
  observacoesGerais: string
) => {
  // 1. Verify site status
  const configDoc = await getDoc(doc(db, "config", "site"));
  if (configDoc.exists()) {
    const { siteAtivo, recebendoPedidos } = configDoc.data();
    if (siteAtivo === false || recebendoPedidos === false) {
      throw new Error("Estamos fechados no momento. Tente mais tarde!");
    }
  }

  // 2. Validate client data
  if (!dadosCliente.nome || !dadosCliente.telefone || !dadosCliente.endereco) {
    throw new Error("Preencha todos os dados de entrega.");
  }

  if (carrinho.length === 0) {
    throw new Error("O carrinho está vazio.");
  }

  // 3. Recalculate totals securely from menu.json
  let subtotal = 0;
  const itens = carrinho.map((item) => {
    // Validate bounds
    if (item.quantidade < 1 || item.quantidade > 20) {
      throw new Error("Quantidade inválida.");
    }

    // Find base item
    let precoUnit = 0;
    const lancheRef = menuData.lanches.find((l) => l.id === item.item.id);
    const bebidaRef = menuData.bebidas.find((b) => b.id === item.item.id);
    const acompRef = menuData.acompanhamentos.find((a) => a.id === item.item.id);
    
    if (lancheRef) precoUnit = lancheRef.preco;
    else if (bebidaRef) precoUnit = bebidaRef.preco;
    else if (acompRef) precoUnit = acompRef.preco;
    
    // Adicionais totals
    let adicionaisTotal = 0;
    const itemAdicionais = (item.adicionais || []).map((add) => {
      const ref = menuData.adicionais.find((a) => a.id === add.item.id);
      const preco = ref ? ref.preco : 0;
      adicionaisTotal += preco * add.quantidade;
      return { id: add.item.id, nome: add.item.nome, preco, qtd: add.quantidade };
    });

    // Molhos
    let molhosTotal = 0;
    const itemMolhos = (item.molhos || []).map((molho) => {
      const ref = menuData.molhos.find((m) => m.id === molho.item.id);
      const preco = ref ? ref.preco : 0;
      molhosTotal += preco * molho.quantidade;
      return { id: molho.item.id, nome: molho.item.nome, preco, qtd: molho.quantidade };
    });

    const totalItem = (precoUnit + adicionaisTotal + molhosTotal) * item.quantidade;
    subtotal += totalItem;

    return {
      id: item.item.id,
      nome: item.item.nome,
      precoUnit,
      quantidade: item.quantidade,
      adicionais: itemAdicionais,
      molhos: itemMolhos,
      observacao: item.observacao || ""
    };
  });

  const total = subtotal; // If we had delivery fee, it would be added here

  const status: PedidoStatus = formaPagamento === "online" ? "aguardando_pagamento" : "em_preparo";

  // 4. Save to Firestore
  const pedidoRef = doc(collection(db, "pedidos"));
  const codigo = "#" + pedidoRef.id.substring(0, 4).toUpperCase();
  
  const novoPedido = {
    codigo,
    status,
    formaPagamento,
    detalhePagamentoEntrega,
    cliente: dadosCliente,
    itens,
    subtotal,
    total,
    observacoesGerais,
    mercadoPago: { paymentId: null, linkComprovante: null },
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp()
  };

  const { setDoc } = await import("firebase/firestore");
  await setDoc(pedidoRef, novoPedido);
  
  return { codigo, total };
};

export const fecharPedidoNoClient = async (
  carrinho: CartItem[],
  dadosCliente: DadosCliente,
  formaPagamento: FormaPagamento,
  detalhePagamentoEntrega: DetalhePagamentoEntrega,
  observacoesGerais: string
) => {
  return criarPedido(carrinho, dadosCliente, formaPagamento, detalhePagamentoEntrega, observacoesGerais);
};
