export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

// Rota de seed movida para apps/server/src/db/seed.ts
// Use: npm run db:seed no diretório apps/server

export async function POST() {
  return NextResponse.json({
    error: "Use o comando 'npm run db:seed' no diretório apps/server para fazer seed do banco de dados"
  }, { status: 400 });
}
