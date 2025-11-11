// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection setup
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "statsphere",
  password: process.env.DB_PASS || "admin123",
  port: 5432,
});

// ---- ROUTES ----

// Teams route (connected to Postgres)
app.get("/api/teams", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM teams");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Players route (sample data for interim)
app.get("/api/players", (req, res) => {
  const players = [
    { id: 1, name: "Cristiano Ronaldo", team: "Al Nassr", position: "Forward", goals: 22, assists: 7 },
    { id: 2, name: "Kylian Mbappé", team: "PSG", position: "Forward", goals: 18, assists: 10 },
    { id: 3, name: "Jude Bellingham", team: "Real Madrid", position: "Midfielder", goals: 12, assists: 8 },
    { id: 4, name: "Kevin De Bruyne", team: "Man City", position: "Midfielder", goals: 5, assists: 15 },
    { id: 5, name: "Virgil van Dijk", team: "Liverpool", position: "Defender", goals: 4, assists: 1 }
  ];
  res.json(players);
});

// ---- SERVER START ----
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
