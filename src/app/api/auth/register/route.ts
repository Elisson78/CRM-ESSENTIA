export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha, tipo } = await request.json();

    if (!nome || !email || !senha || !tipo) {
      return NextResponse.json(
        { error: "Nome, email, senha e tipo são obrigatórios" },
        { status: 400 },
      );
    }

    if (!["admin", "guia", "cliente"].includes(tipo)) {
      return NextResponse.json({ error: "Tipo de usuário inválido" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(senha);

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        nome,
        userType: tipo as any,
      },
    });

    // Determine default redirect based on user type
    let redirectUrl = "/";
    if (tipo === 'admin') redirectUrl = "/admin";
    else if (tipo === 'guia') redirectUrl = "/guia";
    else redirectUrl = "/dashboard"; // Default for client

    return NextResponse.json({
      success: true,
      message: "Usuário criado com sucesso",
      userId: newUser.id,
      redirectUrl
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
