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
import fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";
import authRoutes from "./auth/authRoutes.js";
import footballApiRoutes from "./api/footballApiRoutes.js";
import modRoutes from "./api/modRoutes.js";
import { fileURLToPath } from "url";
import { createServer } from "http";        // Needed for Socket.IO
import { Server } from "socket.io";         // Socket.IO library
import jwt from "jsonwebtoken";             // To verify user tokens
import cookie from "cookie";                // To parse cookies from socket
import pool from "./db.js";                 // Shared database connection

// Load environment variables
dotenv.config();

const app = express();

// ========================================
// MIDDLEWARE (UPDATED)
// ========================================

// Allow frontend to send cookies to backend
// FRONTEND_URL comes from .env:
//   - Local development: FRONTEND_URL=http://localhost:3000
//   - Production (Render): FRONTEND_URL=https://your-app.onrender.com
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // Allow sending cookies
  })
);

app.use(express.json());
app.use(cookieParser()); // <-- Needed for login, logout, /me

// ========================================
// DATABASE CONNECTION
// ========================================
// Pool is imported from db.js (supports both Supabase and local Postgres)
// See db.js for connection setup details

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
// MODERATION ROUTES
// ========================================
app.use("/api/mod", modRoutes);
// /api/mod/report - Report a message
// /api/mod/reports - Get all reports (admin only)
// /api/mod/ban-user - Ban a user (admin only)
// /api/mod/unban-user - Unban a user (admin only)

// ========================================
// HEALTH CHECK (for verifying deploys on Render)
// ========================================
// Visit: https://your-backend.onrender.com/api/health
// Should return: { ok: true, service: "statsphere-backend" }
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "statsphere-backend" });
});

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
// Uses same FRONTEND_URL as Express CORS so WebSocket works in production too
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true // Allow cookies
  }
});

// Step 3: Store chat messages in memory (array)
// Note: Messages are lost when server restarts (no database yet)
let chatMessages = [];

// Step 4: Store last message time per user (for spam rate limiting)
// Format: { userId: timestamp }
let lastMessageTime = {};

// Step 5: List of banned words (simple array)
// Students can add more words here
// These words will be CENSORED (replaced with ***) in messages
// IMPORTANT: Add any inappropriate or offensive words here
const bannedWords = [
  "spam",
  "badword", 
  "inappropriate",
  "hate",
  "racist",
  "racism",
  // Add more words as needed - these are examples
  // You can add more inappropriate words here
];

// ========================================
// CENSOR FUNCTION
// ========================================
// Replaces banned words in a message with asterisks (*)
// Example: "You are a racist" → "You are a ******"
// This is case-insensitive but preserves the original casing of non-banned parts
function censorMessage(text) {
  let censoredText = text;

  for (let i = 0; i < bannedWords.length; i++) {
    const bannedWord = bannedWords[i];
    // Create a case-insensitive regex to find ALL occurrences of the banned word
    // "gi" = global (all matches) + case-insensitive
    const regex = new RegExp(bannedWord, "gi");
    // Replace each match with the same number of asterisks
    censoredText = censoredText.replace(regex, function(match) {
      return "*".repeat(match.length);
    });
  }

  return censoredText;
}

// ========================================
// SOCKET.IO CONNECTION HANDLER
// ========================================
// This runs every time a user connects via WebSocket

io.on("connection", async (socket) => {
  console.log("🔌 New socket connected:", socket.id);

  // Try to get user info from JWT cookie or auth token
  let user = null;
  
  // Step 1: Try to get token from cookie
  let token = null;
  if (socket.handshake.headers.cookie) {
    let cookies = cookie.parse(socket.handshake.headers.cookie);
    token = cookies.token;
  }

  // Step 2: If no cookie, check auth token (for incognito / cross-site)
  if (!token && socket.handshake.auth && socket.handshake.auth.token) {
    token = socket.handshake.auth.token;
  }
  
  // If token exists, verify it and get user name from database
  if (token) {
      try {
        let decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user name and ban status from database
        // Note: is_banned column might not exist if migration hasn't been run
        let result;
        try {
          result = await pool.query("SELECT id, name, email, is_banned FROM users WHERE id = $1", [decoded.id]);
        } catch (dbError) {
          // If is_banned column doesn't exist, get user without it
          if (dbError.message && dbError.message.includes("is_banned")) {
            console.log("⚠️ is_banned column not found, getting user without ban status");
            result = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [decoded.id]);
            // Add is_banned as false by default
            if (result.rows.length > 0) {
              result.rows[0].is_banned = false;
            }
          } else {
            throw dbError; // Re-throw if it's a different error
          }
        }
        
        if (result.rows.length > 0) {
          user = result.rows[0]; // { id, name, email, is_banned }
          console.log("✅ Authenticated user:", user.name);
        }
      } catch (err) {
        console.log("❌ Invalid token, user is guest");
        console.log("❌ Error:", err.message);
      }
  }

  // Store user info on the socket object
  socket.user = user;

  // Send existing messages to the new user
  socket.emit("chat_history", chatMessages);

  // ========================================
  // HANDLE: User sends a message
  // ========================================
  socket.on("send_message", async (messageText) => {
    // Only logged-in users can send messages
    if (!socket.user) {
      socket.emit("error_message", "You must be logged in to send messages");
      return;
    }

    // ========================================
    // VALIDATION: Check if user is banned
    // ========================================
    // Get latest ban status from database
    try {
      let userResult = await pool.query("SELECT is_banned FROM users WHERE id = $1", [socket.user.id]);
      if (userResult.rows.length > 0 && userResult.rows[0].is_banned === true) {
        socket.emit("error_message", "You are banned from sending messages");
        return;
      }
    } catch (dbError) {
      // If is_banned column doesn't exist, skip ban check
      if (!dbError.message || !dbError.message.includes("is_banned")) {
        console.error("Database error checking ban status:", dbError);
      }
    }

    // ========================================
    // VALIDATION: Check if message is empty or only whitespace
    // ========================================
    if (!messageText || messageText.trim() === "") {
      socket.emit("error_message", "Message cannot be empty");
      return;
    }

    // ========================================
    // VALIDATION: Check message length (max 200 characters)
    // ========================================
    if (messageText.length > 200) {
      socket.emit("error_message", "Message is too long (max 200 characters)");
      return;
    }

    // ========================================
    // CENSOR: Replace banned words with asterisks
    // ========================================
    // Instead of blocking the message, we censor any banned words
    // Example: "You are a racist" → "You are a ******"
    const censoredText = censorMessage(messageText.trim());

    // Log if any words were censored (for moderation tracking)
    if (censoredText !== messageText.trim()) {
      console.log("🚫 Censored message from", socket.user.email);
      console.log("   Original:", messageText.trim());
      console.log("   Censored:", censoredText);
    }

    // ========================================
    // VALIDATION: Spam rate limit (1 message every 2 seconds)
    // ========================================
    const userId = socket.user.id;
    const now = Date.now();
    const lastTime = lastMessageTime[userId] || 0;
    const timeSinceLastMessage = now - lastTime;
    
    // 2000 milliseconds = 2 seconds
    if (timeSinceLastMessage < 2000) {
      socket.emit("error_message", "Please wait 2 seconds before sending another message");
      return;
    }
    
    // Update last message time
    lastMessageTime[userId] = now;

    // ========================================
    // ALL VALIDATIONS PASSED - Create message
    // ========================================
    let newMessage = {
      id: Date.now(),                    // Unique ID using timestamp
      text: censoredText,               // The censored message content
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
// Render sets process.env.PORT automatically
// Locally it falls back to 5000
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
