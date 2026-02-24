// ========================================
// authRoutes.js - Login and Register Routes
// ========================================
// This file handles:
// 1. POST /auth/register - Create a new account
// 2. POST /auth/login    - Log in (with email OR username)
// 3. POST /auth/logout   - Log out
// 4. GET  /auth/me       - Get the logged-in user's info
// ========================================

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import { authMiddleware } from "./authMiddleware.js";

var router = express.Router();

// ========================================
// HELPER: Create a JWT token for a user
// ========================================
// A JWT token is like a digital ID card.
// We put the user's id, email, and name inside it.
// It expires after 7 days.
function createToken(user) {
  var tokenData = {
    id: user.id,
    email: user.email,
    name: user.name
  };
  var token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: "7d" });
  return token;
}

// ========================================
// HELPER: Set the cookie options
// ========================================
// In production (on Render), we need special cookie settings
// so the cookie works across different domains.
function getCookieOptions() {
  var isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in milliseconds
  };
}

// ========================================
// POST /auth/register - Create a new account
// ========================================
router.post("/register", async function (req, res) {
  // Get the data the user typed in the form
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;

  // Check all fields are filled in
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Clean up the username (remove spaces from start/end)
  name = name.trim();

  // USERNAME VALIDATION
  // Must be 3-20 characters long
  if (name.length < 3 || name.length > 20) {
    return res.status(400).json({ message: "Username must be 3-20 characters" });
  }
  // Can only have letters, numbers, and underscores
  // The regex /^[a-zA-Z0-9_]+$/ means:
  //   ^ = start of string
  //   [a-zA-Z0-9_] = any letter, number, or underscore
  //   + = one or more of these characters
  //   $ = end of string
  var usernameOk = /^[a-zA-Z0-9_]+$/.test(name);
  if (!usernameOk) {
    return res.status(400).json({ message: "Username can only contain letters, numbers, and underscores" });
  }

  // EMAIL VALIDATION
  // Clean up the email (remove spaces, make lowercase)
  email = email.trim().toLowerCase();
  // Check it looks like a real email (has @ and a dot after it)
  var hasAtSign = email.indexOf("@") > 0;
  var hasDotAfterAt = email.indexOf(".", email.indexOf("@")) > 0;
  if (!hasAtSign || !hasDotAfterAt) {
    return res.status(400).json({ message: "Please enter a valid email address" });
  }

  // PASSWORD VALIDATION
  // Must be at least 8 characters
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }
  // Must have at least one uppercase letter (A-Z)
  var hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    return res.status(400).json({ message: "Password must contain at least one uppercase letter" });
  }
  // Must have at least one number (0-9)
  var hasNumber = /[0-9]/.test(password);
  if (!hasNumber) {
    return res.status(400).json({ message: "Password must contain at least one number" });
  }

  try {
    // Check if email is already registered
    var existingEmail = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (existingEmail.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Check if username is already taken
    var existingName = await pool.query("SELECT * FROM users WHERE LOWER(name)=$1", [name.toLowerCase()]);
    if (existingName.rows.length > 0) {
      return res.status(409).json({ message: "Username already taken" });
    }

    // Hash the password (scramble it so nobody can read it)
    // bcrypt turns "Password1" into something like "$2b$10$abc123..."
    var hash = await bcrypt.hash(password, 10);

    // Save the new user to the database
    var result = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hash]
    );

    // Get the user we just created
    var user = result.rows[0];

    // Create a JWT token (digital ID card)
    var token = createToken(user);

    // Send the token as a cookie
    res.cookie("token", token, getCookieOptions());

    // Also send it in the response body (backup)
    res.json({ message: "User registered", user: user, token: token });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ========================================
// POST /auth/login - Log in with email OR username
// ========================================
// The user can type either their email or their username.
// We check if the input has an "@" sign:
//   - If YES: we search the database by email
//   - If NO:  we search the database by username
router.post("/login", async function (req, res) {
  // Get what the user typed
  var loginInput = req.body.email;  // could be email or username
  var password = req.body.password;

  // Check both fields are filled in
  if (!loginInput || !password) {
    return res.status(400).json({ message: "Email/username and password are required" });
  }

  try {
    // Clean up the input
    loginInput = loginInput.trim();

    // Search for the user in the database
    var result;
    if (loginInput.indexOf("@") >= 0) {
      // Input has @ so it's probably an email
      result = await pool.query("SELECT * FROM users WHERE LOWER(email)=$1", [loginInput.toLowerCase()]);
    } else {
      // No @ so it's probably a username
      result = await pool.query("SELECT * FROM users WHERE LOWER(name)=$1", [loginInput.toLowerCase()]);
    }

    // If no user found, return error
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    var user = result.rows[0];

    // Compare the typed password with the stored hash
    // bcrypt.compare returns true if they match, false if not
    var passwordIsCorrect = await bcrypt.compare(password, user.password_hash);
    if (!passwordIsCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create a JWT token
    var token = createToken(user);

    // Send it as a cookie
    res.cookie("token", token, getCookieOptions());

    // Send response with user info and token
    res.json({
      message: "Logged in",
      user: { id: user.id, email: user.email, name: user.name },
      token: token
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ========================================
// POST /auth/logout - Log out
// ========================================
// Clears the cookie so the user is no longer logged in
router.post("/logout", function (req, res) {
  var isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  });
  res.json({ message: "Logged out" });
});

// ========================================
// GET /auth/me - Get the current logged-in user
// ========================================
// The authMiddleware checks the JWT token first.
// If valid, req.user will have { id, email, name }
router.get("/me", authMiddleware, async function (req, res) {
  var result = await pool.query(
    "SELECT id, name, email FROM users WHERE id=$1",
    [req.user.id]
  );
  res.json({ user: result.rows[0] });
});

export default router;
