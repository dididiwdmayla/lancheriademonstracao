import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = new URL(req.url);
    const dataId = url.searchParams.get("data.id") || body?.data?.id;
    const type = url.searchParams.get("type") || body?.type;

    if (type !== "payment" || !dataId) {
       // Return 200 so MP doesn't retry non-payment notifications continuously
       return NextResponse.json({ received: true });
    }

    const mpToken = process.env.MP_ACCESS_TOKEN;
    if (!mpToken) {
       console.error("MP_ACCESS_TOKEN missing in webhook logic.");
       return NextResponse.json({ error: "Missing config" }, { status: 500 });
    }

    // Busca o pagamento atualizado diretamente do Mercado Pago
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
      headers: {
        "Authorization": `Bearer ${mpToken}`
      }
    });

    if (!paymentResponse.ok) {
       console.error(`Failed to fetch payment ${dataId} from MP.`);
       return NextResponse.json({ error: "Fetch payment failed" }, { status: 502 });
    }

    const paymentData = await paymentResponse.json();
    console.log(`Webhook MP Received: Payment ${dataId} | Status: ${paymentData.status} | External Ref: ${paymentData.external_reference}`);

    const externalRef = paymentData.external_reference;
    if (!externalRef) {
       return NextResponse.json({ received: true }); // Ignore, not ours perhaps
    }

    const db = getAdminDb();
    const pedidoRef = db.collection("pedidos").doc(externalRef);
    const pedidoSnap = await pedidoRef.get();

    if (!pedidoSnap.exists) {
       console.error(`Pedido ${externalRef} não encontrado.`);
       return NextResponse.json({ received: true });
    }

    const pedido = pedidoSnap.data();

    // Idempotência
    if (pedido?.status === "pago") {
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

    await pedidoRef.update(updateData);
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Erro webhook MP:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
