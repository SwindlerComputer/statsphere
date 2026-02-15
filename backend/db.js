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

import dotenv from "dotenv";
import pkg from "pg";

// Load .env variables
dotenv.config();

// Get the Pool class from the pg library
const { Pool } = pkg;

// This variable will hold our database connection pool
let pool;

// ========================================
// CHECK: Are we using Supabase or Local DB?
// ========================================
if (process.env.SUPABASE_DATABASE_URL) {
  // ----- SUPABASE CONNECTION -----
  // Use the full connection string from Supabase dashboard
  // SSL is REQUIRED for Supabase (it's a cloud database)
  // rejectUnauthorized: false allows self-signed certificates
  console.log("🌐 Connecting to Supabase database...");

  pool = new Pool({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Supabase
  });
} else {
  // ----- LOCAL POSTGRES CONNECTION -----
  // Use individual environment variables for local development
  // Falls back to default values if .env variables are missing
  console.log("💻 Connecting to local PostgreSQL database...");

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

