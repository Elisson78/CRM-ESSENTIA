const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:Bradok41@187.127.231.213:5432/db_aventure?schema=public'
});
pool.query("SELECT email FROM users LIMIT 1", (err, res) => {
  if (err) {
    console.error('Connection failed:', err.message);
  } else {
    console.log('Connection successful! Found user:', res.rows[0]);
  }
  pool.end();
});
