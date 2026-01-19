const { Pool } = require('pg');

const databases = ['essentia', 'evolution'];

async function migrate() {
    for (const dbName of databases) {
        console.log(`--- Migrating DB: ${dbName} ---`);
        const pool = new Pool({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            database: dbName,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            ssl: false
        });

        try {
            // 1. Add column to clientes
            await pool.query('ALTER TABLE clientes ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMP DEFAULT NOW()');
            console.log(`[${dbName}] ✅ clientes.atualizado_em ok`);

            // 2. Add unique constraint to clientes
            // Check if constraint exists first to avoid error
            const checkQuery = `
                SELECT 1 FROM pg_constraint WHERE conname = 'clientes_email_unique'
            `;
            const checkRes = await pool.query(checkQuery);
            if (checkRes.rowCount === 0) {
                await pool.query('ALTER TABLE clientes ADD CONSTRAINT clientes_email_unique UNIQUE (email)');
                console.log(`[${dbName}] ✅ clientes_email_unique added`);
            } else {
                console.log(`[${dbName}] ℹ️ clientes_email_unique already exists`);
            }

            // 3. Add columns to leads
            await pool.query('ALTER TABLE leads ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMP DEFAULT NOW()');
            await pool.query('ALTER TABLE leads ADD COLUMN IF NOT EXISTS criado_em TIMESTAMP DEFAULT NOW()');
            console.log(`[${dbName}] ✅ leads columns ok`);

            // 4. Change id type in clientes if needed
            // (Assuming it was INT before Prisma/Migration)
            await pool.query('ALTER TABLE clientes ALTER COLUMN id TYPE VARCHAR(255)');
            console.log(`[${dbName}] ✅ clientes.id type ok`);

        } catch (e) {
            console.error(`[${dbName}] ❌ FAILED:`, e.message);
        } finally {
            await pool.end();
        }
    }
}

migrate();
