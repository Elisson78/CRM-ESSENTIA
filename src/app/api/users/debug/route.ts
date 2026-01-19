export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// API temporária de debug para listar usuários sem verificação de auth
export async function GET() {
  try {
    console.log("🐛 DEBUG: Tentando buscar usuários...");

    const data = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Encontrados ${data.length} usuários`);

    // Formatear os dados
    const formattedUsers = data.map((user) => {
      const [firstName, ...lastNameParts] = (user.nome || "").split(" ");
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName || firstName || "",
        lastName: user.lastName || lastNameParts.join(" ") || "",
        userType: user.userType,
        telefone: user.telefone,
        endereco: user.endereco,
        cpf: user.cpf,
        status: "ativo",
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers,
      debug: {
        rawCount: data.length,
        dbType: "Prisma (PostgreSQL via TCP)"
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