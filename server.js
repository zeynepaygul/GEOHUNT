const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());  // JSON verisini okuyabilmek için

// Kullanıcı ekleme endpoint'i
app.post("/addUser", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "İsim zorunludur!" });
    }
    const result = await pool.query("INSERT INTO users (name) VALUES ($1) RETURNING *", [name]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

app.post("/addUserPoint", async (req, res) => {
    try {
      const { name, score } = req.body;
      console.log("Gelen Veriler:", name, score);  // Gelen veriyi kontrol et
      if (!name || score === undefined) {
        return res.status(400).json({ error: "İsim veya puan eksik!" });
      }
    
      const existingUser = await pool.query("SELECT * FROM users WHERE name = $1", [name]);
    var query_ = "update users set score = " + score + " where name = '" + name + "'";
      if (existingUser.rows.length > 0) {
        const updatedUser = await pool.query(query_);
          
        return res.json(updatedUser.rows[0]);
      } else {
        const newUser = await pool.query(
            "INSERT INTO users (name, score) VALUES ($1, $2) RETURNING *",
            [name, score]
          );
          
        return res.json(newUser.rows[0]);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  });
  
  

// Server başlat
app.listen(5051, () => {
  console.log("Sunucu 5000 portunda çalışıyor...");
});
