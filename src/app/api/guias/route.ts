export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔄 Buscando guias ativos do Banco de Dados via SQL...');

    const result = await db.query(`
        SELECT id, nome, email, telefone, especialidades, idiomas, status, avaliacao_media 
        FROM guias 
        WHERE status = 'ativo' 
        ORDER BY nome ASC
    `);

    const guiasAtivosRaw = result.rows;

    const guiasAtivos = guiasAtivosRaw.map(guia => ({
      id: guia.id,
      nome: guia.nome,
      email: guia.email,
      telefone: guia.telefone,
      // Handle potential JSON columns or strings if array
      especialidades: guia.especialidades,
      idiomas: guia.idiomas,
      status: guia.status,
      avaliacao_media: guia.avaliacao_media
    }));

    console.log(`✅ ${guiasAtivos.length} guias ativos encontrados`);
    return NextResponse.json(guiasAtivos);
  } catch (error) {
    console.error('❌ Erro ao listar guias:', error);
    return NextResponse.json(
      { error: 'Erro ao listar guias' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      nome, 
      email, 
      telefone, 
      cpf, 
      especialidades, 
      idiomas, 
      biografia, 
      percentual_comissao 
    } = body;

    if (!nome || !email) {
      return NextResponse.json({ error: 'Nome e email são obrigatórios' }, { status: 400 });
    }

    // Gerar um ID único
    const newId = (Math.random().toString(36).substring(2, 10) + Date.now().toString(36));

    const result = await db.query(`
      INSERT INTO guias (
        id, nome, email, telefone, cpf, 
        especialidades, idiomas, biografia, 
        percentual_comissao, status, 
        avaliacao_media, total_avaliacoes, 
        passeios_realizados, comissao_total,
        criado_em, atualizado_em
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING id
    `, [
      newId, 
      nome, 
      email, 
      telefone || null, 
      cpf || null,
      JSON.stringify(especialidades || []),
      JSON.stringify(idiomas || []),
      biografia || null,
      percentual_comissao || 0,
      'ativo',
      0, 0, 0, 0
    ]);

    console.log(`✅ Guia criado com ID: ${result.rows[0].id}`);
    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    console.error('❌ Erro ao criar guia:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Erro interno ao criar guia' 
    }, { status: 500 });
  }
}

