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
    return NextResponse.json(
      { error: 'Erro ao listar clientes' },
      { status: 500 }
    );
  }
}
