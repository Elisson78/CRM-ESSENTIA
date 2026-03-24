export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔄 Buscando clientes e leads via SQL...');

    // 1. Buscar Usuários (Clientes registrados)
    const usersRes = await db.query(`
        SELECT id, nome, email, telefone, created_at 
        FROM users 
        WHERE user_type = 'cliente' 
        ORDER BY created_at DESC
    `);
    const usersList = usersRes.rows;

    // 2. Buscar Leads ({Tabela Clientes})
    const leadsRes = await db.query(`
        SELECT id, nome, email, telefone, cpf, status, endereco, preferencias 
        FROM clientes
    `);
    const leadsList = leadsRes.rows;

    // 3. Combinar dados
    const combinedData = [
      ...usersList.map(user => ({
        id: user.id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        status: 'active',
        origin: 'website',
        type: 'client',
        preferencias: null
      })),
      ...leadsList
        .filter(lead => !usersList.some(user => user.email === lead.email))
        .map(lead => ({
          id: String(lead.id),
          nome: lead.nome,
          email: lead.email,
          telefone: lead.telefone,
          status: lead.status || 'novo',
          origin: 'referral',
          type: 'lead',
          preferencias: lead.preferencias
        }))
    ];

    console.log(`✅ Total encontrado: ${combinedData.length} (${usersList.length} clientes, ${leadsList.length} leads)`);
    return NextResponse.json(combinedData);
  } catch (error) {
    console.error('❌ Erro ao listar clientes/leads:', error);
    return NextResponse.json({ error: 'Erro ao listar clientes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, telefone } = body;
    
    // Gerar um ID simples já que a coluna é VARCHAR(255) baseada no script de migration
    const newId = (Math.random().toString(36).substring(2, 10) + Date.now().toString(36));

    const result = await db.query(
      `INSERT INTO clientes (id, nome, email, telefone, status) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [newId, nome, email, telefone, 'novo']
    );

    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    console.error('❌ Erro ao criar cliente:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
