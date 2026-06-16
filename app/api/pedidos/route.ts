import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("[pedidos] 0. rota iniciada");

    if (!process.env.MP_ACCESS_TOKEN) console.error("[ENV] MP_ACCESS_TOKEN AUSENTE");
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) console.error("[ENV] FIREBASE_SERVICE_ACCOUNT_KEY AUSENTE");
    
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");
    } catch (e) {
      console.error("[ENV] FIREBASE_SERVICE_ACCOUNT_KEY não é JSON válido:", e);
    }

    console.log("[pedidos] 1. Implementação dormante sendo chamada.");

    return NextResponse.json({ error: "Implementação server-side dormante" }, { status: 501 });

  } catch (error: any) {
    console.error("=== ERRO EM [PEDIDOS] ===");
    console.error("Mensagem:", error?.message);
    console.error("Stack:", error?.stack);
    console.error("Causa/resposta:", JSON.stringify(error?.cause ?? error?.response ?? error, null, 2));
    return NextResponse.json(
      { erro: true, detalhe: error?.message ?? "erro desconhecido" },
      { status: 500 }
    );
  }
}
