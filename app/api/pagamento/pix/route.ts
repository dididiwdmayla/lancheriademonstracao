import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getAdminDb } from "@/lib/firebase-admin";
import { calcularTotal } from "@/lib/calcular-pedido";

export async function POST(req: NextRequest) {
  try {
    const { docId, itens, cliente } = await req.json();

    if (!docId || !itens || itens.length === 0) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // 1. Recalcula o total no servidor
    const { total } = calcularTotal(itens);

    // 2. Chama a API do Mercado Pago
    const mpToken = process.env.MP_ACCESS_TOKEN;
    if (!mpToken) {
        return NextResponse.json({ error: "Configuração de pagamento incompleta no servidor." }, { status: 500 });
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
       return NextResponse.json({ error: "Erro ao gerar Pix no Mercado Pago" }, { status: 502 });
    }

    // Retorna QR code
    return NextResponse.json({
      paymentId: mpData.id,
      qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64
    });

  } catch (error: any) {
    console.error("Erro rota Pix:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
