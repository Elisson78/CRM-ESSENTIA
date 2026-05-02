'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import { Local } from '@/types/agendamentos';

export async function getLocais() {
    try {
        const res = await db.query('SELECT * FROM locais ORDER BY nome ASC');
        return res.rows as Local[];
    } catch (error) {
        console.error('Error fetching locais:', error);
        return [];
    }
}

export async function saveLocalAction(data: Partial<Local>) {
    try {
        if (data.id) {
            await db.query(`
                UPDATE locais SET 
                    nome = $1, descricao = $2, atualizado_em = NOW()
                WHERE id = $3
            `, [data.nome, data.descricao, data.id]);
        } else {
            const id = randomUUID();
            await db.query(`
                INSERT INTO locais (id, nome, descricao, criado_em, atualizado_em)
                VALUES ($1, $2, $3, NOW(), NOW())
            `, [id, data.nome, data.descricao]);
        }
        revalidatePath('/admin/locais');
        revalidatePath('/admin/agendamentos');
        return { success: true };
    } catch (error) {
        console.error('Error saving local:', error);
        return { success: false, error: 'Erro ao salvar local' };
    }
}

export async function deleteLocalAction(id: string) {
    try {
        // Check if local is in use
        const inUse = await db.query('SELECT count(*) FROM agendamentos WHERE local_id = $1', [id]);
        if (parseInt(inUse.rows[0].count) > 0) {
            return { success: false, error: 'Local está em uso em um agendamento e não pode ser excluído.' };
        }

        await db.query('DELETE FROM locais WHERE id = $1', [id]);
        revalidatePath('/admin/locais');
        return { success: true };
    } catch (error) {
        console.error('Error deleting local:', error);
        return { success: false, error: 'Erro ao excluir local' };
    }
}
