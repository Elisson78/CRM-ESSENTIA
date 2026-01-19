export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const { nome, telefone, cpf, endereco, clienteId } = await request.json();

    if (!clienteId) {
      return NextResponse.json({ error: 'Cliente ID obrigatório' }, { status: 400 });
    }

    // Atualizar dados do cliente
    const updatedCliente = await prisma.cliente.update({
      where: { id: String(clienteId) },
      data: {
        nome: nome || undefined,
        telefone: telefone || undefined,
        cpf: cpf || undefined,
        endereco: endereco ? JSON.stringify({ endereco }) : undefined,
        atualizadoEm: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      cliente: updatedCliente
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('clienteId');

    if (!clienteId) {
      return NextResponse.json({ error: 'Cliente ID obrigatório' }, { status: 400 });
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id: String(clienteId) }
    });

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json(cliente);

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}