export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ensureArray = (value: unknown): string[] => {
  if (!value && value !== 0) return [];
  if (Array.isArray(value)) return value.filter(i => typeof i === 'string');
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      return [value];
    } catch {
      return [value];
    }
  }
  return [];
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 Buscando passeio no banco via Prisma:', id);

    const passeio = await prisma.passeio.findUnique({
      where: { id }
    });

    if (!passeio) {
      console.log('❌ Passeio não encontrado:', id);
      return NextResponse.json({ error: 'Passeio não encontrado' }, { status: 404 });
    }

    const passeioFormatado = {
      ...passeio,
      imagens: ensureArray(passeio.imagens),
      inclusoes: ensureArray(passeio.inclusoes),
      idiomas: ensureArray(passeio.idiomas),
    };

    return NextResponse.json(passeioFormatado);
  } catch (error) {
    console.error('❌ Erro ao buscar passeio:', error);
    return NextResponse.json({ error: 'Erro ao buscar passeio' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const passeioData = await request.json();

    console.log('🔄 Atualizando passeio via Prisma:', id);

    const data: any = {
      nome: passeioData.name || passeioData.nome,
      descricao: passeioData.description || passeioData.descricao || "Descrição não informada",
      preco: parseFloat(passeioData.price || passeioData.preco) || 0,
      duracao: passeioData.duration ? `${passeioData.duration}h` : (passeioData.duracao || ""),
      categoria: passeioData.type || passeioData.categoria || "Geral",
      imagens: passeioData.images || [],
      inclusoes: passeioData.includedItems || [],
      idiomas: passeioData.languages || [],
      capacidadeMaxima: parseInt(passeioData.maxPeople) || 20,
      ativo: (passeioData.status === 'Ativo' || passeioData.ativo === 1) ? 1 : 0,
      updatedAt: new Date()
    };

    const updatedPasseio = await prisma.passeio.update({
      where: { id },
      data
    });

    return NextResponse.json({
      message: 'Passeio atualizado com sucesso',
      passeio: updatedPasseio
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar passeio:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🗑️ Excluindo passeio via Prisma:', id);

    await prisma.passeio.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Passeio excluído com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao excluir passeio:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
