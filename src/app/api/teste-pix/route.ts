export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { ensureClienteExiste } from '@/lib/customer-service';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    console.log('🔍 Dados recebidos para pagamento PIX:', data);

    if (!data.passeioId || !data.passeioNome || !data.data || !data.pessoas ||
      !data.valorTotal || !data.clienteNome || !data.clienteEmail || !data.metodoPagamento) {
      return NextResponse.json({ error: 'Dados obrigatórios em falta' }, { status: 400 });
    }

    // Usar clienteId do precheck se disponível
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

    // Aplicar desconto PIX de 5%
    const valorFinal = data.valorTotal * 0.95;

    const agendamentoId = randomUUID();
    const percentualComissao = 30;
    const valorComissao = valorFinal * (percentualComissao / 100);

    const agendamento = await prisma.agendamento.create({
      data: {
        id: agendamentoId,
        passeioId: data.passeioId,
        clienteId,
        dataPasseio: new Date(data.data).toISOString().split('T')[0],
        numeroPessoas: data.pessoas,
        valorTotal: valorFinal,
        valorComissao,
        percentualComissao,
        status: 'confirmadas',
        observacoes: data.clienteObservacoes || null,
      }
    });

    // Note: 'reservas' table doesn't exist in Prisma schema, using confirmada agendamento as proxy

    console.log('✅ Pagamento PIX processado com sucesso:', {
      clienteId,
      agendamentoId,
      valorFinal
    });

    return NextResponse.json({
      success: true,
      clienteId,
      agendamentoId,
      reservaId: `reserva_${Date.now()}`,
      agendamento,
      senhaGerada,
      novoCliente,
      cliente: clienteRegistro,
      metodoPagamento: 'pix',
      valorFinal
    });

  } catch (error) {
    console.error('❌ Erro no pagamento PIX:', error);
    return NextResponse.json({ error: 'Erro ao processar pagamento PIX' }, { status: 500 });
  }
}