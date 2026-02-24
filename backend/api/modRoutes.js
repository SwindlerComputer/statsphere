// ========================================
// modRoutes.js - Moderation API Routes
// ========================================
// This file handles moderation features:
// - View reports
// - Ban/unban users
// - Report messages
//
// All admin endpoints require admin email in .env
// ========================================

import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../db.js"; // Shared database connection (supports Supabase + local)

dotenv.config();
const router = express.Router();

// ========================================
// HELPER FUNCTION: Check if user is admin
// ========================================
// Admins are defined in .env as: ADMIN_EMAILS="email1@example.com,email2@example.com"
function isAdmin(userEmail) {
  // Get admin emails from .env
  const adminEmails = process.env.ADMIN_EMAILS || "";
  
  // Split by comma and trim each email
  const adminList = adminEmails.split(",").map(email => email.trim());
  
  // Check if user's email is in the list
  return adminList.includes(userEmail);
}

// ========================================
// HELPER FUNCTION: Get user from JWT token
// ========================================
function getUserFromToken(req) {
  try {
    // Try to get token from cookie first
    let token = req.cookies.token;

    // If no cookie, check Authorization header (for incognito / cross-site)
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts[0] === "Bearer" && parts[1]) {
        token = parts[1];
      }
    }

    if (!token) {
      return null;
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

// ========================================
// MIDDLEWARE: Check if user is logged in
// ========================================
function requireAuth(req, res, next) {
  const user = getUserFromToken(req);
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
  const user = getUserFromToken(req);
  if (!user) {
    return res.status(401).json({ error: "You must be logged in" });
  }
  
  // Get user email from database
  pool.query("SELECT email FROM users WHERE id = $1", [user.id])
    .then(result => {
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "User not found" });
      }
      
      const userEmail = result.rows[0].email;
      
      // Check if admin
      if (!isAdmin(userEmail)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      req.user = user;
      req.userEmail = userEmail;
      next();
    })
    .catch(err => {
      console.error("Error checking admin:", err);
      res.status(500).json({ error: "Server error" });
    });
}

// ========================================
// POST /api/mod/report
// ========================================
// Report a message (any logged-in user can report)
router.post("/report", requireAuth, async (req, res) => {
  try {
    var { messageId, messageText, reason } = req.body;
    
    if (!reason || reason.trim() === "") {
      return res.status(400).json({ error: "Please provide a reason for the report" });
    }

    // Try to create the table if it doesn't exist yet
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reported_messages (
        id SERIAL PRIMARY KEY,
        reporter_user_id INTEGER NOT NULL,
        message_id BIGINT,
        message_text TEXT,
        reason TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert report into database
    var result = await pool.query(
      "INSERT INTO reported_messages (reporter_user_id, message_id, message_text, reason) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.user.id, messageId || null, messageText || "", reason.trim()]
    );
    
    res.json({ 
      success: true, 
      message: "Report submitted successfully",
      report: result.rows[0]
    });
  } catch (err) {
    console.error("Error reporting message:", err);
    res.status(500).json({ error: "Failed to submit report. Please try again." });
  }
});

// ========================================
// GET /api/mod/reports
// ========================================
// Get all reports (admin only)
router.get("/reports", requireAdmin, async (req, res) => {
  try {
    // Get all reports, ordered by newest first
    const result = await pool.query(
      `SELECT 
        rm.id,
        rm.message_id,
        rm.message_text,
        rm.reason,
        rm.created_at,
        u.name as reporter_name,
        u.email as reporter_email
      FROM reported_messages rm
      JOIN users u ON rm.reporter_user_id = u.id
      ORDER BY rm.created_at DESC
      LIMIT 50`
    );
    
    res.json({ reports: result.rows });
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================================
// POST /api/mod/ban-user
// ========================================
// Ban a user (admin only)
router.post("/ban-user", requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    // Update user's is_banned to true
    await pool.query(
      "UPDATE users SET is_banned = true WHERE id = $1",
      [userId]
    );
    
    res.json({ 
      success: true, 
      message: "User banned successfully" 
    });
  } catch (err) {
    console.error("Error banning user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================================
// POST /api/mod/unban-user
// ========================================
// Unban a user (admin only)
router.post("/unban-user", requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    // Update user's is_banned to false
    await pool.query(
      "UPDATE users SET is_banned = false WHERE id = $1",
      [userId]
    );
    
    res.json({ 
      success: true, 
      message: "User unbanned successfully" 
    });
  } catch (err) {
    console.error("Error unbanning user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Export router
export default router;

