const { Pool } = require('pg');
const fs = require('fs');

// Parsing connection string manually since dotenv failed
const connectionString = "postgresql://postgres:Bradok41@187.127.231.213:5432/essentia?schema=public";

const pool = new Pool({
    connectionString,
    ssl: false
});

async function checkSchema() {
    try {
        console.log('Connecting to database...');
        const res = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'leads'
            ORDER BY ordinal_position;
        `);

        console.log('Columns in leads table:');
        console.table(res.rows);

        const schemaInfo = JSON.stringify(res.rows, null, 2);
        fs.writeFileSync('leads_schema.json', schemaInfo);
        console.log('Schema saved to leads_schema.json');

    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        await pool.end();
    }
}

checkSchema();
