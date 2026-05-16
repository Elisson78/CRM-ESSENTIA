const { Pool } = require('pg');
const pool = new Pool({
    connectionString: "postgresql://postgres:Bradok41@72.62.36.167:5432/essentia?schema=public"
});

async function migrate() {
    try {
        console.log('🚀 Iniciando migração...');

        // 1. Criar tabela de hoteis
        await pool.query(`
            CREATE TABLE IF NOT EXISTS hoteis (
                id VARCHAR(255) PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                endereco TEXT,
                cidade VARCHAR(100),
                telefone VARCHAR(50),
                criado_em TIMESTAMP DEFAULT NOW(),
                atualizado_em TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Tabela hoteis criada/verificada.');

        // 2. Criar tabela de locais
        await pool.query(`
            CREATE TABLE IF NOT EXISTS locais (
                id VARCHAR(255) PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                descricao TEXT,
                criado_em TIMESTAMP DEFAULT NOW(),
                atualizado_em TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Tabela locais criada/verificada.');

        // 3. Adicionar colunas em agendamentos
        await pool.query(`
            ALTER TABLE agendamentos 
            ADD COLUMN IF NOT EXISTS hotel_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS local_id VARCHAR(255)
        `);
        console.log('✅ Colunas hotel_id e local_id adicionadas a agendamentos.');

        // 4. Inserir alguns dados iniciais baseados no PDF
        const hoteisIniciais = [
            ['nh-firenze', 'NH FIRENZE', 'Piazza Vittorio Veneto, 4/ A', 'Firenze'],
            ['agriturismo-la-sovana', 'AGRITURISMO LA SOVANA', 'Sarteano', 'Sarteano'],
            ['athena-hotel', 'ATHENA HOTEL', '', 'Siena'],
            ['rose-garden-palace', 'ROSE GARDEN PALACE ROMA', '', 'Roma']
        ];

        for (const [id, nome, endereco, cidade] of hoteisIniciais) {
            await pool.query(`
                INSERT INTO hoteis (id, nome, endereco, cidade)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO NOTHING
            `, [id, nome, endereco, cidade]);
        }
        console.log('✅ Dados iniciais de hotéis inseridos.');

        console.log('🏁 Migração concluída com sucesso!');
    } catch (e) {
        console.error('❌ Erro na migração:', e);
    } finally {
        await pool.end();
    }
}

migrate();
