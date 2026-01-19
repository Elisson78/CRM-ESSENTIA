export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';

// Nota: Clientes não têm sistema de senha próprio
// A autenticação de clientes é feita via senha temporária gerada pelo sistema
// Esta rota está desabilitada por enquanto

export async function POST(request: Request) {
  try {
    return NextResponse.json({
      error: 'Funcionalidade de alteração de senha para clientes ainda não implementada',
      message: 'Clientes usam senhas temporárias geradas pelo sistema'
    }, { status: 501 });

  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}