import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { calcularTotal } from "@/lib/calcular-pedido";

export async function POST(req: NextRequest) {
  try {
    const { docId, codigo, itens, cliente } = await req.json();

    if (!docId || !codigo || !itens || itens.length === 0) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // 1. Recalcula o total no servidor
    const { total } = calcularTotal(itens);

    // 2. Cria a preferência no Mercado Pago
    const mpToken = process.env.MP_ACCESS_TOKEN;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!mpToken || !baseUrl) {
      return NextResponse.json({ error: "Configuração de pagamento incompleta no servidor." }, { status: 500 });
    }

    const body = {
      items: [
        {
          title: `Pedido #${codigo} - Ingarandi Burger`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: total
        }
      ],
      payer: {
        name: cliente?.nome || "Cliente",
        email: "cliente@ingarandi.com.br"
      },
      external_reference: docId,
      back_urls: {
        success: `${baseUrl}/pedido/${docId}?retorno=mp`,
        pending: `${baseUrl}/pedido/${docId}?retorno=mp`,
        failure: `${baseUrl}/pedido/${docId}?retorno=mp`
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/webhook/mp`,
      statement_descriptor: "INGARANDI"
    };

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mpToken}`
      },
      body: JSON.stringify(body)
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
       console.error("Erro MP Preferences:", mpData);
       return NextResponse.json({ error: "Erro ao iniciar pagamento com cartão" }, { status: 502 });
    }

    return NextResponse.json({
      init_point: mpData.init_point
    });

  } catch (error: any) {
    console.error("Erro rota Cartão:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
