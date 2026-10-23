const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'iulat_app',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'iulat_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.query('SELECT 1');
    console.log('MySQL connection successful.');
  } finally {
    connection.release();
  }
}

module.exports = { pool, testConnection };
