// ========================================
// modRoutes.js - Moderation API Routes
// ========================================
// This file handles moderation features:
// POST /api/mod/report      - Report a bad message
// GET  /api/mod/reports     - See all reports (admin only)
// POST /api/mod/ban-user    - Ban a user (admin only)
// POST /api/mod/unban-user  - Unban a user (admin only)
// ========================================

import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../db.js";

dotenv.config();
var router = express.Router();

// ========================================
// HELPER: Check if a user is an admin
// ========================================
// Admins are set in the .env file like this:
//   ADMIN_EMAILS="admin@example.com,mod@example.com"
function isAdmin(userEmail) {
  var adminEmails = process.env.ADMIN_EMAILS || "";
  // Split the string by comma to get an array of emails
  var adminList = adminEmails.split(",");
  // Check each admin email
  for (var i = 0; i < adminList.length; i++) {
    if (adminList[i].trim() === userEmail) {
      return true;
    }
  }
  return false;
}

// ========================================
// HELPER: Get user info from JWT token
// ========================================
// Looks for the token in cookies first, then in the Authorization header
function getUserFromToken(req) {
  try {
    // Try cookie first
    var token = req.cookies.token;

    // If no cookie, check the Authorization header
    if (!token && req.headers.authorization) {
      var parts = req.headers.authorization.split(" ");
      if (parts[0] === "Bearer" && parts[1]) {
        token = parts[1];
      }
    }

    if (!token) {
      return null;
    }

    // Verify the token and return the user data inside it
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

// ========================================
// MIDDLEWARE: Check if user is logged in
// ========================================
// Middleware runs BEFORE the route handler.
// If the user is logged in, we call next() to continue.
// If not, we send back a 401 error.
function requireAuth(req, res, next) {
  var user = getUserFromToken(req);
  if (!user) {
    return res.status(401).json({ error: "You must be logged in" });
  }
  req.user = user;
  next();
}

// ========================================
// MIDDLEWARE: Check if user is admin
// ========================================
function requireAdmin(req, res, next) {
  var user = getUserFromToken(req);
  if (!user) {
    return res.status(401).json({ error: "You must be logged in" });
  }

  // Look up the user's email in the database
  pool.query("SELECT email FROM users WHERE id = $1", [user.id])
    .then(function (result) {
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "User not found" });
      }

      var userEmail = result.rows[0].email;

      // Check if their email is in the admin list
      if (!isAdmin(userEmail)) {
        return res.status(403).json({ error: "Admin access required" });
      }

      req.user = user;
      req.userEmail = userEmail;
      next();
    })
    .catch(function (err) {
      console.error("Error checking admin:", err);
      res.status(500).json({ error: "Server error" });
    });
}

// ========================================
// POST /api/mod/report - Report a message
// ========================================
// Any logged-in user can report a message.
// The report is saved to the database.
//
// WHAT HAPPENS:
// 1. First we TRY to insert the report into the database
// 2. If the table doesn't exist, we CREATE it and try again
// 3. This way it works even if the migration was never run
router.post("/report", requireAuth, async function (req, res) {
  try {
    var messageId = req.body.messageId;
    var messageText = req.body.messageText;
    var reason = req.body.reason;

    // Check the user gave a reason
    if (!reason || reason.trim() === "") {
      return res.status(400).json({ error: "Please provide a reason for the report" });
    }

    // The INSERT query we want to run
    var insertQuery = "INSERT INTO reported_messages (reporter_user_id, message_id, message_text, reason) VALUES ($1, $2, $3, $4) RETURNING *";
    var insertValues = [req.user.id, messageId || null, messageText || "", reason.trim()];

    var result;

    try {
      // Try to insert the report directly
      result = await pool.query(insertQuery, insertValues);
    } catch (insertError) {
      // 42P01 = table doesn't exist
      // 42703 = column doesn't exist (table has wrong columns)
      if (insertError.code === "42P01" || insertError.code === "42703") {
        console.log("reported_messages table missing or has wrong columns, recreating...");

        // Drop the old table (if it exists with wrong columns)
        await pool.query("DROP TABLE IF EXISTS reported_messages");

        // Create fresh table with the correct columns
        await pool.query(
          "CREATE TABLE reported_messages (" +
          "  id SERIAL PRIMARY KEY," +
          "  reporter_user_id INTEGER NOT NULL," +
          "  message_id BIGINT," +
          "  message_text TEXT," +
          "  reason TEXT NOT NULL," +
          "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
          ")"
        );

        // Try the insert again now that the table is correct
        result = await pool.query(insertQuery, insertValues);
      } else {
        throw insertError;
      }
    }

    res.json({
      success: true,
      message: "Report submitted successfully",
      report: result.rows[0]
    });
  } catch (err) {
    console.error("Error reporting message:", err.message || err);
    res.status(500).json({ error: "Server error: " + (err.message || "Unknown error") });
  }
});

// ========================================
// GET /api/mod/reports - See all reports (admin only)
// ========================================
router.get("/reports", requireAdmin, async function (req, res) {
  try {
    var result = await pool.query(
      "SELECT rm.id, rm.message_id, rm.message_text, rm.reason, rm.created_at, " +
      "u.name as reporter_name, u.email as reporter_email " +
      "FROM reported_messages rm " +
      "JOIN users u ON rm.reporter_user_id = u.id " +
      "ORDER BY rm.created_at DESC " +
      "LIMIT 50"
    );
    res.json({ reports: result.rows });
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================================
// POST /api/mod/ban-user - Ban a user (admin only)
// ========================================
router.post("/ban-user", requireAdmin, async function (req, res) {
  try {
    var userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    await pool.query("UPDATE users SET is_banned = true WHERE id = $1", [userId]);
    res.json({ success: true, message: "User banned successfully" });
  } catch (err) {
    console.error("Error banning user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================================
// POST /api/mod/unban-user - Unban a user (admin only)
// ========================================
router.post("/unban-user", requireAdmin, async function (req, res) {
  try {
    var userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    await pool.query("UPDATE users SET is_banned = false WHERE id = $1", [userId]);
    res.json({ success: true, message: "User unbanned successfully" });
  } catch (err) {
    console.error("Error unbanning user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
