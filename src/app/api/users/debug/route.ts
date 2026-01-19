export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// API temporária de debug para listar usuários sem verificação de auth
export async function GET() {
  try {
    console.log("🐛 DEBUG: Tentando buscar usuários via SQL...");

    const result = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    const allUsers = result.rows;

    console.log(`✅ Encontrados ${allUsers.length} usuários`);

    // Formatar os dados
    const formattedUsers = allUsers.map((user) => {
      const [firstName, ...lastNameParts] = (user.nome || "").split(" ");
      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name || firstName || "",
        lastName: user.last_name || lastNameParts.join(" ") || "",
        userType: user.user_type,
        telefone: user.telefone,
        endereco: user.endereco,
        cpf: user.cpf,
        status: "ativo",
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers,
      debug: {
        rawCount: allUsers.length,
        orm: "pg-direct"
      }
    });

  } catch (error) {
    console.error("💥 Erro geral:", error);
    return NextResponse.json({
      error: "Erro interno",
      message: error instanceof Error ? error.message : "Erro desconhecido",
      debug: {
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
}