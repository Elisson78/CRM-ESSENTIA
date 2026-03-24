export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const result = await db.query('SELECT * FROM empresa_configuracoes WHERE id = 1');
    return NextResponse.json({ success: true, configuracoes: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      razao_social, slogan, email, telefone, p_iva, c_f, 
      banco_nome, banco_agencia, banco_conta, banco_pix, banco_beneficiario, endereco_completo 
    } = body;
    
    await db.query(`
      UPDATE empresa_configuracoes SET 
        razao_social = $1, slogan = $2, email = $3, telefone = $4, p_iva = $5, c_f = $6,
        banco_nome = $7, banco_agencia = $8, banco_conta = $9, banco_pix = $10, banco_beneficiario = $11,
        endereco_completo = $12, atualizado_em = CURRENT_TIMESTAMP
      WHERE id = 1
    `, [
      razao_social, slogan, email, telefone, p_iva, c_f,
      banco_nome, banco_agencia, banco_conta, banco_pix, banco_beneficiario, endereco_completo
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
