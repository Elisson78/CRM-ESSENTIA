export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
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

    const passeioRes = await db.query('SELECT * FROM passeios WHERE id = $1', [data.passeioId]);
    const passeio = passeioRes.rows[0];

    if (!passeio) {
      return NextResponse.json({ error: 'Passeio não encontrado' }, { status: 404 });
    }

    // Aplicar desconto PIX de 5%
    const valorFinal = data.valorTotal * 0.95;

    const agendamentoId = randomUUID();
    const percentualComissao = 30;
    const valorComissao = valorFinal * (percentualComissao / 100);

    const insertQuery = `
      INSERT INTO agendamentos (
        id, passeio_id, cliente_id, data_passeio, numero_pessoas, 
        valor_total, valor_comissao, percentual_comissao, status, observacoes, criado_em, atualizado_em
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmadas', $9, NOW(), NOW())
      RETURNING *
    `;

    const insertRes = await db.query(insertQuery, [
      agendamentoId,
      data.passeioId,
      clienteId,
      new Date(data.data).toISOString().split('T')[0],
      data.pessoas,
      valorFinal,
      valorComissao,
      percentualComissao,
      data.clienteObservacoes || null
    ]);

    const agendamento = insertRes.rows[0];

    console.log('✅ Pagamento PIX processado com sucesso:', {
      clienteId,
      agendamentoId,
      valorFinal
    });

    // Map back to camelCase for consistency
    const agendamentoCamels = {
      id: agendamento.id,
      passeioId: agendamento.passeio_id,
      clienteId: agendamento.cliente_id,
      dataPasseio: agendamento.data_passeio,
      numeroPessoas: agendamento.numero_pessoas,
      valorTotal: parseFloat(agendamento.valor_total),
      valorComissao: parseFloat(agendamento.valor_comissao),
      percentualComissao: agendamento.percentual_comissao,
      status: agendamento.status,
      observacoes: agendamento.observacoes
    };

    return NextResponse.json({
      success: true,
      clienteId,
      agendamentoId,
      reservaId: `reserva_${Date.now()}`,
      agendamento: agendamentoCamels,
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