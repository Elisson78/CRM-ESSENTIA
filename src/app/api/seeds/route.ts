export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { POST as seedUsers } from "./users/route";
import { POST as seedPasseios } from "./passeios/route";
import { POST as seedClientes } from "./clientes/route";
import { POST as seedGuias } from "./guias/route";
import { POST as seedAgendamentos } from "./agendamentos/route";

export async function POST() {
  try {
    console.warn("⚠️ API /api/seeds desativada. Utilize 'cd apps/server && npm run db:seed'.");
    return NextResponse.json({
      error: "Seed via API desativada",
      message: "Execute 'npm run db:seed' em apps/server para popular o banco."
    }, { status: 410 });
  } catch (error) {
    console.error("Erro ao executar seed completo:", error);
    return NextResponse.json({ error: "Erro ao executar seed completo" }, { status: 500 });
  }
}
