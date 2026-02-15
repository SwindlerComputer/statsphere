-- ========================================
-- Supabase Setup: Create All Tables
-- ========================================
-- Run this SQL in Supabase Dashboard → SQL Editor
-- This creates the same tables you had in local Postgres
-- ========================================

-- ========================================
-- TABLE 1: users
-- ========================================
-- Stores registered users (name, email, password)
-- Used by: auth/authRoutes.js (register, login, /me)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_banned BOOLEAN DEFAULT false
);

-- ========================================
-- TABLE 2: teams
-- ========================================
-- Stores football teams for the /api/teams endpoint
-- Used by: server.js (GET /api/teams)
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  league TEXT,
  country TEXT
);

-- ========================================
-- TABLE 3: reported_messages
-- ========================================
-- Stores chat reports from users
-- Used by: api/modRoutes.js (report, reports)
CREATE TABLE IF NOT EXISTS reported_messages (
  id SERIAL PRIMARY KEY,
  reporter_user_id INTEGER NOT NULL REFERENCES users(id),
  message_id BIGINT,
  message_text TEXT,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups on reports
CREATE INDEX IF NOT EXISTS idx_reported_messages_created_at 
ON reported_messages(created_at DESC);

-- ========================================
-- DONE!
-- ========================================
-- After running this, your Supabase database
-- has all the tables your backend needs.
-- ========================================

