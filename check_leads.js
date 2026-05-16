const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'essentia', // Assuming 'essentia' from multi-db-migrate.js
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false
});

async function checkSchema() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'leads';
        `);
        console.log('Columns in leads table:');
        console.table(res.rows);
        fs.writeFileSync('leads_schema.txt', JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkSchema();
