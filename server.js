require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

/* DATABASE CONNECTION */

const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "heart_app"
});

/* CHECK DB CONNECTION */

db.getConnection((err, connection) => {
  if (err) {
    console.log("❌ Database connection failed:", err);
  } else {
    console.log("✅ Database connected");
    connection.release();
  }
});

/* SUBMIT FORM */

app.post("/submit", (req, res) => {

  console.log("📩 Submit request received");
  console.log("Data:", req.body);

  const { yourName, crushName, heartMessage, loveScore, proposal } = req.body;

  const sql = `
  INSERT INTO submissions
  (your_name, crush_name, heart_message, love_score, proposal)
  VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql,
    [yourName, crushName, heartMessage, loveScore, proposal],
    (err, result) => {

      if (err) {
        console.log("❌ SQL ERROR:", err);
        return res.status(500).json({ error: "Database error" });
      }

      console.log("✅ Data saved");

      res.json({ success: true });

    });

});

/* ADMIN DATA */

app.get("/admin", (req, res) => {

  db.query("SELECT * FROM submissions ORDER BY id DESC", (err, results) => {

    if (err) {
      console.log("❌ Admin fetch error:", err);
      return res.status(500).send("Error");
    }

    res.json(results);

  });

});

/* DELETE ENTRY */

app.delete("/delete/:id", (req, res) => {

  const id = req.params.id;

  db.query("DELETE FROM submissions WHERE id = ?", [id], (err) => {

    if (err) {
      console.log("❌ Delete error:", err);
      return res.status(500).send("Delete error");
    }

    res.json({ message: "Deleted" });

  });

});

/* SERVER START */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});