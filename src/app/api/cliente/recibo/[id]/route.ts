export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const reservaId = params.id;

    // Buscar dados completos da reserva via Prisma
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: reservaId },
    });

    if (!agendamento) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    const [passeio, cliente] = await Promise.all([
      prisma.passeio.findUnique({ where: { id: agendamento.passeioId } }),
      agendamento.clienteId ? prisma.cliente.findUnique({ where: { id: agendamento.clienteId } }) : null
    ]);

    const dadosReserva = {
      agendamentoId: agendamento.id,
      passeioNome: passeio?.nome || "Passeio não informado",
      dataPasseio: agendamento.dataPasseio,
      numeroPessoas: agendamento.numeroPessoas,
      valorTotal: agendamento.valorTotal || 0,
      status: agendamento.status,
      observacoes: agendamento.observacoes,
      criadoEm: agendamento.createdAt,
      clienteNome: cliente?.nome || "Cliente não informado",
      clienteEmail: cliente?.email || "Email não informado",
      clienteTelefone: cliente?.telefone || "Não informado"
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
          <p><strong>Data:</strong> ${new Date(dadosReserva.dataPasseio).toLocaleDateString('pt-BR')}</p>
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
