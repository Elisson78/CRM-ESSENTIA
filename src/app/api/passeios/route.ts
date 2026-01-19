export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ensureArray = (value: unknown): string[] => {
  if (!value && value !== 0) return [];
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string').map(i => i.trim()).filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string').map(i => i.trim()).filter(Boolean);
      return [value.trim()].filter(Boolean);
    } catch {
      return [value.trim()].filter(Boolean);
    }
  }
  return [];
};

export async function GET() {
  try {
    console.log('🔄 Buscando passeios no banco de dados via Prisma...');
    const todosPasseios = await prisma.passeio.findMany();
    console.log(`✅ ${todosPasseios.length} passeios encontrados no banco`);

    const passeiosFormatados = todosPasseios.map((p) => ({
      ...p,
      imagens: ensureArray(p.imagens),
      inclusoes: ensureArray(p.inclusoes),
      idiomas: ensureArray(p.idiomas),
    }));

    return NextResponse.json(passeiosFormatados);
  } catch (error) {
    console.error('❌ Erro ao buscar passeios:', error);
    return NextResponse.json({ error: 'Erro ao buscar passeios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const passeioData = await request.json();
    const novoPasseioId = `passeio_${Date.now()}`;

    const novoPasseio = await prisma.passeio.create({
      data: {
        id: novoPasseioId,
        nome: passeioData.name || passeioData.nome || "Passeio sem nome",
        descricao: passeioData.description || passeioData.descricao || "Descrição não informada",
        preco: parseFloat(passeioData.price || passeioData.preco) || 0,
        duracao: passeioData.duration ? `${passeioData.duration}h` : (passeioData.duracao || "Desconhecida"),
        categoria: passeioData.type || passeioData.categoria || "Geral",
        imagens: passeioData.images || [],
        inclusoes: passeioData.includedItems || [],
        idiomas: passeioData.languages || [],
        capacidadeMaxima: parseInt(passeioData.maxPeople) || 20,
        ativo: 1
      }
    });

    return NextResponse.json({
      id: novoPasseio.id,
      message: 'Passeio criado com sucesso',
      passeio: novoPasseio
    });
  } catch (error) {
    console.error('Erro ao criar passeio:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
