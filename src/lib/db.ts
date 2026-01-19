import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false
});

console.log(`🔌 DB Connection: ${process.env.DB_HOST}:${process.env.DB_PORT} - DB: ${process.env.DB_NAME}`);

export const db = {
    query: (text: string, params?: any[]) => {
        // console.log('SQL:', text.slice(0, 100).replace(/\n/g, ' '));
        return pool.query(text, params);
    },
};

export default pool;
