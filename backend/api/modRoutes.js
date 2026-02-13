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
import pkg from "pg";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;
const router = express.Router();

// Get database connection from environment
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "statsphere",
  password: String(process.env.DB_PASS || "admin123"),
  port: 5432,
});

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
    // Get token from cookie
    const token = req.cookies.token;
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
    // Get data from request body
    const { messageId, messageText, reason } = req.body;
    
    // Check if required fields are present
    if (!messageText || !reason) {
      return res.status(400).json({ error: "Message text and reason are required" });
    }
    
    // Insert report into database
    const result = await pool.query(
      "INSERT INTO reported_messages (reporter_user_id, message_id, message_text, reason) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.user.id, messageId || null, messageText, reason]
    );
    
    res.json({ 
      success: true, 
      message: "Report submitted successfully",
      report: result.rows[0]
    });
  } catch (err) {
    console.error("Error reporting message:", err);
    res.status(500).json({ error: "Server error" });
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

