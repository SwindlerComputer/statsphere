// ========================================
// server.js - Express Backend API (WITH AUTH + WEBSOCKETS)
// ========================================
// This backend server provides:
// 1. REST API endpoints for teams, players, predictions
// 2. Authentication system (register, login, logout)
// 3. WebSocket chat using Socket.IO
//
// WHAT ARE WEBSOCKETS?
// - Normal HTTP: Client asks server, server responds, connection closes
// - WebSockets: Connection stays open, server can push messages to client anytime
// - Perfect for real-time features like chat, live scores, notifications
// ========================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";
import authRoutes from "./auth/authRoutes.js";
import footballApiRoutes from "./api/footballApiRoutes.js";
import { fileURLToPath } from "url";
import { createServer } from "http";        // Needed for Socket.IO
import { Server } from "socket.io";         // Socket.IO library
import jwt from "jsonwebtoken";             // To verify user tokens
import cookie from "cookie";                // To parse cookies from socket

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
  password: String(process.env.DB_PASS || "admin123"),
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
// FOOTBALL API ROUTES (RapidAPI Integration)
// ========================================
app.use("/api/football", footballApiRoutes);
// /api/football/standings - Get league standings
// /api/football/fixtures - Get match fixtures

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
// WEBSOCKET SETUP (SOCKET.IO)
// ========================================
// Instead of app.listen(), we create an HTTP server and attach Socket.IO to it.
// This lets us handle both REST API requests AND WebSocket connections.

// Step 1: Create HTTP server from Express app
const httpServer = createServer(app);

// Step 2: Create Socket.IO server attached to HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",  // Allow frontend to connect
    credentials: true                  // Allow cookies
  }
});

// Step 3: Store chat messages in memory (array)
// Note: Messages are lost when server restarts (no database yet)
let chatMessages = [];

// ========================================
// SOCKET.IO CONNECTION HANDLER
// ========================================
// This runs every time a user connects via WebSocket

io.on("connection", async (socket) => {
  console.log("🔌 New socket connected:", socket.id);

  // Try to get user info from JWT cookie
  let user = null;
  
  // Parse cookies from the socket handshake
  if (socket.handshake.headers.cookie) {
    let cookies = cookie.parse(socket.handshake.headers.cookie);
    let token = cookies.token;
    
    // If token exists, verify it and get user name from database
    if (token) {
      try {
        let decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user name from database
        let result = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [decoded.id]);
        if (result.rows.length > 0) {
          user = result.rows[0]; // { id, name, email }
        }
        
        console.log("✅ Authenticated user:", user.name);
      } catch (err) {
        console.log("❌ Invalid token, user is guest");
      }
    }
  }

  // Store user info on the socket object
  socket.user = user;

  // Send existing messages to the new user
  socket.emit("chat_history", chatMessages);

  // ========================================
  // HANDLE: User sends a message
  // ========================================
  socket.on("send_message", (messageText) => {
    // Only logged-in users can send messages
    if (!socket.user) {
      socket.emit("error_message", "You must be logged in to send messages");
      return;
    }

    // Create message object
    let newMessage = {
      id: Date.now(),                    // Unique ID using timestamp
      text: messageText,                 // The message content
      userId: socket.user.id,            // Who sent it
      userName: socket.user.name,        // Username to display
      userEmail: socket.user.email,      // Email as backup
      timestamp: new Date().toISOString() // When it was sent
    };

    // Add to messages array
    chatMessages.push(newMessage);

    // Keep only last 50 messages (prevent memory overflow)
    if (chatMessages.length > 50) {
      chatMessages.shift(); // Remove oldest message
    }

    // BROADCAST: Send message to ALL connected users
    // io.emit() sends to everyone, socket.emit() sends to just one user
    io.emit("new_message", newMessage);

    console.log("💬 Message from", socket.user.email + ":", messageText);
  });

  // ========================================
  // HANDLE: User disconnects
  // ========================================
  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

// ========================================
// START SERVER
// ========================================
const PORT = 5000;
httpServer.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
