// ========================================
// db.js - Shared Database Connection
// ========================================
// This file sets up the PostgreSQL connection pool.
// It supports TWO ways to connect:
//
// 1. SUPABASE (cloud database):
//    - Uses SUPABASE_DATABASE_URL from .env
//    - Needs SSL enabled for secure cloud connection
//
// 2. LOCAL POSTGRES (your own machine):
//    - Uses DB_USER, DB_HOST, DB_NAME, DB_PASS, DB_PORT from .env
//    - No SSL needed for local development
//
// HOW IT WORKS:
// - If SUPABASE_DATABASE_URL exists in .env → connect to Supabase
// - Otherwise → connect to local Postgres
// ========================================

// ========================================
// STEP 1: Load .env FIRST before anything else
// ========================================
// This MUST be at the very top so all environment variables
// (like SUPABASE_DATABASE_URL) are available before we create the Pool
//
// We use path.join(__dirname, ".env") instead of just dotenv.config()
// so it ALWAYS finds backend/.env no matter what folder you run the
// server from (fixes a common Windows issue with working directories)
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory where THIS file (db.js) lives (the backend folder)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend folder using an absolute path
dotenv.config({ path: path.join(__dirname, ".env") });

import pkg from "pg";

// Get the Pool class from the pg library
const { Pool } = pkg;

// This variable will hold our database connection pool
let pool;

// ========================================
// STEP 2: Check which database to use
// ========================================
if (process.env.SUPABASE_DATABASE_URL) {
  // ----- SUPABASE CONNECTION -----
  // Use the full connection string from Supabase dashboard
  // SSL is REQUIRED for Supabase (it's a cloud database)
  // rejectUnauthorized: false allows self-signed certificates
  console.log("========================================");
  console.log("DB MODE: SUPABASE");
  console.log("========================================");

  pool = new Pool({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Supabase
  });
} else {
  // ----- LOCAL POSTGRES CONNECTION -----
  // Use individual environment variables for local development
  // Falls back to default values if .env variables are missing
  console.log("========================================");
  console.log("DB MODE: LOCAL");
  console.log("========================================");

  pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "statsphere",
    password: String(process.env.DB_PASS || "admin123"),
    port: process.env.DB_PORT || 5432,
  });
}

// ========================================
// Export the pool so other files can use it
// ========================================
// Usage in other files:
//   import pool from "./db.js";
//   const result = await pool.query("SELECT * FROM users");
// ========================================
export default pool;

