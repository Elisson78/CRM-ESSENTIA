'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import { Hotel } from '@/types/agendamentos';

export async function getHoteis() {
    try {
        const res = await db.query('SELECT * FROM hoteis ORDER BY nome ASC');
        return res.rows as Hotel[];
    } catch (error) {
        console.error('Error fetching hoteis:', error);
        return [];
    }
}

export async function saveHotelAction(data: Partial<Hotel>) {
    try {
        if (data.id) {
            await db.query(`
                UPDATE hoteis SET 
                    nome = $1, endereco = $2, cidade = $3, telefone = $4, atualizado_em = NOW()
                WHERE id = $5
            `, [data.nome, data.endereco, data.cidade, data.telefone, data.id]);
        } else {
            const id = randomUUID();
            await db.query(`
                INSERT INTO hoteis (id, nome, endereco, cidade, telefone, criado_em, atualizado_em)
                VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            `, [id, data.nome, data.endereco, data.cidade, data.telefone]);
        }
        revalidatePath('/admin/hoteis');
        revalidatePath('/admin/agendamentos');
        return { success: true };
    } catch (error) {
        console.error('Error saving hotel:', error);
        return { success: false, error: 'Erro ao salvar hotel' };
    }
}

export async function deleteHotelAction(id: string) {
    try {
        // Check if hotel is in use
        const inUse = await db.query('SELECT count(*) FROM agendamentos WHERE hotel_id = $1', [id]);
        if (parseInt(inUse.rows[0].count) > 0) {
            return { success: false, error: 'Hotel está em uso em um agendamento e não pode ser excluído.' };
        }

        await db.query('DELETE FROM hoteis WHERE id = $1', [id]);
        revalidatePath('/admin/hoteis');
        return { success: true };
    } catch (error) {
        console.error('Error deleting hotel:', error);
        return { success: false, error: 'Erro ao excluir hotel' };
    }
}
