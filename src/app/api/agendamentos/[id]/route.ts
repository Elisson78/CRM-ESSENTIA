export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import {
  getAgendamentoById,
  updateAgendamento,
  deleteAgendamento,
} from '@/lib/agendamentos-service';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, context: RouteContext) {
  const params = await context.params;
  try {
    const agendamento = await getAgendamentoById(params.id);

    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json(agendamento);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    return NextResponse.json({ error: 'Erro ao buscar agendamento' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  try {
    const body = await request.json();

    const rawNumeroPessoas = body.numeroPessoas ?? body.numero_pessoas;
    const rawPercentual = body.percentualComissao ?? body.percentual_comissao;

    const normalizeNullable = (value: unknown) => {
      if (value === undefined || value === null || value === '' || value === 'none') {
        return null;
      }
      return value as string;
    };

    const updates = {
      passeioId: body.passeioId ?? body.passeio_id,
      clienteId: normalizeNullable(body.clienteId ?? body.cliente_id),
      guiaId: normalizeNullable(body.guiaId ?? body.guia_id),
      dataPasseio: body.dataPasseio ?? body.data_passeio ?? body.data,
      numeroPessoas: rawNumeroPessoas !== undefined ? Number(rawNumeroPessoas) : undefined,
      observacoes: body.observacoes,
      percentualComissao: rawPercentual !== undefined ? Number(rawPercentual) : undefined,
      status: body.status,
    };

    const updated = await updateAgendamento(params.id, updates);

    if (!updated) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return NextResponse.json({
      error: 'Erro ao atualizar agendamento',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const params = await context.params;
  try {
    const removed = await deleteAgendamento(params.id);

    if (!removed) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover agendamento:', error);
    return NextResponse.json({ error: 'Erro ao remover agendamento' }, { status: 500 });
  }
}
