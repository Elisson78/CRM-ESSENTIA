export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { POST as seedUsers } from "./users/route";
import { POST as seedPasseios } from "./passeios/route";

export async function POST() {
  try {
    console.log("🚀 Starting COORDINATED SEED...");

    // Call user seed
    const userRes = await seedUsers();
    if (userRes.status !== 200) throw new Error("Falha ao semear usuários");

    // Call tours seed
    const tourRes = await seedPasseios();
    if (tourRes.status !== 200) throw new Error("Falha ao semear passeios");

    return NextResponse.json({
      success: true,
      message: "Banco de dados populado com sucesso (Usuários e Passeios)"
    });
  } catch (error) {
    console.error("Erro ao executar seed completo:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
