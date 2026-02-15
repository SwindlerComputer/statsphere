// auth/authRoutes.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js"; // Shared database connection (supports Supabase + local)

const router = express.Router();

// Helper to create tokens
// Stores id, email, AND name so they're always available
const createToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
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

  // Check if we're running in production (Render sets NODE_ENV=production)
  const isProd = process.env.NODE_ENV === "production";

  // Cookie settings for JWT token:
  // - httpOnly: prevents JavaScript from reading the cookie (security)
  // - sameSite: "none" in production (allows cross-site cookies between frontend & backend)
  //             "lax" locally (normal browser behavior)
  // - secure: true in production (cookies only sent over HTTPS)
  //           false locally (localhost uses HTTP)
  // - maxAge: cookie expires in 7 days
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Return token in body too (for localStorage fallback when cookies are blocked)
  res.json({ message: "User registered", user, token });
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

  // Check if we're running in production (Render sets NODE_ENV=production)
  const isProd = process.env.NODE_ENV === "production";

  // Cookie settings (same as register - see comments there)
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Return token in body too (for localStorage fallback when cookies are blocked)
  res.json({ message: "Logged in", user: { id: user.id, email: user.email, name: user.name }, token });
});

// LOGOUT
// clearCookie MUST use the same options as when the cookie was set
// Otherwise the browser won't remove it (especially in production)
router.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
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
  const result = await pool.query(
    "SELECT id, name, email FROM users WHERE id=$1",
    [req.user.id]
  );

  res.json({ user: result.rows[0] });
});

export default router;
