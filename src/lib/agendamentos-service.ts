'use server';

import { randomUUID } from 'node:crypto';
import { prisma } from './prisma';

const VALID_STATUSES = new Set([
  'em_progresso',
  'pendente_cliente',
  'confirmadas',
  'concluidas',
  'canceladas',
]);

export async function listAgendamentos() {
  const agendamentosList = await prisma.agendamento.findMany();

  const result = await Promise.all(agendamentosList.map(async (agendamento) => {
    const [passeio, cliente, guia] = await Promise.all([
      prisma.passeio.findUnique({ where: { id: agendamento.passeioId } }),
      agendamento.clienteId ? prisma.cliente.findUnique({ where: { id: agendamento.clienteId } }) : null,
      agendamento.guiaId ? prisma.guia.findUnique({ where: { id: agendamento.guiaId } }) : null,
    ]);

    return {
      id: agendamento.id,
      passeio_id: agendamento.passeioId,
      cliente_id: agendamento.clienteId,
      guia_id: agendamento.guiaId,
      data_passeio: agendamento.dataPasseio,
      numero_pessoas: agendamento.numeroPessoas ?? 1,
      valor_total: Number(agendamento.valorTotal ?? 0),
      valor_comissao: Number(agendamento.valorComissao ?? 0),
      percentual_comissao: agendamento.percentualComissao ?? 30,
      status: agendamento.status,
      observacoes: agendamento.observacoes,
      passeio_nome: passeio?.nome ?? null,
      cliente_nome: cliente?.nome ?? null,
      guia_nome: guia?.nome ?? null,
      criado_em: agendamento.createdAt ?? null,
      atualizado_em: agendamento.updatedAt ?? null,
    };
  }));

  return result;
}

export async function getAgendamentoById(id: string) {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id },
  });

  if (!agendamento) return null;

  const [passeio, cliente, guia] = await Promise.all([
    prisma.passeio.findUnique({ where: { id: agendamento.passeioId } }),
    agendamento.clienteId ? prisma.cliente.findUnique({ where: { id: agendamento.clienteId } }) : null,
    agendamento.guiaId ? prisma.guia.findUnique({ where: { id: agendamento.guiaId } }) : null,
  ]);

  return {
    id: agendamento.id,
    passeio_id: agendamento.passeioId,
    cliente_id: agendamento.clienteId,
    guia_id: agendamento.guiaId,
    data_passeio: agendamento.dataPasseio,
    numero_pessoas: agendamento.numeroPessoas ?? 1,
    valor_total: Number(agendamento.valorTotal ?? 0),
    valor_comissao: Number(agendamento.valorComissao ?? 0),
    percentual_comissao: agendamento.percentualComissao ?? 30,
    status: agendamento.status,
    observacoes: agendamento.observacoes,
    passeio_nome: passeio?.nome ?? null,
    cliente_nome: cliente?.nome || "Cliente não informado",
    guia_nome: guia?.nome || "Guia não informado",
    criado_em: agendamento.createdAt ?? null,
    atualizado_em: agendamento.updatedAt ?? null,
  };
}

export interface CreateAgendamentoInput {
  passeioId: string;
  clienteId?: string | null;
  guiaId?: string | null;
  dataPasseio: string;
  numeroPessoas: number;
  observacoes?: string | null;
  percentualComissao?: number;
}

export async function createAgendamento(input: CreateAgendamentoInput) {
  const passeio = await prisma.passeio.findUnique({
    where: { id: input.passeioId },
  });

  if (!passeio) {
    throw new Error('Passeio informado não foi encontrado.');
  }

  const numeroPessoas = Math.max(1, input.numeroPessoas || 1);
  const percentualComissao = input.percentualComissao ?? 30;
  const valorTotal = Number(passeio.preco) * numeroPessoas;
  const valorComissao = valorTotal * (percentualComissao / 100);

  const id = randomUUID();

  await prisma.agendamento.create({
    data: {
      id,
      passeioId: input.passeioId,
      clienteId: input.clienteId ?? null,
      guiaId: input.guiaId ?? null,
      dataPasseio: input.dataPasseio,
      numeroPessoas,
      observacoes: input.observacoes ?? null,
      percentualComissao,
      valorTotal,
      valorComissao,
    },
  });

  return getAgendamentoById(id);
}

export interface UpdateAgendamentoInput {
  passeioId?: string;
  clienteId?: string | null;
  guiaId?: string | null;
  dataPasseio?: string;
  numeroPessoas?: number;
  observacoes?: string | null;
  percentualComissao?: number;
  status?: string;
}

export async function updateAgendamento(id: string, input: UpdateAgendamentoInput) {
  const atual = await prisma.agendamento.findUnique({
    where: { id },
  });

  if (!atual) return null;

  if (input.status && !VALID_STATUSES.has(input.status)) {
    throw new Error('Status inválido para agendamento.');
  }

  const data: any = {};

  if (input.passeioId !== undefined) data.passeioId = input.passeioId;
  if (input.clienteId !== undefined) data.clienteId = input.clienteId ?? null;
  if (input.guiaId !== undefined) data.guiaId = input.guiaId ?? null;
  if (input.dataPasseio !== undefined) data.dataPasseio = input.dataPasseio;
  if (input.observacoes !== undefined) data.observacoes = input.observacoes ?? null;
  if (input.status !== undefined) data.status = input.status;

  const deveRecalcularValores =
    input.passeioId !== undefined ||
    input.numeroPessoas !== undefined ||
    input.percentualComissao !== undefined;

  const numeroPessoas = Math.max(1, input.numeroPessoas ?? atual.numeroPessoas ?? 1);
  const percentualComissao = input.percentualComissao ?? atual.percentualComissao ?? 30;

  if (deveRecalcularValores) {
    const passeioIdParaUsar = input.passeioId ?? atual.passeioId;
    const passeioAtual = await prisma.passeio.findUnique({
      where: { id: passeioIdParaUsar },
    });

    if (!passeioAtual) {
      throw new Error('Passeio informado não foi encontrado.');
    }

    const valorTotal = Number(passeioAtual.preco) * numeroPessoas;
    data.valorTotal = valorTotal;
    data.valorComissao = valorTotal * (percentualComissao / 100);
    data.percentualComissao = percentualComissao;
    data.numeroPessoas = numeroPessoas;
  } else if (input.numeroPessoas !== undefined) {
    data.numeroPessoas = numeroPessoas;
  }

  data.updatedAt = new Date();

  await prisma.agendamento.update({
    where: { id },
    data,
  });

  return getAgendamentoById(id);
}

export async function updateAgendamentoStatus(id: string, status: string) {
  return updateAgendamento(id, { status });
}

export async function deleteAgendamento(id: string) {
  try {
    await prisma.agendamento.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    return false;
  }
}
