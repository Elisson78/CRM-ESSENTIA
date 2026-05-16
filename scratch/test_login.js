const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:Bradok41@187.127.231.213:5432/db_aventure?schema=public'
});
pool.query("SELECT email, password_hash FROM users WHERE email='uzualelisson@gmail.com'", (err, res) => {
  if (err) console.error(err);
  else console.log(res.rows);
  pool.end();
});
