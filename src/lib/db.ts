import { Pool } from 'pg';

const isBuildTime = process.env.SKIP_DB_CHECK === 'true';

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false } // Allows SSL for Supabase/External DBs in production
        : false
});

if (!isBuildTime) {
    console.log(`🔌 DB Connection Target: ${process.env.DB_HOST}:${process.env.DB_PORT} - DB: ${process.env.DB_NAME}`);
    if (!process.env.DB_HOST) {
        console.error('❌ CRITICAL: DB_HOST is not defined in environment variables!');
    }
}

export const db = {
    query: (text: string, params?: any[]) => {
        // console.log('SQL:', text.slice(0, 100).replace(/\n/g, ' '));
        return pool.query(text, params);
    },
};

export default pool;
