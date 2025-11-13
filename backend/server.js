// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------------------------------------
//                       ROUTES
// -------------------------------------------------------------

// ✅ TEAMS (PostgreSQL)
app.get("/api/teams", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM teams");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ✅ PLAYERS (Load from backend/data/players.json)
app.get("/api/players", (req, res) => {
  try {
    const filePath = path.join(__dirname, "data", "players.json");
    const jsonData = fs.readFileSync(filePath, "utf8");
    const players = JSON.parse(jsonData);
    res.json(players);
  } catch (err) {
    console.error("Error loading players.json:", err);
    res.status(500).json({ error: "Failed to load player data" });
  }
});

// ✅ PREDICTION TEAMS (Load from backend/data/predictionTeams.json)
app.get("/api/prediction-teams", (req, res) => {
  try {
    const filePath = path.join(__dirname, "data", "predictionTeams.json");
    const jsonData = fs.readFileSync(filePath, "utf8");
    const teams = JSON.parse(jsonData);
    res.json(teams);
  } catch (err) {
    console.error("Error loading predictionTeams.json:", err);
    res.status(500).json({ error: "Failed to load prediction teams" });
  }
});

// ✅ MOCK MATCH PREDICTOR
app.post("/api/predict-match", (req, res) => {
  const { teamA, teamB } = req.body;

  if (!teamA || !teamB) {
    return res.status(400).json({ error: "Teams required" });
  }

  // Simple weighted scoring model (rule-based)
  const scoreA =
    teamA.attack * 0.4 + teamA.defense * 0.3 + teamA.form * 5;

  const scoreB =
    teamB.attack * 0.4 + teamB.defense * 0.3 + teamB.form * 5;

  let winner = "Draw";
  if (scoreA > scoreB) winner = teamA.name;
  if (scoreB > scoreA) winner = teamB.name;

  res.json({
    prediction: winner,
    confidence: Math.abs(scoreA - scoreB).toFixed(1) + "%",
    details: {
      teamA_score: scoreA.toFixed(1),
      teamB_score: scoreB.toFixed(1),
    },
  });
});

// -------------------------------------------------------------
//                      START SERVER
// -------------------------------------------------------------
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
