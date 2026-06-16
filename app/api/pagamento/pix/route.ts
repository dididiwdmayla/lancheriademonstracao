import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getAdminDb } from "@/lib/firebase-admin";
import { calcularTotal } from "@/lib/calcular-pedido";

export async function POST(req: NextRequest) {
  try {
    console.log("[pix] 0. rota iniciada");

    if (!process.env.MP_ACCESS_TOKEN) console.error("[ENV] MP_ACCESS_TOKEN AUSENTE");
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) console.error("[ENV] FIREBASE_SERVICE_ACCOUNT_KEY AUSENTE");
    
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");
    } catch (e) {
      console.error("[ENV] FIREBASE_SERVICE_ACCOUNT_KEY não é JSON válido:", e);
    }

    const jsonBody = await req.json();
    console.log("[pix] 1. body recebido:", JSON.stringify(jsonBody));

    const { docId, itens, cliente } = jsonBody;

    if (!docId || !itens || itens.length === 0) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    console.log("[pix] 2. inicializando (ou reusando) firebase-admin...");
    getAdminDb(); // to ensure it doesn't break here

    // 1. Recalcula o total no servidor
    console.log("[pix] 3. recalculando total...");
    const { total } = calcularTotal(itens);
    console.log("[pix] 4. total recalculado:", total);

    // 2. Chama a API do Mercado Pago
    const mpToken = process.env.MP_ACCESS_TOKEN;
    if (!mpToken) {
        throw new Error("Configuração de pagamento incompleta no servidor.");
    }

    const idempotencyKey = uuidv4();

    // Data de expiração = agora + 30 minutos
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 30);
    // Mercado Pago aceita no formato yyyy-MM-dd'T'HH:mm:ss.SSSZ
    const dateOfExpiration = expirationDate.toISOString();

    const body = {
      transaction_amount: total,
      payment_method_id: "pix",
      payer: {
        email: "cliente@ingarandi.com.br", // Placeholder de email obrigatório para o payer em alguns contextos se não providenciado
        first_name: cliente?.nome?.split(" ")[0] || "Cliente"
      },
      external_reference: docId,
      description: `Pedido ${docId.substring(0, 5).toUpperCase()} - Ingarandi Burger`,
      date_of_expiration: dateOfExpiration
    };

    console.log("[pix] 5. chamando Mercado Pago (POST /v1/payments)...");
    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mpToken}`,
        "X-Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify(body)
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
       console.error("Erro MP Pix:", mpData);
       throw new Error(`Erro ao gerar Pix no MP: ${mpData?.message || mpResponse.statusText}`);
    }

    console.log("[pix] 6. Pix gerado com sucesso, paymentId:", mpData.id);

    // Retorna QR code
    return NextResponse.json({
      paymentId: mpData.id,
      qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64
    });

  } catch (error: any) {
    console.error("=== ERRO EM [PIX] ===");
    console.error("Mensagem:", error?.message);
    console.error("Stack:", error?.stack);
    console.error("Causa/resposta:", JSON.stringify(error?.cause ?? error?.response ?? error, null, 2));
    return NextResponse.json(
      { erro: true, detalhe: error?.message ?? "erro desconhecido" },
      { status: 500 }
    );
  }
}
