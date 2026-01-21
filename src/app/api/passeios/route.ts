export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';


const ensureArray = (value: unknown): string[] => {
  if (!value && value !== 0) return [];
  // Handle already parsed arrays (pg driver behavior for jsonb)
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string').map(i => i.trim()).filter(Boolean);
  }
  // Handle stringified JSON
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string').map(i => i.trim()).filter(Boolean);
      }
      return [value.trim()].filter(Boolean);
    } catch {
      return [value.trim()].filter(Boolean);
    }
  }
  return [];
};

export async function GET() {
  try {
    console.log('🔄 Buscando passeios no banco de dados via SQL...');
    const result = await db.query('SELECT * FROM passeios');
    const todosPasseios = result.rows;
    console.log(`✅ ${todosPasseios.length} passeios encontrados no banco`);

    const passeiosFormatados = todosPasseios.map((p) => {
      // Use preco_real if preco is missing (Database alignment)
      const precoFinal = p.preco_real !== undefined ? p.preco_real : (p.preco || 0);

      return {
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        preco: precoFinal,
        duracao: p.duracao,
        categoria: p.categoria,
        // Handle potential JSONB or string array columns
        imagens: ensureArray(p.imagens),
        images: ensureArray(p.imagens), // Alias for Admin compatibility
        inclusoes: ensureArray(p.inclusoes),
        idiomas: ensureArray(p.idiomas),
        capacidadeMaxima: p.capacidade_maxima, // pg returns snake_case
        tarifa2Pessoas: p.tarifa_2_pessoas,
        tarifa4Pessoas: p.tarifa_4_pessoas,
        tarifa6Pessoas: p.tarifa_6_pessoas,
        tarifa8Pessoas: p.tarifa_8_pessoas,
        tarifa10Pessoas: p.tarifa_10_pessoas,
        sobConsultaTexto: p.sob_consulta_texto,
        ativo: p.ativo,
        criadoEm: p.criado_em,
        atualizadoEm: p.atualizado_em
      };
    });

    return NextResponse.json(passeiosFormatados);
  } catch (error) {
    console.error('❌ Erro ao buscar passeios:', error);
    return NextResponse.json({ error: 'Erro ao buscar passeios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const passeioData = await request.json();
    console.log('📦 Recebendo dados para criar passeio:', JSON.stringify(passeioData, null, 2));

    const novoPasseioId = `passeio_${Date.now()}`;

    // Construct values
    const nome = passeioData.name || passeioData.nome || "Passeio sem nome";
    const descricao = passeioData.description || passeioData.descricao || "Descrição não informada";
    const preco = parseFloat(passeioData.price || passeioData.preco) || 0;
    const duracao = passeioData.duration ? `${passeioData.duration}h` : (passeioData.duracao || "Desconhecida");
    const categoria = passeioData.type || passeioData.categoria || "Geral";
    const imagens = JSON.stringify(passeioData.images || []);
    const inclusoes = JSON.stringify(passeioData.includedItems || []);
    const idiomas = JSON.stringify(passeioData.languages || []);
    const capacidadeMaxima = parseInt(passeioData.maxPeople) || 20;

    console.log('📝 Tentando inserir no banco:', {
      id: novoPasseioId, nome, preco, categoria, capacidadeMaxima
    });

    const insertQuery = `
      INSERT INTO passeios 
      (id, nome, descricao, preco, duracao, categoria, imagens, inclusoes, idiomas, capacidade_maxima, ativo, criado_em, atualizado_em,
       tarifa_2_pessoas, tarifa_4_pessoas, tarifa_6_pessoas, tarifa_8_pessoas, tarifa_10_pessoas, sob_consulta_texto)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW(), $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const result = await db.query(insertQuery, [
      novoPasseioId,
      nome,
      descricao,
      preco,
      duracao,
      categoria,
      imagens,
      inclusoes,
      idiomas,
      capacidadeMaxima,
      1,
      parseFloat(passeioData.tarifa2Pessoas) || null,
      parseFloat(passeioData.tarifa4Pessoas) || null,
      parseFloat(passeioData.tarifa6Pessoas) || null,
      parseFloat(passeioData.tarifa8Pessoas) || null,
      parseFloat(passeioData.tarifa10Pessoas) || null,
      passeioData.sobConsultaTexto || null
    ]);

    console.log('✅ Inserção com sucesso. Rows:', result.rowCount);

    const novoPasseio = result.rows[0];

    return NextResponse.json({
      id: novoPasseio.id,
      message: 'Passeio criado com sucesso',
      passeio: {
        ...novoPasseio,
        capacidadeMaxima: novoPasseio.capacidade_maxima,
        criadoEm: novoPasseio.criado_em,
        atualizadoEm: novoPasseio.atualizado_em
      }
    });
  } catch (error) {
    console.error('❌ Erro CRÍTICO ao criar passeio:', error);
    // @ts-ignore
    console.error('Detalhes do erro:', error.message, error.stack);
    return NextResponse.json({ error: 'Erro interno do servidor', details: String(error) }, { status: 500 });
  }
}
