import { randomUUID } from 'crypto';
import { db } from './db';
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
  const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const existingUser = userRes.rows[0];

  if (existingUser) {
    // Update existing user
    await db.query(
      'UPDATE users SET nome = $1, telefone = $2, updated_at = NOW() WHERE id = $3',
      [nome, telefone ?? null, existingUser.id]
    );
    clienteId = existingUser.id;
  } else {
    // Insert new user
    // Upsert logic for users table: insert on conflict update
    const insertUserQuery = `
      INSERT INTO users (id, email, nome, user_type, telefone, created_at, updated_at)
      VALUES ($1, $2, $3, 'cliente', $4, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE 
      SET nome = EXCLUDED.nome, telefone = EXCLUDED.telefone, updated_at = NOW()
      RETURNING id
    `;
    const upsertRes = await db.query(insertUserQuery, [clienteId, email, nome, telefone ?? null]);
    // If we passed an ID, it uses it. If it existed, it updates. 
    // If it existed, the RETURNING id will match existing.
    if (upsertRes.rows[0]) clienteId = upsertRes.rows[0].id;
  }

  // Persist/Update Cliente data
  const insertClienteQuery = `
    INSERT INTO clientes (id, nome, email, telefone, status, atualizado_em)
    VALUES ($1, $2, $3, $4, 'ativo', NOW())
    ON CONFLICT (email) DO UPDATE 
    SET nome = EXCLUDED.nome, telefone = EXCLUDED.telefone, status = 'ativo', atualizado_em = NOW()
    RETURNING * 
  `;
  // Note: cliente table might rely on 'id' being consistent with user 'id' or not.
  // In the original code, it passed 'clienteId' to create.
  // We use the same 'clienteId' resolved from user logic.

  console.log('📝 Persisting Cliente:', { clienteId, nome, email });
  await db.query(insertClienteQuery, [clienteId, nome, email, telefone ?? null]);

  if (oldClienteId && oldClienteId !== clienteId) {
    await db.query('UPDATE agendamentos SET cliente_id = $1 WHERE cliente_id = $2', [clienteId, oldClienteId]);
  }

  const finalClienteRes = await db.query('SELECT * FROM clientes WHERE email = $1', [email]);
  return finalClienteRes.rows[0];
}

export async function ensureClienteExiste({ nome, email, telefone }: EnsureClienteInput): Promise<EnsureClienteResult> {
  const existingClienteRes = await db.query('SELECT * FROM clientes WHERE email = $1', [email]);
  const existingCliente = existingClienteRes.rows[0];

  const existingUserRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const existingUser = existingUserRes.rows[0];

  let clienteId: string = existingCliente?.id ?? existingUser?.id ?? randomUUID();
  let senhaGerada: string | null = null;
  let novoCliente = false;

  if (existingUser) {
    clienteId = existingUser.id;
  } else {
    novoCliente = true;
    senhaGerada = Math.random().toString(36).slice(-10);
    const hashedPassword = await hashPassword(senhaGerada);

    await db.query(
      `INSERT INTO users (id, email, nome, password_hash, user_type, telefone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'cliente', $5, NOW(), NOW())`,
      [clienteId, email, nome, hashedPassword, telefone ?? null]
    );
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
