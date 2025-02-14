const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",          // PostgreSQL kullanıcı adı
  host: "localhost",         // PostgreSQL sunucu adresi
  database: "kamp2025",    // Bağlanılacak veritabanı adı
  password: "26122016",    // PostgreSQL şifren
  port: 5432,                // PostgreSQL varsayılan portu
});

module.exports = pool;