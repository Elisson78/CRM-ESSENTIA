const { Pool } = require('pg');

const databases = ['essentia', 'evolution'];

async function migrate() {
    for (const dbName of databases) {
        console.log(`--- Migrando Banco: ${dbName} ---`);
        const pool = new Pool({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            database: dbName,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            ssl: false
        });

        try {
            await pool.query('BEGIN');

            const createFaturasTable = `
                CREATE TABLE IF NOT EXISTS faturas (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    cliente_id VARCHAR(255) REFERENCES clientes(id) ON DELETE SET NULL,
                    fatura_numero VARCHAR(50) NOT NULL,
                    data_emissao DATE NOT NULL,
                    data_vencimento DATE NOT NULL,
                    cotacao_cambio_turismo DECIMAL(10, 4) DEFAULT 1.0000,
                    total_eur DECIMAL(15, 2) DEFAULT 0.00,
                    total_brl DECIMAL(15, 2) DEFAULT 0.00,
                    status VARCHAR(50) DEFAULT 'Pendente',
                    criado_em TIMESTAMP DEFAULT NOW(),
                    atualizado_em TIMESTAMP DEFAULT NOW()
                )
            `;
            await pool.query(createFaturasTable);
            console.log(`[${dbName}] ✅ Tabela 'faturas' criada ou já existente.`);

            const createFaturaItensTable = `
                CREATE TABLE IF NOT EXISTS fatura_itens (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    fatura_id UUID REFERENCES faturas(id) ON DELETE CASCADE,
                    servico_descricao VARCHAR(255) NOT NULL,
                    fornecedor VARCHAR(255),
                    valor_eur DECIMAL(10, 2) DEFAULT 0.00
                )
            `;
            await pool.query(createFaturaItensTable);
            console.log(`[${dbName}] ✅ Tabela 'fatura_itens' criada ou já existente.`);

            await pool.query('COMMIT');
        } catch (e) {
            await pool.query('ROLLBACK');
            console.error(`[${dbName}] ❌ FALHA NA MIGRAÇÃO:`, e.message);
        } finally {
            await pool.end();
        }
    }
}

migrate();
