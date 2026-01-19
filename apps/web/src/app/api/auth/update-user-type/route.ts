import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar userType
    const updateRes = await db.query(
      'UPDATE users SET user_type = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [userType, user.id]
    );
    const updatedUser = updateRes.rows[0];

    console.log('✅ Usuário atualizado:', {
      email: updatedUser.email,
      userType: updatedUser.user_type
    });

    return NextResponse.json({
      success: true,
      message: 'Tipo de usuário atualizado com sucesso',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        userType: updatedUser.user_type
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
