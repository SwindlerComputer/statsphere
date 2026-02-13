// auth/authRoutes.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pkg from "pg";

const { Pool } = pkg;

const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASS),
  port: 5432,
});

// Helper to create tokens
const createToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Check all fields are provided
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  // Check password length
  if (password.length < 8)
    return res.status(400).json({ message: "Password must be at least 8 characters" });

  const existing = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  if (existing.rows.length > 0)
    return res.status(409).json({ message: "Email already registered" });

  const hash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email`,
    [name, email, hash]
  );

  const user = result.rows[0];
  const token = createToken(user);

  // Cookie settings: For localhost, omit sameSite to allow WebSocket connections
  // In production with HTTPS, use secure: true and sameSite: "lax"
  const isLocalhost = req.get('host')?.includes('localhost') || req.get('host')?.includes('127.0.0.1');
  const cookieOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  
  // Only set sameSite and secure for production (HTTPS)
  if (process.env.NODE_ENV === "production" && !isLocalhost) {
    cookieOptions.sameSite = "lax";
    cookieOptions.secure = true;
  }
  // For localhost, don't set sameSite to allow WebSocket connections
  
  res.cookie("token", token, cookieOptions);

  res.json({ message: "User registered", user });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  if (result.rows.length === 0)
    return res.status(401).json({ message: "Invalid credentials" });

  const user = result.rows[0];

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = createToken(user);

  // Cookie settings: For localhost, omit sameSite to allow WebSocket connections
  // In production with HTTPS, use secure: true and sameSite: "lax"
  const isLocalhost = req.get('host')?.includes('localhost') || req.get('host')?.includes('127.0.0.1');
  const cookieOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  
  // Only set sameSite and secure for production (HTTPS)
  if (process.env.NODE_ENV === "production" && !isLocalhost) {
    cookieOptions.sameSite = "lax";
    cookieOptions.secure = true;
  }
  // For localhost, don't set sameSite to allow WebSocket connections
  
  res.cookie("token", token, cookieOptions);

  res.json({ message: "Logged in", user: { id: user.id, email: user.email, name: user.name } });
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// GET CURRENT USER
import { authMiddleware } from "./authMiddleware.js";

router.get("/me", authMiddleware, async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email FROM users WHERE id=$1",
    [req.user.id]
  );

  res.json({ user: result.rows[0] });
});

export default router;
