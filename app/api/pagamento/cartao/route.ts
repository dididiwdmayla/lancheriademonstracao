import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { calcularTotal } from "@/lib/calcular-pedido";

export async function POST(req: NextRequest) {
  try {
    console.log("[cartao] 0. rota iniciada");

    if (!process.env.MP_ACCESS_TOKEN) console.error("[ENV] MP_ACCESS_TOKEN AUSENTE");
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) console.error("[ENV] FIREBASE_SERVICE_ACCOUNT_KEY AUSENTE");
    
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");
    } catch (e) {
      console.error("[ENV] FIREBASE_SERVICE_ACCOUNT_KEY não é JSON válido:", e);
    }

    const jsonBody = await req.json();
    console.log("[cartao] 1. body recebido:", JSON.stringify(jsonBody));

    const { docId, codigo, itens, cliente } = jsonBody;

    if (!docId || !codigo || !itens || itens.length === 0) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    console.log("[cartao] 2. inicializando (ou reusando) firebase-admin...");
    getAdminDb();

    // 1. Recalcula o total no servidor
    console.log("[cartao] 3. recalculando total...");
    const { total } = calcularTotal(itens);
    console.log("[cartao] 4. total recalculado:", total);

    // 2. Cria a preferência no Mercado Pago
    const mpToken = process.env.MP_ACCESS_TOKEN;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!mpToken || !baseUrl) {
      throw new Error("Configuração de pagamento incompleta no servidor.");
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

    console.log("[cartao] 5. chamando Mercado Pago (POST /checkout/preferences)...");
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
       throw new Error(`Erro ao iniciar pagamento com cartão: ${mpData?.message || mpResponse.statusText}`);
    }

    console.log("[cartao] 6. preferencia criada:", mpData.id);

    return NextResponse.json({
      init_point: mpData.init_point
    });

  } catch (error: any) {
    console.error("=== ERRO EM [CARTAO] ===");
    console.error("Mensagem:", error?.message);
    console.error("Stack:", error?.stack);
    console.error("Causa/resposta:", JSON.stringify(error?.cause ?? error?.response ?? error, null, 2));
    return NextResponse.json(
      { erro: true, detalhe: error?.message ?? "erro desconhecido" },
      { status: 500 }
    );
  }
}
