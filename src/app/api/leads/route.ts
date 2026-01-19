export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validação básica
        if (!data.nome || !data.email || !data.passeioId) {
            return NextResponse.json({ error: 'Dados obrigatórios faltando (nome, email, passeioId)' }, { status: 400 });
        }

        const insertQuery = `
      INSERT INTO leads (
        nome, email, telefone, passeio_id, passeio_nome, 
        data_passeio, numero_pessoas, observacoes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'novo')
      RETURNING *
    `;

        const result = await db.query(insertQuery, [
            data.nome,
            data.email,
            data.telefone || null,
            data.passeioId,
            data.passeioNome,
            data.data ? new Date(data.data).toISOString().split('T')[0] : null,
            data.pessoas || 1,
            data.observacoes || '',
        ]);

        return NextResponse.json({ success: true, lead: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar lead:', error);
        return NextResponse.json({ error: 'Erro interno ao salvar solicitação.' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const result = await db.query("SELECT * FROM leads ORDER BY created_at DESC");
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar leads:', error);
        return NextResponse.json({ error: 'Erro interno ao buscar leads.' }, { status: 500 });
    }
}
