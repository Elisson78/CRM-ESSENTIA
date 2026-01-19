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
