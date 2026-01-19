export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const { nome, telefone, cpf, endereco, clienteId } = await request.json();

    if (!clienteId) {
      return NextResponse.json({ error: 'Cliente ID obrigatório' }, { status: 400 });
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (nome) { fields.push(`nome = $${paramIndex++}`); values.push(nome); }
    if (telefone) { fields.push(`telefone = $${paramIndex++}`); values.push(telefone); }
    if (cpf) { fields.push(`cpf = $${paramIndex++}`); values.push(cpf); }
    if (endereco) { fields.push(`endereco = $${paramIndex++}`); values.push(JSON.stringify({ endereco })); }

    fields.push(`atualizado_em = NOW()`);
    values.push(String(clienteId));

    const query = `UPDATE clientes SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;

    const result = await db.query(query, values);
    const updatedCliente = result.rows[0];

    return NextResponse.json({
      success: true,
      cliente: updatedCliente
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('clienteId');

    if (!clienteId) {
      return NextResponse.json({ error: 'Cliente ID obrigatório' }, { status: 400 });
    }

    const result = await db.query('SELECT * FROM clientes WHERE id = $1', [clienteId]);
    const cliente = result.rows[0];

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json(cliente);

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}