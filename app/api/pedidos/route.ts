import { NextResponse } from "next/server";

// TODO: Reativar na fase Mercado Pago — criação de pedido migra para o servidor com recálculo de preços e Admin SDK.

/*
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { carrinho, dadosCliente, formaPagamento, detalhePagamentoEntrega, observacoesGerais } = body;
    
    // (Recálculo de preços pelo backend etc. usando Admin SDK)
    
    return NextResponse.json({ success: true, codigo: "#SERVER" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 });
  }
}
*/

export async function POST(req: Request) {
  return NextResponse.json({ error: "Implementação server-side dormante" }, { status: 501 });
}
