const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
    connectionString: 'postgresql://elisson_essentia:elisson_essentia_2024@89.116.227.182:5432/essentia_crm',
    ssl: false
});

async function inspect() {
    await client.connect();
    const res = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'clientes';
    `);
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
}

inspect();
