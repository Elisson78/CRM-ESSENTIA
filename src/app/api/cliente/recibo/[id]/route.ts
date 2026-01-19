export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const reservaId = params.id;

    // Buscar dados completos da reserva via SQL Join
    const query = `
        SELECT 
            a.id, 
            a.data_passeio, 
            a.numero_pessoas, 
            a.valor_total, 
            a.status, 
            a.observacoes, 
            a.criado_em,
            p.nome as passeio_nome,
            c.nome as cliente_nome,
            c.email as cliente_email,
            c.telefone as cliente_telefone
        FROM agendamentos a
        LEFT JOIN passeios p ON a.passeio_id = p.id
        LEFT JOIN clientes c ON a.cliente_id = c.id
        WHERE a.id = $1
    `;

    const result = await db.query(query, [reservaId]);
    const agendamento = result.rows[0];

    if (!agendamento) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    const dadosReserva = {
      agendamentoId: agendamento.id,
      passeioNome: agendamento.passeio_nome || "Passeio não informado",
      dataPasseio: agendamento.data_passeio,
      numeroPessoas: agendamento.numero_pessoas,
      valorTotal: parseFloat(agendamento.valor_total) || 0,
      status: agendamento.status,
      observacoes: agendamento.observacoes,
      criadoEm: agendamento.criado_em,
      clienteNome: agendamento.cliente_nome || "Cliente não informado",
      clienteEmail: agendamento.cliente_email || "Email não informado",
      clienteTelefone: agendamento.cliente_telefone || "Não informado"
    };

    // Gerar HTML do recibo
    const reciboHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Recibo - ${dadosReserva.passeioNome}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { color: #f97316; font-size: 28px; font-weight: bold; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; }
        .info-title { font-weight: bold; color: #374151; margin-bottom: 10px; }
        .total { text-align: center; background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 30px; }
        .total-value { font-size: 24px; font-weight: bold; color: #f97316; }
        .footer { text-align: center; margin-top: 40px; color: #6b7280; font-size: 14px; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">ESSENTIA TOURS</div>
        <p>Recibo de Reserva #${dadosReserva.agendamentoId.substring(0, 8)}</p>
      </div>

      <div class="info-grid">
        <div class="info-card">
          <div class="info-title">Informações do Passeio</div>
          <p><strong>Passeio:</strong> ${dadosReserva.passeioNome}</p>
          <p><strong>Data:</strong> ${dadosReserva.dataPasseio ? new Date(dadosReserva.dataPasseio).toLocaleDateString('pt-BR') : 'Data não informada'}</p>
          <p><strong>Pessoas:</strong> ${dadosReserva.numeroPessoas}</p>
          <p><strong>Status:</strong> ${dadosReserva.status}</p>
        </div>

        <div class="info-card">
          <div class="info-title">Dados do Cliente</div>
          <p><strong>Nome:</strong> ${dadosReserva.clienteNome}</p>
          <p><strong>Email:</strong> ${dadosReserva.clienteEmail}</p>
          <p><strong>Telefone:</strong> ${dadosReserva.clienteTelefone}</p>
          <p><strong>Data da Reserva:</strong> ${dadosReserva.criadoEm ? new Date(dadosReserva.criadoEm).toLocaleDateString('pt-BR') : 'Não informado'}</p>
        </div>
      </div>

      ${dadosReserva.observacoes ? `
      <div class="info-card">
        <div class="info-title">Observações</div>
        <p>${dadosReserva.observacoes}</p>
      </div>
      ` : ''}

      <div class="total">
        <p>Valor Total da Reserva</p>
        <div class="total-value">R$ ${dadosReserva.valorTotal.toFixed(2)}</div>
      </div>

      <div class="footer">
        <p>Este é um recibo oficial da Essentia Tours</p>
        <p>Em caso de dúvidas, entre em contato conosco</p>
        <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
      </div>
    </body>
    </html>
    `;

    return new Response(reciboHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="recibo-${reservaId}.html"`
      }
    });

  } catch (error) {
    console.error('Erro ao gerar recibo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
