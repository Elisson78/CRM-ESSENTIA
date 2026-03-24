import { NextResponse } from 'next/server';
import pool, { db } from '@/lib/db';

export async function GET() {
  try {
    const result = await db.query(`
      SELECT f.*, 
        COALESCE(c.nome, u.nome) as cliente_nome, 
        COALESCE(c.email, u.email) as cliente_email 
      FROM faturas f
      LEFT JOIN clientes c ON f.cliente_id = c.id
      LEFT JOIN users u ON f.cliente_id = u.id
      ORDER BY f.criado_em DESC
    `);
    
    return NextResponse.json({ success: true, faturas: result.rows });
  } catch (error: any) {
    console.error('Error fetching faturas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const client = await pool.connect();
  
  try {
    const body = await request.json();
    const { 
      cliente_id, fatura_numero, data_emissao, data_vencimento, 
      cotacao_cambio_turismo, status, itens 
    } = body;

    // Calcular totais
    const totalEur = itens.reduce((acc: number, item: any) => acc + Number(item.valor_eur || 0), 0);
    const totalBrl = totalEur * Number(cotacao_cambio_turismo || 1);

    await client.query('BEGIN');

    const faturaResult = await client.query(`
      INSERT INTO faturas (
        cliente_id, fatura_numero, data_emissao, data_vencimento, 
        cotacao_cambio_turismo, total_eur, total_brl, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      cliente_id || null, fatura_numero, data_emissao, data_vencimento, 
      cotacao_cambio_turismo, totalEur, totalBrl, status || 'Pendente'
    ]);

    const faturaId = faturaResult.rows[0].id;

    if (itens && itens.length > 0) {
      for (const item of itens) {
        await client.query(`
          INSERT INTO fatura_itens (fatura_id, servico_descricao, fornecedor, valor_eur)
          VALUES ($1, $2, $3, $4)
        `, [
          faturaId, item.servico_descricao, item.fornecedor, item.valor_eur
        ]);
      }
    }

    await client.query('COMMIT');
    
    return NextResponse.json({ success: true, fatura_id: faturaId });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating fatura:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
