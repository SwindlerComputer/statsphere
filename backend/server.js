// ========================================
// server.js - Express Backend API
// ========================================
// This backend server provides three main endpoints:
// 1. GET /api/teams - Returns teams from PostgreSQL database
// 2. GET /api/players - Returns players from JSON file
// 3. POST /api/predict-match - Predicts match winner based on team stats

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env file
dotenv.config();
const { Pool } = pkg;

const app = express();
// Middleware: Allow requests from frontend and parse JSON
app.use(cors());
app.use(express.json());

// Database connection setup - Create a connection pool to PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "statsphere",
  password: process.env.DB_PASS || "admin123",
  port: 5432,
});

// Fix __dirname for ES Modules (needed because we use "import" not "require")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// API ROUTES
// ========================================

// GET /api/teams - Fetch all teams from PostgreSQL database
// Returns: Array of team objects with id, name, league, country
app.get("/api/teams", async (req, res) => {
  try {
    // Execute SQL query to get all teams
    const result = await pool.query("SELECT * FROM teams");
    // Send the rows as JSON response
    res.json(result.rows);
  } catch (err) {
    // If error occurs, log it and send error response
    console.error(err);
    res.status(500).send("Server error");
  }
});

// GET /api/players - Load and return all players from JSON file
// Returns: Array of player objects with name, team, position, stats
app.get("/api/players", (req, res) => {
  try {
    // Build the file path: __dirname + /data/players.json
    const filePath = path.join(__dirname, "data", "players.json");
    // Read the JSON file as a string
    const jsonData = fs.readFileSync(filePath, "utf8");
    // Parse the JSON string into a JavaScript array
    const players = JSON.parse(jsonData);
    // Send players array as response
    res.json(players);
  } catch (err) {
    // If file read or parse fails, log error and send error response
    console.error("Error loading players.json:", err);
    res.status(500).json({ error: "Failed to load player data" });
  }
});

// GET /api/prediction-teams - Load and return teams for the predictor
// Returns: Array of team objects with attack, defense, form stats for prediction
app.get("/api/prediction-teams", (req, res) => {
  try {
    // Build the file path: __dirname + /data/predictionTeams.json
    const filePath = path.join(__dirname, "data", "predictionTeams.json");
    // Read the JSON file as a string
    const jsonData = fs.readFileSync(filePath, "utf8");
    // Parse the JSON string into a JavaScript array
    const teams = JSON.parse(jsonData);
    // Send teams array as response
    res.json(teams);
  } catch (err) {
    // If file read or parse fails, log error and send error response
    console.error("Error loading predictionTeams.json:", err);
    res.status(500).json({ error: "Failed to load prediction teams" });
  }
});

// POST /api/predict-match - Predict match winner based on team stats
// Receives: { teamA: {...}, teamB: {...} } in request body
// Returns: { prediction: "Team Name", confidence: "X.X%" }
app.post("/api/predict-match", (req, res) => {
  // Extract both team objects from request body
  const { teamA, teamB } = req.body;

  // Validate that both teams are provided
  if (!teamA || !teamB) {
    return res.status(400).json({ error: "Teams required" });
  }

  // Simple weighted scoring model: combines attack, defense, and form
  // Higher scores = stronger team
  // Formula: (attack * 0.4) + (defense * 0.3) + (form * 5)
  //   - Attack weighted 40%: most important
  //   - Defense weighted 30%: moderately important
  //   - Form weighted 5 per point: small bonus
  const scoreA =
    teamA.attack * 0.4 + teamA.defense * 0.3 + teamA.form * 5;

  const scoreB =
    teamB.attack * 0.4 + teamB.defense * 0.3 + teamB.form * 5;

  // Determine winner by comparing scores
  let winner = "Draw";
  if (scoreA > scoreB) winner = teamA.name;
  if (scoreB > scoreA) winner = teamB.name;

  // Send prediction response back to frontend
  res.json({
    prediction: winner,
    confidence: Math.abs(scoreA - scoreB).toFixed(1) + "%",
    details: {
      teamA_score: scoreA.toFixed(1),
      teamB_score: scoreB.toFixed(1),
    },
  });
});

// ========================================
// START SERVER
// ========================================
// Start the Express server on port 5000
// Once running, all routes above become available at http://localhost:5000
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
