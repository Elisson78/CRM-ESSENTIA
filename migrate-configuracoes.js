const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: 'essentia',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false
});

async function run() {
  try {
    await pool.query('BEGIN');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS empresa_configuracoes (
        id INTEGER PRIMARY KEY DEFAULT 1,
        razao_social VARCHAR(255),
        slogan VARCHAR(255),
        email VARCHAR(255),
        telefone VARCHAR(255),
        p_iva VARCHAR(255),
        c_f VARCHAR(255),
        banco_nome VARCHAR(255),
        banco_agencia VARCHAR(255),
        banco_conta VARCHAR(255),
        banco_pix VARCHAR(255),
        banco_beneficiario VARCHAR(255),
        endereco_completo TEXT,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CHECK (id = 1)
      )
    `);

    // Inserir dados do cliente baseados na Fatura de exemplo passada
    await pool.query(`
      INSERT INTO empresa_configuracoes (
        id, razao_social, slogan, email, p_iva, c_f, banco_nome, banco_conta, banco_pix, banco_beneficiario
      )
      VALUES (
        1,
        'Marise Nakagawa',
        'Guia e receptivo na Toscana',
        'mariseinflorence@gmail.com',
        '05603120485',
        'NKGMRS70S46Z602U',
        'Banco do Brasil',
        'Câmbio do turismo',
        '11510084860',
        'Marise da Silva Nakagawa'
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    await pool.query('COMMIT');
    console.log('✅ Migração das configurações executada com sucesso no banco `essentia`.');
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Erro na migração das configurações:', error);
  } finally {
    pool.end();
  }
}

run();
