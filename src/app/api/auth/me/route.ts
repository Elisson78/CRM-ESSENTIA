export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ user: null });
  }

  try {
    // Fetch fresh user data from DB
    const user = await prisma.user.findUnique({
      where: { id: session.id as string },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Return safe user data
    const safeUser = {
      id: user.id,
      email: user.email,
      nome: user.nome,
      userType: user.userType,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImageUrl,
      telefone: user.telefone,
      endereco: user.endereco,
      cpf: user.cpf,
      data_nascimento: user.dataNascimento,
    };

    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error("Me route error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
