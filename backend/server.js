// ========================================
// server.js - Express Backend API (UPDATED WITH AUTH)
// ========================================
// This backend server provides three main endpoints:
// 1. GET /api/teams - Returns teams from PostgreSQL database
// 2. GET /api/players - Returns players from JSON file
// 3. POST /api/predict-match - Predicts match winner based on team stats
// + AUTH SYSTEM ADDED: register, login, logout, me
// ========================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";   // <-- Needed for reading JWT cookies
import authRoutes from "./auth/authRoutes.js"; // <-- Auth routes folder
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();
const { Pool } = pkg;

const app = express();

// ========================================
// MIDDLEWARE (UPDATED)
// ========================================

// Allow frontend to send cookies to backend
app.use(
  cors({
    origin: "http://localhost:3000", // Your React app
    credentials: true,               // Allow sending cookies
  })
);

app.use(express.json());
app.use(cookieParser()); // <-- Needed for login, logout, /me

// ========================================
// DATABASE CONNECTION
// ========================================
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "statsphere",
  password: process.env.DB_PASS || "admin123",
  port: 5432,
});

// Fix __dirname for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// AUTH ROUTES (NEW)
// ========================================
app.use("/auth", authRoutes);
// /auth/register
// /auth/login
// /auth/logout
// /auth/me

// ========================================
// EXISTING API ROUTES
// ========================================

// GET /api/teams - Fetch all teams
app.get("/api/teams", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM teams");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// GET /api/players - Load and return all players from JSON file
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

// GET /api/prediction-teams - Load prediction teams JSON
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

// GET /api/live-matches - Load fake live matches
app.get("/api/live-matches", (req, res) => {
  try {
    const filePath = path.join(__dirname, "data", "liveMatches.json");
    const jsonData = fs.readFileSync(filePath, "utf8");
    const matches = JSON.parse(jsonData);
    res.json(matches);
  } catch (err) {
    console.error("Error loading liveMatches.json:", err);
    res.status(500).json({ error: "Failed to load live matches" });
  }
});


// POST /api/predict-match - Predict match outcome
app.post("/api/predict-match", (req, res) => {
  const { teamA, teamB } = req.body;

  if (!teamA || !teamB) {
    return res.status(400).json({ error: "Teams required" });
  }

  const scoreA = teamA.attack * 0.4 + teamA.defense * 0.3 + teamA.form * 5;
  const scoreB = teamB.attack * 0.4 + teamB.defense * 0.3 + teamB.form * 5;

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

// ========================================
// START SERVER
// ========================================
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
