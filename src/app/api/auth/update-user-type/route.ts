export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Endpoint administrativo para atualizar o userType de um usuário
export async function POST(request: NextRequest) {
  try {
    const { email, userType } = await request.json();

    if (!email || !userType) {
      return NextResponse.json(
        { error: 'Email e userType são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['admin', 'guia', 'cliente'].includes(userType)) {
      return NextResponse.json(
        { error: 'userType inválido. Use: admin, guia ou cliente' },
        { status: 400 }
      );
    }

    // Buscar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar userType
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        userType: userType as any,
        updatedAt: new Date()
      }
    });

    console.log('✅ Usuário atualizado:', {
      email: updatedUser.email,
      userType: updatedUser.userType
    });

    return NextResponse.json({
      success: true,
      message: 'Tipo de usuário atualizado com sucesso',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        userType: updatedUser.userType
      }
    });

  } catch (error) {
    console.error('Erro no update:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
