import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('clienteId');

    console.log('🔍 Buscando reservas para clienteId via SQL:', clienteId);

    if (!clienteId) {
      return NextResponse.json({ error: 'Cliente ID obrigatório' }, { status: 400 });
    }

    // Buscar agendamentos do cliente com join
    const query = `
      SELECT 
        a.id, 
        a.data_passeio, 
        a.numero_pessoas, 
        a.valor_total, 
        a.status, 
        a.criado_em, 
        a.passeio_id,
        p.nome as passeio_nome
      FROM agendamentos a
      LEFT JOIN passeios p ON a.passeio_id = p.id
      WHERE a.cliente_id = $1
      ORDER BY a.criado_em DESC
    `;

    const result = await db.query(query, [clienteId]);
    const agendamentosList = result.rows;

    console.log(`✅ Encontrados ${agendamentosList.length} agendamentos para o cliente`);

    const reservasFormatadas = agendamentosList.map(agendamento => ({
      id: agendamento.id,
      passeioNome: agendamento.passeio_nome || 'Passeio não encontrado',
      data: agendamento.data_passeio,
      pessoas: agendamento.numero_pessoas,
      valorTotal: parseFloat(agendamento.valor_total) || 0,
      status: agendamento.status,
      metodoPagamento: 'Não informado',
      criadoEm: agendamento.criado_em,
      passeioId: agendamento.passeio_id
    }));

    return NextResponse.json(reservasFormatadas);

  } catch (error) {
    console.error('Erro ao buscar reservas do cliente:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}