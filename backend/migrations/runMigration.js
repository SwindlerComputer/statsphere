// ========================================
// Run Migration Script
// ========================================
// This script runs the SQL migration to add moderation features
// Run with: node migrations/runMigration.js
// ========================================

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../db.js"; // Shared database connection (supports Supabase + local)

dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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





