-- ========================================
-- Migration: Add Moderation System
-- ========================================
-- This SQL script adds:
-- 1. is_banned column to users table
-- 2. reported_messages table for storing reports
--
-- HOW TO RUN:
-- 1. Open PostgreSQL (psql or pgAdmin)
-- 2. Connect to your statsphere database
-- 3. Run this file: \i backend/migrations/add_moderation.sql
-- OR copy and paste the SQL below
-- ========================================

-- Step 1: Add is_banned column to users table
-- This column tracks if a user is banned from chat
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- Step 2: Create reported_messages table
-- This table stores reports made by users about bad messages
CREATE TABLE IF NOT EXISTS reported_messages (
  id SERIAL PRIMARY KEY,
  reporter_user_id INTEGER NOT NULL REFERENCES users(id),
  message_id BIGINT,                    -- ID of the message (from chat)
  message_text TEXT,                     -- Copy of the message text
  reason TEXT NOT NULL,                  -- Why it was reported
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reported_messages_created_at 
ON reported_messages(created_at DESC);

-- Done! Now users can be banned and messages can be reported.

