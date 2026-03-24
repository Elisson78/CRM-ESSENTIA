import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request, context: any) {
  // Check if context has params directly
  const params = await context.params;
  const id = params?.id;

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID is missing' }, { status: 400 });
  }

  try {
    const faturaResult = await db.query(`
      SELECT f.*, 
        COALESCE(c.nome, u.nome) as cliente_nome, 
        COALESCE(c.email, u.email) as cliente_email, 
        COALESCE(c.telefone, u.telefone) as cliente_telefone, 
        c.endereco as cliente_endereco
      FROM faturas f
      LEFT JOIN clientes c ON f.cliente_id = c.id
      LEFT JOIN users u ON f.cliente_id = u.id
      WHERE f.id = $1
    `, [id]);

    if (faturaResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Fatura não encontrada' }, { status: 404 });
    }

    const fatura = faturaResult.rows[0];

    const itensResult = await db.query(`
      SELECT * FROM fatura_itens WHERE fatura_id = $1
    `, [id]);

    fatura.itens = itensResult.rows;

    return NextResponse.json({ success: true, fatura });
  } catch (error: any) {
    console.error('Error fetching fatura details:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  
  if (!id) {
    return NextResponse.json({ success: false, error: 'ID is missing' }, { status: 400 });
  }

  try {
    await db.query('DELETE FROM faturas WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting fatura:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
