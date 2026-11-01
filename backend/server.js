require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Database (Neon Postgres) ----
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon requires SSL
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS people (
      id          SERIAL PRIMARY KEY,
      first_name  VARCHAR(100) NOT NULL,
      last_name   VARCHAR(100) NOT NULL,
      phone       VARCHAR(30)  NOT NULL,
      gender      VARCHAR(20)  NOT NULL,
      age         INTEGER      NOT NULL CHECK (age BETWEEN 0 AND 120),
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);
  console.log("Database ready");
}

// ---- Middleware ----
// FRONTEND_URL = your Netlify URL (no trailing slash). Use * only while testing.
const allowedOrigin = process.env.FRONTEND_URL || "*";
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// ---- Routes ----
app.get("/", (req, res) => res.json({ status: "ok" }));

app.post("/api/people", async (req, res) => {
  try {
    const { firstName, lastName, phone, gender, age } = req.body;

    const cleanFirst = String(firstName || "").trim();
    const cleanLast = String(lastName || "").trim();
    const cleanPhone = String(phone || "").trim();
    const cleanGender = String(gender || "").trim();
    const cleanAge = Number(age);

    if (!cleanFirst || !cleanLast || !cleanPhone || !cleanGender) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (!/^[+\d][\d\s\-()]{5,28}$/.test(cleanPhone)) {
      return res.status(400).json({ error: "Phone number is not valid." });
    }
    if (!["male", "female", "other"].includes(cleanGender.toLowerCase())) {
      return res.status(400).json({ error: "Gender is not valid." });
    }
    if (!Number.isInteger(cleanAge) || cleanAge < 0 || cleanAge > 120) {
      return res.status(400).json({ error: "Age must be a whole number from 0 to 120." });
    }

    const { rows } = await pool.query(
      `INSERT INTO people (first_name, last_name, phone, gender, age)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, first_name, last_name, phone, gender, age, created_at`,
      [cleanFirst, cleanLast, cleanPhone, cleanGender.toLowerCase(), cleanAge]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error. Try again." });
  }
});

app.get("/api/people", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, phone, gender, age, created_at
       FROM people ORDER BY created_at DESC LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error. Try again." });
  }
});

initDb()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => {
    console.error("Could not connect to the database:", err.message);
    process.exit(1);
  });
