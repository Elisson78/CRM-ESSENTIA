export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { ensureClienteExiste } from '@/lib/customer-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, telefone } = body ?? {};

    if (!nome || !email) {
      return NextResponse.json({ error: 'Nome e e-mail são obrigatórios' }, { status: 400 });
    }

    const resultado = await ensureClienteExiste({
      nome,
      email,
      telefone: telefone ?? null,
    });

    return NextResponse.json({ success: true, ...resultado });
  } catch (error) {
    console.error('❌ Erro no pré-cadastro de cliente:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
