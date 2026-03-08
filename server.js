require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

/* ------------------ Middleware ------------------ */
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests
});
app.use(limiter);

/* ------------------ Database Connection ------------------ */
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Database Connected Successfully");
  }
});

/* ------------------ Admin Password ------------------ */
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function checkAdmin(req, res, next) {
  const password = req.headers["admin-password"];
  if (password !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
}

/* ------------------ Save Submission ------------------ */
app.post("/submit", (req, res) => {
  const { yourName, crushName, heartMessage, loveScore, proposal } = req.body;

  const sql = `
    INSERT INTO submissions
    (your_name, crush_name, heart_message, love_score, proposal)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [yourName, crushName, heartMessage, loveScore, proposal], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error saving data");
    }
    res.json({ message: "Saved Successfully" });
  });
});

/* ------------------ Admin View ------------------ */
app.get("/admin", checkAdmin, (req, res) => {
  db.query("SELECT * FROM submissions ORDER BY id DESC", (err, results) => {
    if (err) {
      return res.status(500).send("Error fetching data");
    }
    res.json(results);
  });
});

/* ------------------ Delete Entry ------------------ */
app.delete("/delete/:id", checkAdmin, (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM submissions WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).send("Error deleting");
    res.json({ message: "Deleted successfully" });
  });
});

/* ------------------ Start Server ------------------ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});