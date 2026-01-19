import { randomUUID } from 'crypto';
import { prisma } from './prisma';
import { hashPassword } from './auth';

interface EnsureClienteInput {
  nome: string;
  email: string;
  telefone?: string | null;
}

export interface EnsureClienteResult {
  clienteId: string;
  novoCliente: boolean;
  senhaGerada: string | null;
  cliente: any;
}

async function persistClienteDados(
  clienteId: string,
  {
    nome,
    email,
    telefone,
    oldClienteId,
  }: { nome: string; email: string; telefone?: string | null; oldClienteId?: string | null },
) {
  const now = new Date();

  // Try to find if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    // Update existing user
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        nome,
        telefone: telefone ?? null,
        updatedAt: now,
      },
    });
    clienteId = existingUser.id;
  } else {
    // Upsert user if needed
    await prisma.user.upsert({
      where: { email },
      update: {
        nome,
        userType: 'cliente',
        telefone: telefone ?? null,
        updatedAt: now,
      },
      create: {
        id: clienteId,
        email,
        nome,
        userType: 'cliente',
        telefone: telefone ?? null,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  // Persist/Update Cliente data
  const clienteRegistro = await prisma.cliente.upsert({
    where: { email },
    update: {
      nome,
      telefone: telefone ?? null,
      status: 'ativo',
      atualizadoEm: now,
    },
    create: {
      id: clienteId,
      nome,
      email,
      telefone: telefone ?? null,
      status: 'ativo',
      atualizadoEm: now,
    },
  });

  if (oldClienteId && oldClienteId !== clienteId) {
    await prisma.agendamento.updateMany({
      where: { clienteId: oldClienteId },
      data: { clienteId: clienteId },
    });
  }

  return clienteRegistro;
}

export async function ensureClienteExiste({ nome, email, telefone }: EnsureClienteInput): Promise<EnsureClienteResult> {
  const existingCliente = await prisma.cliente.findUnique({
    where: { email },
  });

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  let clienteId: string = existingCliente?.id ?? existingUser?.id ?? randomUUID();
  let senhaGerada: string | null = null;
  let novoCliente = false;

  if (existingUser) {
    clienteId = existingUser.id;
  } else {
    novoCliente = true;
    senhaGerada = Math.random().toString(36).slice(-10);
    const hashedPassword = await hashPassword(senhaGerada);

    await prisma.user.create({
      data: {
        id: clienteId,
        email,
        nome,
        passwordHash: hashedPassword,
        userType: 'cliente',
        telefone: telefone ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  const clienteRegistro = await persistClienteDados(clienteId, {
    nome,
    email,
    telefone,
    oldClienteId: existingCliente?.id ?? null,
  });

  return {
    clienteId,
    novoCliente,
    senhaGerada,
    cliente: clienteRegistro,
  };
}
