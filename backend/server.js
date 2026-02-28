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
import { spawn } from "child_process";      // For calling Python ML scripts
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

// GET /api/fifa-rankings - Load FIFA world rankings
app.get("/api/fifa-rankings", function (req, res) {
  try {
    var filePath = path.join(__dirname, "data", "fifa_rankings_2026.json");
    var jsonData = fs.readFileSync(filePath, "utf8");
    var data = JSON.parse(jsonData);
    res.json(data);
  } catch (err) {
    console.error("Error loading FIFA rankings:", err);
    res.status(500).json({ error: "Failed to load FIFA rankings" });
  }
});

// GET /api/uefa-club-rankings - Load UEFA club coefficient rankings
app.get("/api/uefa-club-rankings", function (req, res) {
  try {
    var filePath = path.join(__dirname, "data", "uefa_club_rankings_2026.json");
    var jsonData = fs.readFileSync(filePath, "utf8");
    var data = JSON.parse(jsonData);
    res.json(data);
  } catch (err) {
    console.error("Error loading UEFA rankings:", err);
    res.status(500).json({ error: "Failed to load UEFA club rankings" });
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

// ========================================
// PLAYER INSIGHTS ROUTES (NEW)
// ========================================
// These endpoints serve the mock player and team data
// used by the Player Insights page on the frontend.

// GET /api/insights/players - Load 200 mock players for insights page
app.get("/api/insights/players", (req, res) => {
  try {
    const filePath = path.join(__dirname, "data", "mockPlayers.json");
    const jsonData = fs.readFileSync(filePath, "utf8");
    const players = JSON.parse(jsonData);
    res.json(players);
  } catch (err) {
    console.error("Error loading mockPlayers.json:", err);
    res.status(500).json({ error: "Failed to load mock player data" });
  }
});

// GET /api/insights/teams - Load 20 mock teams for insights page
app.get("/api/insights/teams", (req, res) => {
  try {
    const filePath = path.join(__dirname, "data", "mockTeams.json");
    const jsonData = fs.readFileSync(filePath, "utf8");
    const teams = JSON.parse(jsonData);
    res.json(teams);
  } catch (err) {
    console.error("Error loading mockTeams.json:", err);
    res.status(500).json({ error: "Failed to load mock team data" });
  }
});


// ========================================
// POST /api/predict-match - Predict match outcome
// ========================================
// Uses a weighted formula to predict who wins.
//
// THE PREDICTION MODEL:
// Step 1: Get league weight for each team
// Step 2: Calculate attack strength = (attack / 100) * league weight
// Step 3: Calculate defense weakness = 1 - (defense / 100)
// Step 4: Expected goals = attack strength * opponent defense weakness * 2.7
// Step 5: Apply form bonus (form / 100 gives 0-1 multiplier)
// Step 6: Apply home advantage to Team A (+10%)
// Step 7: Calculate win/draw/loss percentages
// Step 8: Predict final score by rounding expected goals
//
app.post("/api/predict-match", function (req, res) {
  var teamA = req.body.teamA;
  var teamB = req.body.teamB;

  if (!teamA || !teamB) {
    return res.status(400).json({ error: "Teams required" });
  }

  // ========================================
  // STEP 1: League weights
  // ========================================
  // Harder leagues get a higher weight (max 1.0)
  // This means teams from harder leagues are considered stronger
  function getLeagueWeight(league) {
    if (league === "Premier League") return 1.0;
    if (league === "La Liga") return 0.95;
    if (league === "Bundesliga") return 0.9;
    if (league === "Serie A") return 0.9;
    if (league === "Ligue 1") return 0.85;
    if (league === "Saudi Pro League") return 0.7;
    return 0.8;
  }

  var leagueWeightA = getLeagueWeight(teamA.league);
  var leagueWeightB = getLeagueWeight(teamB.league);

  // ========================================
  // STEP 2: Attack strength (0 to 1 scale)
  // ========================================
  // Divide attack rating by 100 to get a 0-1 number
  // Then multiply by league weight
  var attackStrengthA = (teamA.attack / 100) * leagueWeightA;
  var attackStrengthB = (teamB.attack / 100) * leagueWeightB;

  // ========================================
  // STEP 3: Defense weakness (0 to 1 scale)
  // ========================================
  // A defense of 90/100 means weakness is 0.10 (very strong defense)
  // A defense of 60/100 means weakness is 0.40 (weak defense)
  var defenseWeaknessA = 1 - (teamA.defense / 100);
  var defenseWeaknessB = 1 - (teamB.defense / 100);

  // ========================================
  // STEP 4: Expected goals
  // ========================================
  // Average goals per match in football is about 2.7
  // Team A expected goals = A's attack * B's defense weakness * average
  // This is a simplified version of the Poisson model used in real football
  var avgGoals = 2.7;
  var expectedGoalsA = attackStrengthA * defenseWeaknessB * avgGoals;
  var expectedGoalsB = attackStrengthB * defenseWeaknessA * avgGoals;

  // ========================================
  // STEP 5: Apply form bonus
  // ========================================
  // Form is 0-100. We convert to a multiplier between 0.9 and 1.1
  // Good form (80+) boosts expected goals, bad form (<50) reduces them
  var formBonusA = 0.9 + ((teamA.form || 75) / 100) * 0.2;
  var formBonusB = 0.9 + ((teamB.form || 75) / 100) * 0.2;
  expectedGoalsA = expectedGoalsA * formBonusA;
  expectedGoalsB = expectedGoalsB * formBonusB;

  // ========================================
  // STEP 6: Home advantage
  // ========================================
  // Team A is the "home" team and gets a 10% boost
  // In real football, home teams win about 46% of the time
  var homeBoost = 1.10;
  expectedGoalsA = expectedGoalsA * homeBoost;

  // ========================================
  // STEP 7: Calculate win/draw/loss percentages
  // ========================================
  // Based on the difference in expected goals
  var totalExpected = expectedGoalsA + expectedGoalsB;
  var rawWinA = 0;
  var rawDraw = 0;
  var rawWinB = 0;

  if (totalExpected > 0) {
    // The bigger the gap in expected goals, the higher the win %
    var ratio = expectedGoalsA / totalExpected;
    rawWinA = ratio * 80;            // Scale to max ~80%
    rawWinB = (1 - ratio) * 80;     // The rest goes to team B
    rawDraw = 100 - rawWinA - rawWinB;  // What's left is draw chance

    // Make sure draw is at least 10% and at most 35%
    if (rawDraw < 10) rawDraw = 10;
    if (rawDraw > 35) rawDraw = 35;

    // Recalculate so everything adds up to 100%
    var remaining = 100 - rawDraw;
    var winRatio = rawWinA / (rawWinA + rawWinB);
    rawWinA = remaining * winRatio;
    rawWinB = remaining * (1 - winRatio);
  } else {
    rawWinA = 33;
    rawDraw = 34;
    rawWinB = 33;
  }

  // Round to 1 decimal place
  var winPercentA = Math.round(rawWinA * 10) / 10;
  var drawPercent = Math.round(rawDraw * 10) / 10;
  var winPercentB = Math.round(rawWinB * 10) / 10;

  // ========================================
  // STEP 8: Predicted score
  // ========================================
  // Round expected goals to nearest whole number
  var predictedScoreA = Math.round(expectedGoalsA);
  var predictedScoreB = Math.round(expectedGoalsB);

  // Make sure at least 0 goals
  if (predictedScoreA < 0) predictedScoreA = 0;
  if (predictedScoreB < 0) predictedScoreB = 0;

  // ========================================
  // Determine the winner
  // ========================================
  var prediction = "Draw";
  if (winPercentA > winPercentB + 5) {
    prediction = teamA.name;
  } else if (winPercentB > winPercentA + 5) {
    prediction = teamB.name;
  }

  // ========================================
  // SEND THE RESPONSE
  // ========================================
  res.json({
    prediction: prediction,
    predictedScore: predictedScoreA + " - " + predictedScoreB,
    probabilities: {
      winA: winPercentA,
      draw: drawPercent,
      winB: winPercentB
    },
    expectedGoals: {
      teamA: Math.round(expectedGoalsA * 100) / 100,
      teamB: Math.round(expectedGoalsB * 100) / 100
    },
    breakdown: {
      leagueWeightA: leagueWeightA,
      leagueWeightB: leagueWeightB,
      attackStrengthA: Math.round(attackStrengthA * 1000) / 1000,
      attackStrengthB: Math.round(attackStrengthB * 1000) / 1000,
      defenseWeaknessA: Math.round(defenseWeaknessA * 1000) / 1000,
      defenseWeaknessB: Math.round(defenseWeaknessB * 1000) / 1000,
      formBonusA: Math.round(formBonusA * 1000) / 1000,
      formBonusB: Math.round(formBonusB * 1000) / 1000,
      homeBoost: homeBoost
    },
    teamA: { name: teamA.name, league: teamA.league, attack: teamA.attack, defense: teamA.defense, form: teamA.form },
    teamB: { name: teamB.name, league: teamB.league, attack: teamB.attack, defense: teamB.defense, form: teamB.form }
  });
});

// ========================================
// ML BALLON D'OR RANKING ENDPOINT
// ========================================
// POST /api/ballondor/ml-rank
// Accepts { players: [...] } where each player has ML feature fields.
// Spawns Python predict script, sends data via stdin, returns predictions.
app.post("/api/ballondor/ml-rank", (req, res) => {
  const players = req.body.players;

  // Validate input
  if (!players || !Array.isArray(players) || players.length === 0) {
    return res.status(400).json({ error: "Request body must contain a non-empty 'players' array" });
  }

  // Absolute path to the prediction script (works from any cwd)
  const scriptPath = path.resolve(__dirname, "ml", "predict_ballondor.py");
  const backendDir = path.resolve(__dirname);

  // Python command: try python3 first, then python (Windows often has only "python")
  const pythonCmds = process.platform === "win32" ? ["python", "py", "python3"] : ["python3", "python"];

  function trySpawn(index) {
    if (index >= pythonCmds.length) {
      return res.status(500).json({
        error: "Python not found. Install Python 3 and add it to PATH.",
        details: "Tried: " + pythonCmds.join(", "),
      });
    }

    const pythonCmd = pythonCmds[index];
    const child = spawn(pythonCmd, [scriptPath], {
      cwd: backendDir,
      timeout: 60000,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => { stdout += data.toString(); });
    child.stderr.on("data", (data) => { stderr += data.toString(); });

    const inputJSON = JSON.stringify({ players: players });
    child.stdin.write(inputJSON, "utf8", (err) => {
      if (err) console.error("stdin write error:", err);
    });
    child.stdin.end();

    child.on("close", (code, signal) => {
      let result;
      try {
        result = stdout ? JSON.parse(stdout) : null;
      } catch (_) {
        result = null;
      }

      if (code !== 0) {
        const details = (result && result.error) ? result.error : (stderr || stdout || "Exit code " + code).trim().substring(0, 800);
        console.error("Python ML script exit code:", code, "details:", details);
        return res.status(500).json({
          error: "ML prediction failed",
          details: details,
        });
      }

      if (result && result.error) {
        return res.status(500).json({ error: result.error, details: result.error });
      }
      if (result) {
        return res.json(result);
      }
      return res.status(500).json({
        error: "No output from ML script",
        details: stderr || "No stdout",
      });
    });

    child.on("error", (err) => {
      if (err.code === "ENOENT") {
        trySpawn(index + 1);
      } else {
        res.status(500).json({
          error: "Could not start Python",
          details: err.message,
        });
      }
    });
  }

  trySpawn(0);
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

// Step 3: Store chat messages per room (object with room id as key)
// Each room has its own array of messages. Messages are lost when server restarts.
// Room ids: "general", "ballon-dor", "transfers", "goat"
var CHAT_ROOM_IDS = ["general", "ballon-dor", "transfers", "goat"];
var chatMessages = {};
// Initialize empty array for each room
for (var r = 0; r < CHAT_ROOM_IDS.length; r++) {
  chatMessages[CHAT_ROOM_IDS[r]] = [];
}

// Step 4: Store last message time per user (for spam rate limiting)
// Format: { userId: timestamp }
let lastMessageTime = {};

// Step 5: List of banned words (simple array)
// Students can add more words here
// These words will be CENSORED (replaced with ***) in messages
// IMPORTANT: Add any inappropriate or offensive words here
const bannedWords = [
  // Slurs - Anti-Black
  "nigger", "nigga", "n1gger", "n1gga", "negro",
  // Slurs - Anti-Asian / East Asian
  "chink", "ch1nk", "gook", "chinky", "ching chong",
  "slant", "slanteye", "zipperhead", "jap",
  // Slurs - Anti-South Asian / Pakistani
  "paki", "p4ki", "curry muncher", "sandnigger", "towelhead",
  "raghead", "terrorist",
  // Slurs - Anti-White
  "cracker", "honky", "honkey", "redneck", "white trash",
  // Slurs - Anti-Hispanic
  "spic", "sp1c", "wetback", "beaner",
  // Slurs - Homophobic
  "faggot", "fag", "f4ggot", "dyke",
  // Slurs - Ableist
  "retard", "retarded",
  // Slurs - Transphobic
  "tranny",
  // Swear words
  "fuck", "f*ck", "fck", "fuk", "fucker", "fucking", "motherfucker",
  "shit", "sh1t", "bullshit",
  "bitch", "b1tch", "bitches",
  "ass", "asshole", "a$$hole",
  "damn", "damnit",
  "dick", "d1ck",
  "pussy", "p*ssy",
  "cunt", "c*nt",
  "whore", "wh0re",
  "slut",
  "bastard",
  "piss",
  "cock",
  // Hate and harassment
  "racist", "racism",
  "hate",
  "kys", "kill yourself",
  // Spam
  "spam",
  "inappropriate",
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

  // ========================================
  // HANDLE: User joins a chat room
  // ========================================
  // The client sends the room id (e.g. "general", "ballon-dor", "transfers", "goat")
  // We add the socket to that Socket.IO room and send that room's message history
  socket.on("join_room", function (roomId) {
    // Only allow known room ids (security: prevent arbitrary room names)
    if (CHAT_ROOM_IDS.indexOf(roomId) === -1) {
      roomId = "general";
    }
    // Leave the previous room if they were in one
    if (socket.currentRoom) {
      socket.leave(socket.currentRoom);
    }
    socket.join(roomId);
    socket.currentRoom = roomId;
    // Get this room's messages (empty array if none)
    var roomMessages = chatMessages[roomId] || [];
    socket.emit("chat_history", roomMessages);
  });

  // Client should emit "join_room" with a room id to get that room's history
  // (e.g. join_room("general") when the page loads)

  // ========================================
  // HANDLE: User sends a message
  // ========================================
  // Client sends { room: "general", text: "hello" } (or just room + text in one object)
  socket.on("send_message", async (payload) => {
    // Only logged-in users can send messages
    if (!socket.user) {
      socket.emit("error_message", "You must be logged in to send messages");
      return;
    }

    // Get room and text from payload (payload can be { room, text } or legacy plain string)
    var roomId = "general";
    var messageText = "";
    if (typeof payload === "string") {
      messageText = payload;
      roomId = socket.currentRoom || "general";
    } else if (payload && payload.text) {
      messageText = payload.text;
      roomId = payload.room || socket.currentRoom || "general";
    }
    if (CHAT_ROOM_IDS.indexOf(roomId) === -1) roomId = "general";

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

    // Add to this room's message array
    if (!chatMessages[roomId]) chatMessages[roomId] = [];
    chatMessages[roomId].push(newMessage);

    // Keep only last 50 messages per room (prevent memory overflow)
    if (chatMessages[roomId].length > 50) {
      chatMessages[roomId].shift(); // Remove oldest message
    }

    // BROADCAST: Send message only to users in this room
    // io.to(roomId).emit() sends only to sockets that joined that room
    io.to(roomId).emit("new_message", newMessage);

    console.log("💬 [" + roomId + "] Message from", socket.user.email + ":", messageText);
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
