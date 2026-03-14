require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

/* DATABASE CONNECTION */

const db = new Pool({
  connectionString: "postgresql://postgres:YOUR_PASSWORD@db.ppedksrmxfvkfoekcffx.supabase.co:5432/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

/* CHECK DB CONNECTION */

db.connect()
.then(() => {
  console.log("✅ Database connected");
})
.catch(err => {
  console.log("❌ Database connection failed:", err);
});

/* SUBMIT FORM */

app.post("/submit", async (req, res) => {

  console.log("📩 Submit request received");
  console.log(req.body);

  const { yourName, crushName, heartMessage, loveScore, proposal } = req.body;

  try {

    const sql = `
    INSERT INTO submissions
    (your_name,crush_name,heart_message,love_score,proposal)
    VALUES ($1,$2,$3,$4,$5)
    `;

    await db.query(sql,[yourName,crushName,heartMessage,loveScore,proposal]);

    console.log("✅ Data saved");

    res.json({success:true});

  } catch(err){

    console.log("❌ SQL ERROR:",err);
    res.status(500).json({error:"Database error"});

  }

});

/* ADMIN DATA */

app.get("/admin", async (req,res)=>{

  try{

    const result = await db.query(
      "SELECT * FROM submissions ORDER BY id DESC"
    );

    res.json(result.rows);

  }catch(err){

    console.log("❌ Admin fetch error:",err);
    res.status(500).send("Error");

  }

});

/* DELETE ENTRY */

app.delete("/delete/:id", async (req,res)=>{

  const id = req.params.id;

  try{

    await db.query(
      "DELETE FROM submissions WHERE id=$1",
      [id]
    );

    res.json({message:"Deleted"});

  }catch(err){

    console.log("❌ Delete error:",err);
    res.status(500).send("Delete error");

  }

});

/* SERVER START */

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
  console.log("🚀 Server running on port "+PORT);
});