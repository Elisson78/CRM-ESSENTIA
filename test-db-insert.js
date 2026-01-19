const { Pool } = require('pg');
const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false
});

async function test() {
    try {
        console.log('--- Testing Cliente Insertion ---');
        const query = `
            INSERT INTO clientes (id, nome, email, telefone, status, atualizado_em)
            VALUES ($1, $2, $3, $4, $5, NOW())
            ON CONFLICT (email) DO UPDATE 
            SET nome = EXCLUDED.nome, telefone = EXCLUDED.telefone, status = 'ativo', atualizado_em = NOW()
            RETURNING *
        `;
        const values = ['test-uuid-' + Date.now(), 'Test User', 'test' + Date.now() + '@example.com', '1234', 'ativo'];
        const res = await pool.query(query, values);
        console.log('✅ Success! ID:', res.rows[0].id);

        console.log('--- Checking Clientes Columns (Exact Case) ---');
        const colRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'clientes'");
        console.log('Columns:', colRes.rows.map(r => r.column_name).join(' | '));

    } catch (e) {
        console.error('❌ FAILED:', e);
    } finally {
        await pool.end();
    }
}

test();
