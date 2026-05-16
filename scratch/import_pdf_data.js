const { Pool } = require('pg');
const { randomUUID } = require('crypto');

const pool = new Pool({
    connectionString: "postgresql://postgres:Bradok41@72.62.36.167:5432/essentia?schema=public"
});

async function importData() {
    try {
        console.log('🚀 Iniciando importação de dados do roteiro...');

        // 1. Garantir Guia "Marise Nakagawa"
        const guiaId = randomUUID();
        await pool.query(`
            INSERT INTO guias (id, nome, email, status, criado_em, atualizado_em)
            VALUES ($1, 'Marise Nakagawa', 'marise@essentia.com', 'ativo', NOW(), NOW())
            ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome RETURNING id
        `, [guiaId]);
        const actualGuiaId = (await pool.query("SELECT id FROM guias WHERE email = 'marise@essentia.com'")).rows[0].id;
        console.log('✅ Guia Marise Nakagawa garantida:', actualGuiaId);

        // 2. Garantir Cliente "Roteiro Marise"
        const clienteId = randomUUID();
        await pool.query(`
            INSERT INTO clientes (id, nome, email, status, atualizado_em)
            VALUES ($1, 'Roteiro Marise', 'roteiro@marise.com', 'ativo', NOW())
            ON CONFLICT (email) DO NOTHING
        `, [clienteId]);
        const actualClienteId = (await pool.query("SELECT id FROM clientes WHERE email = 'roteiro@marise.com'")).rows[0].id;
        console.log('✅ Cliente Roteiro Marise garantido:', actualClienteId);

        // 3. Garantir Locais
        const locais = [
            ['firenze', 'Firenze', 'Centro histórico e arredores'],
            ['arezzo', 'Arezzo', 'Centro histórico'],
            ['cortona', 'Cortona', 'Cidade toscana'],
            ['chianti', 'Chianti', 'Região vinícola'],
            ['assis', 'Assis', 'Cidade de São Francisco'],
            ['perugia', 'Perugia', 'Centro da Úmbria'],
            ['montepulciano', 'Montepulciano', 'Vinhos Nobile'],
            ['pienza', 'Pienza', 'Queijos Pecorino'],
            ['siena', 'Siena', 'Palio e Duomo'],
            ['san-gimignano', 'San Gimignano', 'Torres medievais'],
            ['monteriggioni', 'Monteriggioni', 'Castelo murado'],
            ['volterra', 'Volterra', 'Alabastro e Etruscos'],
            ['colle-val-elsa', 'Colle di Val d\'Elsa', 'Cidade de cristal'],
            ['montalcino', 'Montalcino', 'Vinhos Brunello'],
            ['san-quirico', 'San Quirico d\'Orcia', 'Vale d\'Orcia'],
            ['orvieto', 'Orvieto', 'Duomo e poços'],
            ['roma', 'Roma', 'Cidade eterna']
        ];

        for (const [id, nome, desc] of locais) {
            await pool.query(`
                INSERT INTO locais (id, nome, descricao, criado_em, atualizado_em)
                VALUES ($1, $2, $3, NOW(), NOW())
                ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome
            `, [id, nome, desc]);
        }
        console.log('✅ Locais garantidos.');

        // 4. Mapeamento de Passeios do Roteiro
        const passeios = [
            { id: 'rot-firenze-centro', nome: 'FIRENZE - Passeio a pé pelo centro', preco: 400 },
            { id: 'rot-arezzo-cortona', nome: 'FIRENZE - AREZZO - CORTONA', preco: 610 },
            { id: 'rot-chianti', nome: 'FIRENZE - CHIANTI - FIRENZE', preco: 0 },
            { id: 'rot-badia-sovana', nome: 'FIRENZE - BADIA A PASSIGNANO - SOVANA', preco: 0 },
            { id: 'rot-assis-perugia', nome: 'AGRITURISMO - ASSIS - PERUGIA', preco: 580 },
            { id: 'rot-montepulciano', nome: 'AGRITURISMO - MONTEPULCIANO', preco: 320 },
            { id: 'rot-pienza-siena', nome: 'AGRITURISMO - PIENZA - SIENA', preco: 320 },
            { id: 'rot-siena-centro', nome: 'SIENA - Passeio a pé pelo centro histórico', preco: 290 },
            { id: 'rot-san-gimignano', nome: 'SIENA - SAN GIMIGNANO - MONTERIGGIONI', preco: 320 },
            { id: 'rot-volterra-colle', nome: 'SIENA - VOLTERRA - COLLE VAL D\'ELSA', preco: 290 },
            { id: 'rot-montalcino-san-quirico', nome: 'SIENA - MONTALCINO - SAN QUIRICO', preco: 0 },
            { id: 'rot-orvieto-roma', nome: 'SIENA - ORVIETO - ROMA', preco: 0 }
        ];

        for (const p of passeios) {
            await pool.query(`
                INSERT INTO passeios (id, nome, preco, descricao, duracao, categoria, ativo, criado_em, atualizado_em)
                VALUES ($1, $2, $3, $4, $5, $6, 1, NOW(), NOW())
                ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome, preco = EXCLUDED.preco, descricao = EXCLUDED.descricao, duracao = EXCLUDED.duracao, categoria = EXCLUDED.categoria
            `, [p.id, p.nome, p.preco, p.nome, '8h', 'Cultural']);
        }



        console.log('✅ Passeios (Rotas) garantidos.');

        // 5. Agendamentos (Maio/2026)
        const agendamentos = [
            { data: '2026-05-02T09:00', pId: 'rot-firenze-centro', hId: 'nh-firenze', lId: 'firenze', valor: 400 },
            { data: '2026-05-03T09:00', pId: 'rot-arezzo-cortona', hId: 'nh-firenze', lId: 'arezzo', valor: 610 },
            { data: '2026-05-04T09:00', pId: 'rot-chianti', hId: 'nh-firenze', lId: 'chianti', valor: 0 },
            { data: '2026-05-07T09:00', pId: 'rot-badia-sovana', hId: 'agriturismo-la-sovana', lId: 'firenze', valor: 0 },
            { data: '2026-05-08T09:00', pId: 'rot-assis-perugia', hId: 'agriturismo-la-sovana', lId: 'assis', valor: 580 },
            { data: '2026-05-09T09:00', pId: 'rot-montepulciano', hId: 'agriturismo-la-sovana', lId: 'montepulciano', valor: 320 },
            { data: '2026-05-10T09:00', pId: 'rot-pienza-siena', hId: 'athena-hotel', lId: 'pienza', valor: 320 },
            { data: '2026-05-11T09:00', pId: 'rot-siena-centro', hId: 'athena-hotel', lId: 'siena', valor: 290 },
            { data: '2026-05-12T09:00', pId: 'rot-san-gimignano', hId: 'athena-hotel', lId: 'san-gimignano', valor: 320 },
            { data: '2026-05-13T09:00', pId: 'rot-volterra-colle', hId: 'athena-hotel', lId: 'volterra', valor: 290 },
            { data: '2026-05-14T09:00', pId: 'rot-montalcino-san-quirico', hId: 'athena-hotel', lId: 'montalcino', valor: 0 },
            { data: '2026-05-15T09:00', pId: 'rot-orvieto-roma', hId: 'rose-garden-palace', lId: 'orvieto', valor: 0 }
        ];

        for (const a of agendamentos) {
            const agId = randomUUID();
            await pool.query(`
                INSERT INTO agendamentos (
                    id, passeio_id, cliente_id, guia_id, hotel_id, local_id, data_passeio, 
                    numero_pessoas, valor_total, status, criado_em, atualizado_em
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, 1, $8, 'confirmadas', NOW(), NOW())
            `, [
                agId, a.pId, actualClienteId, actualGuiaId, a.hId, a.lId, a.data, a.valor
            ]);
        }
        console.log('✅ Agendamentos inseridos na agenda.');

        console.log('🏁 Importação concluída!');
    } catch (e) {
        console.error('❌ Erro na importação:', e);
    } finally {
        await pool.end();
    }
}

importData();
