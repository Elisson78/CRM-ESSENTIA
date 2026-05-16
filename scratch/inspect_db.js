const { Pool } = require('pg');
const pool = new Pool({
    connectionString: "postgresql://postgres:Bradok41@72.62.36.167:5432/essentia?schema=public"
});

async function run() {
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', tables.rows.map(r => r.table_name));
    
    for (const table of tables.rows) {
        const columns = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table.table_name}'`);
        console.log(`\nTable: ${table.table_name}`);
        columns.rows.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));
    }
    await pool.end();
}

run();
