export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Iniciando busca de usuários...");

    const allUsers = await prisma.user.findMany();

    console.log("✅ Usuários encontrados:", allUsers.length);

    const formattedUsers = allUsers.map((user) => {
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

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("💥 Erro geral ao buscar usuários:", error);
    return NextResponse.json({
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Iniciando criação de usuário...");

    const body = await request.json();
    const { firstName, lastName, email, userType, password } = body;

    if (!firstName || !lastName || !email || !userType || !password) {
      return NextResponse.json(
        { error: "Nome, sobrenome, email, tipo de usuário e senha são obrigatórios" },
        { status: 400 },
      );
    }

    if (!["admin", "guia", "cliente"].includes(userType)) {
      return NextResponse.json({ error: "Tipo de usuário inválido" }, { status: 400 });
    }

    console.log("🔍 Iniciando criação completa do usuário em DB...");

    const hashedPassword = await hashPassword(password);
    const nome = `${firstName} ${lastName}`;

    const newUser = await prisma.user.create({
      data: {
        email,
        nome,
        passwordHash: hashedPassword,
        userType: userType as any,
        firstName,
        lastName,
      },
    });

    console.log("✅ Usuário criado com sucesso:", newUser.id);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName,
        lastName,
        userType,
        nome: newUser.nome,
      },
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("✏️ Iniciando atualização de usuário...");

    const { id, firstName, lastName, email, userType, password } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 });
    }

    console.log("🔄 Atualizando usuário...");

    const data: any = {};

    if (email) data.email = email;
    if (userType) data.userType = userType;
    if (firstName || lastName) {
      data.firstName = firstName;
      data.lastName = lastName;
      data.nome = `${firstName ?? ""} ${lastName ?? ""}`.trim();
    }

    if (password) {
      data.passwordHash = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("🗑️ Iniciando exclusão de usuário...");

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 });
    }

    console.log("🗑️ Excluindo usuário da tabela...");

    await prisma.user.delete({
      where: { id },
    });

    console.log("✅ Usuário removido da tabela");

    return NextResponse.json({ success: true, message: "Usuário excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}