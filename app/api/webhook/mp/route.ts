import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    console.log("[webhook] 0. rota iniciada");

    if (!process.env.MP_ACCESS_TOKEN) console.error("[ENV] MP_ACCESS_TOKEN AUSENTE");
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) console.error("[ENV] FIREBASE_SERVICE_ACCOUNT_KEY AUSENTE");
    
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");
    } catch (e) {
      console.error("[ENV] FIREBASE_SERVICE_ACCOUNT_KEY não é JSON válido:", e);
    }

    let body;
    try {
      body = await req.json();
    } catch(e) {
      console.log("[webhook] Sem body JSON");
    }

    const url = new URL(req.url);
    const dataId = url.searchParams.get("data.id") || body?.data?.id;
    const type = url.searchParams.get("type") || body?.type;

    console.log(`[webhook] 1. recebido type=${type}, data.id=${dataId}`);

    if (type !== "payment" || !dataId) {
       // Return 200 so MP doesn't retry non-payment notifications continuously
       return NextResponse.json({ received: true });
    }

    const mpToken = process.env.MP_ACCESS_TOKEN;
    if (!mpToken) {
       throw new Error("MP_ACCESS_TOKEN missing in webhook logic.");
    }

    // Busca o pagamento atualizado diretamente do Mercado Pago
    console.log(`[webhook] 2. buscando pagamento ${dataId} na API do MP...`);
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
      headers: {
        "Authorization": `Bearer ${mpToken}`
      }
    });

    if (!paymentResponse.ok) {
       const resp = await paymentResponse.text();
       throw new Error(`Failed to fetch payment ${dataId} from MP. Status: ${paymentResponse.status}. Body: ${resp}`);
    }

    const paymentData = await paymentResponse.json();
    console.log(`[webhook] 3. MP Response: Status ${paymentData.status} | External Ref: ${paymentData.external_reference}`);

    const externalRef = paymentData.external_reference;
    if (!externalRef) {
       return NextResponse.json({ received: true }); // Ignore, not ours perhaps
    }

    console.log("[webhook] 4. inicializando firebase-admin...");
    const db = getAdminDb();
    const pedidoRef = db.collection("pedidos").doc(externalRef);
    const pedidoSnap = await pedidoRef.get();

    if (!pedidoSnap.exists) {
       console.error(`[webhook] Pedido ${externalRef} não encontrado.`);
       return NextResponse.json({ received: true });
    }

    const pedido = pedidoSnap.data();

    // Idempotência
    if (pedido?.status === "pago") {
       console.log(`[webhook] Pedido ${externalRef} já estava pago, ignorando.`);
       return NextResponse.json({ received: true });
    }

    const updateData: any = {
      atualizadoEm: Date.now(),
      mercadoPago: {
        ...(pedido?.mercadoPago || {}),
        paymentId: paymentData.id,
        ultimoStatus: paymentData.status,
      }
    };

    if (paymentData.status === "approved") {
        updateData.status = "pago"; // Isso dispara o som no painel
        
        // Link do comprovante (pode ser o link do painel ou transaction_details.receipt)
        const receiptUrl = paymentData.transaction_details?.receipt || `https://www.mercadopago.com.br/activities/${paymentData.id}`;
        updateData.mercadoPago.linkComprovante = receiptUrl;
    }

    console.log(`[webhook] 5. atualizando pedido ${externalRef}...`);
    await pedidoRef.update(updateData);
    console.log(`[webhook] 6. concluído!`);
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("=== ERRO EM [WEBHOOK] ===");
    console.error("Mensagem:", error?.message);
    console.error("Stack:", error?.stack);
    console.error("Causa/resposta:", JSON.stringify(error?.cause ?? error?.response ?? error, null, 2));
    return NextResponse.json(
      { erro: true, detalhe: error?.message ?? "erro desconhecido" },
      { status: 500 }
    );
  }
}
