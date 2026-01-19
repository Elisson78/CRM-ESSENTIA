export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
      ...session.user
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
