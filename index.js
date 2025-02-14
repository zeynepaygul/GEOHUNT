const pool = require("./db");

// Kullanıcı ekleme fonksiyonu (sadece name)
async function addUser(name) {
  try {
    const result = await pool.query(
      "INSERT INTO users (name) VALUES ($1) RETURNING *",
      [name]
    );
    console.log("Yeni kullanıcı eklendi:", result.rows[0]);
  } catch (err) {
    console.error("Veri eklenirken hata oluştu:", err);
  }
}

// Fonksiyonu çağır ve test et
addUser("Ahmet Yılmaz");
