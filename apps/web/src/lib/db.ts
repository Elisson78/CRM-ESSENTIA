import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST || '72.62.36.167',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'essentia',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Bradok41',
    ssl: false // Disable SSL if not needed, or configure it if required
});

console.log(`🔌 DB Connection: ${process.env.DB_HOST || '72.62.36.167'}:${process.env.DB_PORT || '5432'} - DB: ${process.env.DB_NAME || 'essentia'}`);

export const db = {
    query: (text: string, params?: any[]) => {
        // console.log('SQL:', text.slice(0, 100).replace(/\n/g, ' '));
        return pool.query(text, params);
    },
};

export default pool;
