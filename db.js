require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

async function initDb() {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL успешно подключён через SSL');
  } catch (err) {
    console.error('❌ Не удалось подключиться к PostgreSQL:', err.message);
    process.exit(-1);
  }

  try {
    // ШАГ 1: Создаем саму таблицу, если её нет
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        firebase_uid VARCHAR(128) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Таблица users проверена/создана');

    // ШАГ 2: Проверяем колонку (на всякий случай)
    await pool.query(
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE;'
    );
    console.log('✅ Schema: firebase_uid column ensured');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
  }
}

initDb();

module.exports = { pool, query: (text, params) => pool.query(text, params) };