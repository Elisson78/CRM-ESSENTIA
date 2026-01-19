export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { ensureClienteExiste } from '@/lib/customer-service';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.passeioId || !data.passeioNome || !data.data || !data.pessoas ||
      !data.valorTotal || !data.clienteNome || !data.clienteEmail || !data.metodoPagamento) {
      return NextResponse.json({ error: 'Dados obrigatórios em falta' }, { status: 400 });
    }

    // Usar clienteId do precheck se disponível para evitar duplicação
    let clienteId: string;
    let novoCliente: boolean;
    let senhaGerada: string | null;
    let clienteRegistro: any;

    if (data.preCadastroClienteId) {
      clienteId = data.preCadastroClienteId;
      novoCliente = false;
      senhaGerada = null;
      clienteRegistro = null;
      console.log('✅ Usando clienteId do precheck:', clienteId);
    } else {
      const resultado = await ensureClienteExiste({
        nome: data.clienteNome,
        email: data.clienteEmail,
        telefone: data.clienteTelefone ?? null,
      });
      clienteId = resultado.clienteId;
      novoCliente = resultado.novoCliente;
      senhaGerada = resultado.senhaGerada;
      clienteRegistro = resultado.cliente;
    }

    const passeio = await prisma.passeio.findUnique({
      where: { id: data.passeioId }
    });

    if (!passeio) {
      return NextResponse.json({ error: 'Passeio não encontrado' }, { status: 404 });
    }

    const agendamentoId = randomUUID();
    const percentualComissao = 30;
    const valorComissao = data.valorTotal * (percentualComissao / 100);

    const agendamento = await prisma.agendamento.create({
      data: {
        id: agendamentoId,
        passeioId: data.passeioId,
        clienteId,
        dataPasseio: new Date(data.data).toISOString().split('T')[0],
        numeroPessoas: data.pessoas,
        valorTotal: data.valorTotal,
        valorComissao,
        percentualComissao,
        status: 'confirmada',
        observacoes: data.clienteObservacoes || null,
      }
    });

    return NextResponse.json({
      success: true,
      clienteId,
      agendamentoId,
      agendamento: agendamento,
      senhaGerada,
      novoCliente,
      cliente: clienteRegistro,
    });

  } catch (error) {
    console.error('❌ Erro ao processar reserva completa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return agendamentos with status 'confirmada' as a fallback since 'reservas' table is missing
    const confirmados = await prisma.agendamento.findMany({
      where: { status: 'confirmada' }
    });
    return NextResponse.json(confirmados);
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
