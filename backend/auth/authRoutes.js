// auth/authRoutes.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

// Helper to create tokens
const createToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER
router.post("/register", async (req, res) => {
  var { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  // Username must be 3-20 characters, letters/numbers/underscores only
  name = name.trim();
  if (name.length < 3 || name.length > 20) {
    return res.status(400).json({ message: "Username must be 3-20 characters" });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    return res.status(400).json({ message: "Username can only contain letters, numbers, and underscores" });
  }

  // Email validation
  email = email.trim().toLowerCase();
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address" });
  }

  // Password validation: min 8 chars, at least 1 uppercase, 1 number
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ message: "Password must contain at least one uppercase letter" });
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ message: "Password must contain at least one number" });
  }

  try {
    // Check if email already exists
    var existing = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0)
      return res.status(409).json({ message: "Email already registered" });

    // Check if username already exists
    var existingName = await pool.query("SELECT * FROM users WHERE LOWER(name)=$1", [name.toLowerCase()]);
    if (existingName.rows.length > 0)
      return res.status(409).json({ message: "Username already taken" });

    var hash = await bcrypt.hash(password, 10);

    var result = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hash]
    );

    var user = result.rows[0];
    var token = createToken(user);

    var isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "User registered", user, token });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// LOGIN - accepts email OR username
router.post("/login", async (req, res) => {
  var { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email/username and password are required" });
  }

  try {
    var loginInput = email.trim();
    var result;

    // Check if user typed an email (contains @) or a username
    if (loginInput.includes("@")) {
      result = await pool.query("SELECT * FROM users WHERE LOWER(email)=$1", [loginInput.toLowerCase()]);
    } else {
      result = await pool.query("SELECT * FROM users WHERE LOWER(name)=$1", [loginInput.toLowerCase()]);
    }

    if (result.rows.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    var user = result.rows[0];

    var valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ message: "Invalid credentials" });

    var token = createToken(user);

    var isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Logged in", user: { id: user.id, email: user.email, name: user.name }, token });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  var isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  });
  res.json({ message: "Logged out" });
});

// GET CURRENT USER
import { authMiddleware } from "./authMiddleware.js";

router.get("/me", authMiddleware, async (req, res) => {
  var result = await pool.query(
    "SELECT id, name, email FROM users WHERE id=$1",
    [req.user.id]
  );

  res.json({ user: result.rows[0] });
});

export default router;
