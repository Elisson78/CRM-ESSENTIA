export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('clienteId');

    console.log('🔍 Buscando reservas para clienteId:', clienteId);

    if (!clienteId) {
      return NextResponse.json({ error: 'Cliente ID obrigatório' }, { status: 400 });
    }

    // Buscar agendamentos do cliente
    const agendamentosList = await prisma.agendamento.findMany({
      where: { clienteId: String(clienteId) },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Encontradas ${agendamentosList.length} reservas para o cliente`);

    // Formatar dados para o frontend, buscando o nome do passeio manualmente
    const reservasFormatadas = await Promise.all(agendamentosList.map(async (agendamento) => {
      const passeio = await prisma.passeio.findUnique({
        where: { id: agendamento.passeioId },
        select: { nome: true }
      });

      return {
        id: agendamento.id,
        passeioNome: passeio?.nome || 'Passeio não encontrado',
        data: agendamento.dataPasseio,
        pessoas: agendamento.numeroPessoas,
        valorTotal: agendamento.valorTotal,
        status: agendamento.status,
        metodoPagamento: 'Não informado',
        criadoEm: agendamento.createdAt
      };
    }));

    return NextResponse.json(reservasFormatadas);

  } catch (error) {
    console.error('Erro ao buscar reservas do cliente:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}