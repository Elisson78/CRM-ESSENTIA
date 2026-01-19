'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import type { Tarefa, Passeio, Cliente, Guia, NovaTarefaData, Status, KanbanColumn } from '@/types/agendamentos';

// Helper to normalize data from DB
const toNumber = (value: unknown, fallback = 0): number => {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? fallback : numeric;
};

const toStringOrNull = (value: unknown): string | null => {
    if (value === null || value === undefined) return null;
    return String(value);
};

const toStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.map(String) : value.split(",").map((item) => item.trim());
        } catch {
            return value.split(",").map((item) => item.trim());
        }
    }
    return [];
};

export async function getBoardData() {
    try {
        console.log('🔄 Fetching Agendamentos Board Data (Server Action)...');

        // Parallel data fetching
        const [agendamentosRes, leadsRes, passeiosRes, clientesRes, guiasRes, columnsRes] = await Promise.all([
            db.query(`
        SELECT 
          a.id, a.passeio_id, a.cliente_id, a.guia_id, 
          a.data_passeio, 
          a.numero_pessoas, a.valor_total, a.valor_comissao, a.percentual_comissao, 
          a.status, a.observacoes, 
          a.criado_em, a.atualizado_em,
          p.nome as passeio_nome,
          c.nome as cliente_nome,
          g.nome as guia_nome
        FROM agendamentos a
        LEFT JOIN passeios p ON a.passeio_id = p.id
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN guias g ON a.guia_id = g.id
        ORDER BY a.criado_em DESC
      `),
            // Fetch Leads (only active ones)
            db.query(`SELECT * FROM leads WHERE status != 'convertido' ORDER BY created_at DESC`),
            db.query('SELECT * FROM passeios ORDER BY nome ASC'),
            db.query('SELECT * FROM clientes ORDER BY nome ASC'),
            db.query('SELECT * FROM guias ORDER BY nome ASC'),
            db.query('SELECT * FROM kanban_columns WHERE ativo = 1 ORDER BY order_index ASC')
        ]);

        const agendamentos: Tarefa[] = agendamentosRes.rows.map(row => ({
            id: row.id,
            passeio_id: row.passeio_id,
            cliente_id: toStringOrNull(row.cliente_id),
            guia_id: toStringOrNull(row.guia_id),
            data_passeio: String(row.data_passeio),
            numero_pessoas: toNumber(row.numero_pessoas, 1),
            valor_total: toNumber(row.valor_total, 0),
            valor_comissao: toNumber(row.valor_comissao, 0),
            percentual_comissao: toNumber(row.percentual_comissao, 30),
            status: row.status as Status,
            observacoes: toStringOrNull(row.observacoes),
            passeio_nome: toStringOrNull(row.passeio_nome),
            cliente_nome: toStringOrNull(row.cliente_nome),
            guia_nome: toStringOrNull(row.guia_nome),
        }));

        // Convert Leads to "Tarefas" (Cards)
        const leads: Tarefa[] = leadsRes.rows.map(row => ({
            id: row.id,
            passeio_id: row.passeio_id,
            cliente_id: null,
            guia_id: null,
            data_passeio: row.data_passeio ? String(row.data_passeio) : '',
            numero_pessoas: toNumber(row.numero_pessoas, 1),
            valor_total: 0, // Leads might not have calculated total yet, or we can fetch. Assuming 0 for now.
            valor_comissao: 0,
            percentual_comissao: 0,
            status: row.status || 'novo', // Use status from DB
            observacoes: toStringOrNull(row.observacoes),
            passeio_nome: toStringOrNull(row.passeio_nome) || 'Passeio Solicitado',
            cliente_nome: toStringOrNull(row.nome) + " (Lead)", // Mark as lead
            guia_nome: null,
            isLead: true, // Marker for frontend
            leadEmail: row.email, // Store extra data if needed
            leadPhone: row.telefone
        }));

        const passeios: Passeio[] = passeiosRes.rows.map(row => ({
            id: String(row.id),
            nome: String(row.nome),
            descricao: String(row.descricao || ''),
            preco: toNumber(row.preco, 0),
            duracao: String(row.duracao || ''),
            categoria: String(row.categoria || ''),
        }));

        const clientes: Cliente[] = clientesRes.rows.map(row => ({
            id: String(row.id),
            nome: String(row.nome),
            email: String(row.email || ''),
            telefone: String(row.telefone || ''),
        }));

        const guias: Guia[] = guiasRes.rows.map(row => ({
            id: String(row.id),
            nome: String(row.nome),
            email: String(row.email || ''),
            especialidades: toStringArray(row.especialidades),
        }));

        const columns: KanbanColumn[] = columnsRes.rows.map(row => ({
            id: String(row.id),
            title: String(row.title),
            color: String(row.color),
            order_index: toNumber(row.order_index, 0),
            ativo: row.ativo === 1
        }));

        // Ensure "Novo / Leads" column exists
        if (!columns.find(c => c.id === 'novo')) {
            columns.unshift({
                id: 'novo',
                title: 'Novos Leads',
                color: 'blue',
                order_index: -1,
                ativo: true
            });
        }

        // Merge agendamentos + leads
        return { agendamentos: [...leads, ...agendamentos], passeios, clientes, guias, columns };
    } catch (error) {
        console.error('❌ Error in getBoardData:', error);
        throw new Error('Falha ao carregar dados do quadro.');
    }
}

import { ensureClienteExiste } from '@/lib/customer-service';

export async function updateStatusAction(id: string, status: Status) {
    try {
        // 1. Check if it is a Lead
        const leadRes = await db.query('SELECT * FROM leads WHERE id = $1', [id]);
        if (leadRes.rows.length > 0) {
            console.log('🔄 Updating Lead Status:', id, '->', status);
            await db.query("UPDATE leads SET status = $1, atualizado_em = NOW() WHERE id = $2", [status, id]);
            revalidatePath('/admin/agendamentos');
            return { success: true };
        }

        // 2. Normal Update (Agendamento)
        await db.query(
            'UPDATE agendamentos SET status = $1, atualizado_em = NOW() WHERE id = $2',
            [status, id]
        );
        revalidatePath('/admin/agendamentos');
        revalidatePath('/admin/calendario');
        return { success: true };
    } catch (error) {
        console.error('Error updating status:', error);
        return { success: false, error: `Erro: ${String(error)}` };
    }
}

export async function convertLeadAction(id: string) {
    try {
        const leadRes = await db.query('SELECT * FROM leads WHERE id = $1', [id]);
        if (leadRes.rows.length === 0) throw new Error('Lead não encontrado');

        const lead = leadRes.rows[0];
        console.log('🚀 Explicitly Converting Lead to Cliente:', id);

        // A. Ensure Cliente (Creates User + Cliente record)
        console.log('Step A: Ensuring Cliente exists for', lead.email);
        const { clienteId } = await ensureClienteExiste({
            nome: lead.nome,
            email: lead.email,
            telefone: lead.telefone
        });
        console.log('Step A Complete: Cliente ID is', clienteId);

        // B. Create Agendamento
        console.log('Step B: Creating Agendamento for Ride', lead.passeio_id);
        const agendamentoId = randomUUID();
        const passeioRes = await db.query('SELECT preco FROM passeios WHERE id = $1', [lead.passeio_id]);
        const preco = passeioRes.rows[0]?.preco || 0;
        const valorTotal = Number(preco) * Number(lead.numero_pessoas || 1);

        await db.query(`
            INSERT INTO agendamentos (
                id, passeio_id, cliente_id, data_passeio, numero_pessoas, 
                valor_total, valor_comissao, percentual_comissao, observacoes, status, criado_em, atualizado_em
            ) VALUES ($1, $2, $3, $4, $5, $6, 0, 30, $7, $8, NOW(), NOW())
        `, [
            agendamentoId,
            lead.passeio_id,
            clienteId,
            lead.data_passeio,
            lead.numero_pessoas,
            valorTotal,
            lead.observacoes || 'Convertido manualmente de Lead',
            'em_progresso' // Status padrão para novos agendamentos
        ]);
        console.log('✅ Agendamento criado:', agendamentoId);

        // C. Mark Lead as Converted
        await db.query("UPDATE leads SET status = 'convertido', atualizado_em = NOW() WHERE id = $1", [id]);

        revalidatePath('/admin/agendamentos');
        revalidatePath('/admin/calendario');
        return { success: true };
    } catch (error) {
        console.error('Error in convertLeadAction:', error);
        return { success: false, error: String(error) };
    }
}

export async function saveAgendamentoAction(data: NovaTarefaData, id?: string) {
    try {
        const normalizeNullable = (value: unknown) => {
            if (value === undefined || value === null || value === '' || value === 'none') return null;
            return value as string;
        };

        const passeioId = data.passeioId;
        const dataPasseio = data.data;
        const numeroPessoas = Number(data.numeroPessoas ?? 1);
        const percentualComissao = Number(data.comissaoPercentual ?? 30);
        const clienteId = normalizeNullable(data.clienteId);
        const guiaId = normalizeNullable(data.guiaId);
        const observacoes = data.observacoes ?? null;

        // Get Ride Price for calculation
        const passeioRes = await db.query('SELECT preco FROM passeios WHERE id = $1', [passeioId]);
        if (passeioRes.rowCount === 0) throw new Error('Passeio não encontrado');

        const preco = Number(passeioRes.rows[0].preco);
        const valorTotal = preco * numeroPessoas;
        const valorComissao = valorTotal * (percentualComissao / 100);

        if (id) {
            // UPDATE
            await db.query(`
        UPDATE agendamentos SET 
          passeio_id = $1, cliente_id = $2, guia_id = $3, data_passeio = $4,
          numero_pessoas = $5, valor_total = $6, valor_comissao = $7, 
          percentual_comissao = $8, observacoes = $9, atualizado_em = NOW()
        WHERE id = $10
      `, [
                passeioId, clienteId, guiaId, dataPasseio,
                numeroPessoas, valorTotal, valorComissao, percentualComissao, observacoes,
                id
            ]);
        } else {
            // INSERT
            const newId = randomUUID();
            const status = data.status || 'em_progresso';
            await db.query(`
        INSERT INTO agendamentos (
          id, passeio_id, cliente_id, guia_id, data_passeio, numero_pessoas, 
          valor_total, valor_comissao, percentual_comissao, observacoes, status, criado_em, atualizado_em
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      `, [
                newId, passeioId, clienteId, guiaId, dataPasseio,
                numeroPessoas, valorTotal, valorComissao, percentualComissao, observacoes, status
            ]);
        }

        revalidatePath('/admin/agendamentos');
        return { success: true };
    } catch (error) {
        console.error('Error saving agendamento:', error);
        return { success: false, error: 'Erro ao salvar agendamento' };
    }
}

export async function deleteAgendamentoAction(id: string) {
    try {
        await db.query('DELETE FROM agendamentos WHERE id = $1', [id]);
        revalidatePath('/admin/agendamentos');
        return { success: true };
    } catch (error) {
        console.error('Error deleting agendamento:', error);
        return { success: false, error: 'Falha ao remover agendamento' };
    }
}

// --- COLUMN ACTIONS ---

export async function saveColumnAction(column: Partial<KanbanColumn>) {
    try {
        if (column.id && column.id.includes('new_')) {
            // Creating a completely new column ID involves updating the DB logic which expects 'em_progresso' etc.
            // But for now, user seems to want dynamic columns. 
            // We will treat 'new_' as a create operation but we need a real slug.
            // Let's sanitize the title to create an ID if one isn't provided or is temp.
            const newId = column.title?.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || randomUUID();

            await db.query(`
                 INSERT INTO kanban_columns (id, title, color, order_index, ativo, criado_em, atualizado_em)
                 VALUES ($1, $2, $3, $4, 1, NOW(), NOW())
             `, [
                newId,
                column.title,
                column.color || 'gray',
                column.order_index || 99
            ]);
        } else if (column.id) {
            // Update
            await db.query(`
                UPDATE kanban_columns 
                SET title = $1, color = $2, order_index = $3, atualizado_em = NOW()
                WHERE id = $4
            `, [column.title, column.color, column.order_index, column.id]);
        }
        revalidatePath('/admin/agendamentos');
        return { success: true };
    } catch (error) {
        console.error('Error saving column:', error);
        return { success: false, error: 'Falha ao salvar coluna' };
    }
}

export async function deleteColumnAction(id: string) {
    try {
        // Prevent deleting if tasks exist
        const tasksRes = await db.query('SELECT count(*) as count FROM agendamentos WHERE status = $1', [id]);
        if (Number(tasksRes.rows[0].count) > 0) {
            return { success: false, error: 'Não é possível remover coluna com agendamentos.' };
        }

        await db.query('DELETE FROM kanban_columns WHERE id = $1', [id]);
        revalidatePath('/admin/agendamentos');
        return { success: true };
    } catch (error) {
        console.error('Error deleting column:', error);
        return { success: false, error: 'Falha ao remover coluna' };
    }
}
