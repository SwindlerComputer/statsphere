// ========================================
// Run Migration Script
// ========================================
// This script runs the SQL migration to add moderation features
// Run with: node migrations/runMigration.js
// ========================================

import dotenv from "dotenv";
import pkg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const { Pool } = pkg;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "statsphere",
  password: String(process.env.DB_PASS || "admin123"),
  port: 5432,
});

async function runMigration() {
  try {
    console.log("🔄 Running migration...");
    
    // Read SQL file
    const sqlPath = path.join(__dirname, "add_moderation.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    
    // Execute SQL
    await pool.query(sql);
    
    console.log("✅ Migration completed successfully!");
    console.log("✅ Added is_banned column to users table");
    console.log("✅ Created reported_messages table");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

runMigration();




