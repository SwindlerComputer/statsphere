// ========================================
// footballApiRoutes.js - RapidAPI Football Data Endpoints
// ========================================
// FINAL YEAR PROJECT ARCHITECTURE EXPLANATION:
//
// This file creates API endpoints that fetch live football data from RapidAPI
// and serve it to the frontend React application.
//
// ARCHITECTURE FLOW:
// 1. Frontend (React) makes HTTP request to our backend
// 2. Backend receives request at /api/standings or /api/fixtures
// 3. Backend forwards request to RapidAPI with API key
// 4. RapidAPI returns football data (JSON)
// 5. Backend sends data back to frontend
// 6. Frontend displays data to user
//
// WHY THIS ARCHITECTURE?
// - We cannot call RapidAPI directly from frontend (security: API key would be exposed)
// - Backend acts as a "proxy" or "middleman" between frontend and RapidAPI
// - Backend keeps API key secret in .env file
//
// IMPORTANT: API SUBSCRIPTION REQUIRED
// If you get 403 "not subscribed" errors:
// 1. Go to RapidAPI (rapidapi.com) and subscribe to the API you want to use
// 2. Make sure your RAPID_API_KEY in .env matches your subscription
// 3. Check the API's documentation for correct endpoints
//
// CURRENT SETUP: Using API-Football (requires subscription)
// To use a different API, change the API_HOST constant below (line 40)
// ========================================

import express from "express";
import dotenv from "dotenv";
import { getCache, setCache } from "../services/cache.js";

// Load environment variables (API key is stored in .env file)
dotenv.config();

// API Configuration - Change this if using a different API
// Current: Direct API-Sports.io (free tier - 100 requests/day)
// Options:
// - Direct API-Sports.io: USE_RAPIDAPI = false (CURRENT - free tier)
// - RapidAPI gateway: USE_RAPIDAPI = true (requires RapidAPI subscription)
const API_HOST = "v3.football.api-sports.io";
const USE_RAPIDAPI = false; // Set to false for direct API-Sports.io (free tier)

// Create a router object (this lets us group related endpoints together)
const router = express.Router();

// Log that routes are being loaded (for debugging)
console.log("✅ Football API routes loaded: /api/standings and /api/fixtures");

// ========================================
// HELPER FUNCTION: Get API Key
// ========================================
// This function gets the API key from environment variables
// For direct API-Sports.io: Use API_SPORTS_KEY
// For RapidAPI: Use RAPID_API_KEY
function getApiKey() {
  // Try API-Sports.io key first (for direct service)
  if (process.env.API_SPORTS_KEY) {
    return process.env.API_SPORTS_KEY;
  }
  // Fall back to RapidAPI key (for RapidAPI gateway)
  return process.env.RAPID_API_KEY;
}

// ========================================
// HELPER FUNCTION: Set Up API Headers
// ========================================
// RapidAPI requires specific headers for authentication
// This function creates the headers object we need
// NOTE: If using a different API, update the host here
function getApiHeaders(host = "api-football-v1.p.rapidapi.com") {
  const apiKey = getApiKey();
  
  return {
    "x-rapidapi-host": host,
    "x-rapidapi-key": apiKey
  };
}

// ========================================
// HELPER FUNCTION: Fetch Standings from API
// ========================================
// This function makes the actual API call to get standings
// It's separated so we can use it with caching
async function getStandings(leagueId, season) {
  // Build URL based on which service we're using
  let apiUrl;
  if (USE_RAPIDAPI) {
    apiUrl = `https://api-football-v1.p.rapidapi.com/v3/standings?season=${season}&league=${leagueId}`;
  } else {
    apiUrl = `https://v3.football.api-sports.io/standings?season=${season}&league=${leagueId}`;
  }
  
  // Set headers based on which service we're using
  const headers = USE_RAPIDAPI 
    ? {
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": getApiKey()
      }
    : {
        "x-apisports-key": getApiKey() // Direct API-Sports.io uses different header
      };

  console.log("Fetching standings from API...");
  console.log("URL:", apiUrl);
  console.log("API Key exists:", !!getApiKey());
  console.log("API Key length:", getApiKey() ? getApiKey().length : 0);
  const headerKey = USE_RAPIDAPI ? "x-rapidapi-key" : "x-apisports-key";
  console.log("Headers:", { ...headers, [headerKey]: headers[headerKey] ? "***" + headers[headerKey].slice(-4) : "MISSING" });
  
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: headers
  });

  if (!response.ok) {
    let errorMessage = "Failed to fetch standings from API";
    let errorDetails = {};
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorDetails = errorData;
      
      // Check for free tier season limitation
      if (errorData.errors && errorData.errors.plan) {
        errorMessage = errorData.errors.plan;
      }
    } catch (e) {
      errorMessage = response.statusText || errorMessage;
    }
    
    console.error("API Error:", response.status, errorMessage);
    console.error("Error details:", errorDetails);
    
    // If 403, provide more specific help
    if (response.status === 403) {
      throw new Error(`403 Forbidden: ${errorMessage}. Check: 1) Your API key is correct, 2) You're subscribed to API-Football, 3) Your subscription is active.`);
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
}

// ========================================
// HELPER FUNCTION: Fetch Fixtures from API
// ========================================
// This function makes the actual API call to get fixtures
// It's separated so we can use it with caching
async function getFixtures(date, leagueId, teamId) {
  // Build URL based on which service we're using
  let baseUrl = USE_RAPIDAPI 
    ? "https://api-football-v1.p.rapidapi.com/v3/fixtures"
    : "https://v3.football.api-sports.io/fixtures";
  
  let params = [];
  if (date) params.push("date=" + date);
  if (leagueId) params.push("league=" + leagueId);
  if (teamId) params.push("team=" + teamId);
  
  let apiUrl = baseUrl;
  if (params.length > 0) {
    apiUrl = apiUrl + "?" + params.join("&");
  }

  // Set headers based on which service we're using
  const headers = USE_RAPIDAPI 
    ? {
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": getApiKey()
      }
    : {
        "x-apisports-key": getApiKey() // Direct API-Sports.io uses different header
      };

  console.log("Fetching fixtures from RapidAPI...");
  console.log("URL:", apiUrl);
  
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: headers
  });

  if (!response.ok) {
    let errorMessage = "Failed to fetch fixtures from RapidAPI";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
}

// ========================================
// ENDPOINT 1: GET /api/football/standings
// ========================================
// This endpoint fetches league standings (team rankings) from RapidAPI
// Frontend can call: GET http://localhost:5000/api/football/standings
//
// QUERY PARAMETERS:
// - leagueId: League ID number (e.g., "39" for Premier League, "140" for La Liga)
// - season: year (e.g., "2024")
//
// EXAMPLE FRONTEND USAGE:
// fetch("http://localhost:5000/api/football/standings?leagueId=39&season=2024")
// 
// COMMON LEAGUE IDs:
// 39 = Premier League (England)
// 140 = La Liga (Spain)
// 78 = Bundesliga (Germany)
// 135 = Serie A (Italy)
// 61 = Ligue 1 (France)
//
router.get("/standings", async (req, res) => {
  try {
    // Step 1: Check if API key exists
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error("❌ API key not found in environment variables");
      return res.status(500).json({ 
        error: "API key not configured. Please add API_SPORTS_KEY (or RAPID_API_KEY) to backend/.env file",
        help: USE_RAPIDAPI 
          ? "For RapidAPI: RAPID_API_KEY=your_rapidapi_key"
          : "For API-Sports.io: API_SPORTS_KEY=your_api_sports_key (get it from https://dashboard.api-sports.io/)"
      });
    }
    
    console.log("✅ API Key found (length:", apiKey.length + ")");

    // Step 2: Get query parameters from frontend request
    // Example: /api/football/standings?leagueId=39&season=2023
    // NOTE: Free tier only supports seasons 2021-2023, not 2024
    const leagueId = req.query.leagueId || "39"; // Default: Premier League (39)
    const season = req.query.season || "2023"; // Default to 2023 (free tier limit)

    // Step 3: Create cache key based on parameters
    // This ensures each unique combination of leagueId and season has its own cache
    const cacheKey = `standings-${leagueId}-${season}`;

    // Step 4: Check if data is in cache
    const cached = getCache(cacheKey);
    if (cached) {
      console.log("Returning cached standings data");
      return res.json(cached);
    }

    // Step 5: Data not in cache, fetch from API
    const data = await getStandings(leagueId, season);
    
    // Step 6: Store data in cache for future requests
    setCache(cacheKey, data);

    // Step 7: Send data back to frontend
    res.json(data);

  } catch (error) {
    // Step 8: Handle any errors
    console.error("Error fetching standings:", error);
    
    // Check if it's a subscription error (403)
    if (error.message.includes("403") || error.message.includes("not subscribed") || error.message.includes("Forbidden")) {
      return res.status(403).json({ 
        error: "Subscription Error",
        message: "You are not subscribed to this API on RapidAPI",
        help: [
          "1. Go to https://rapidapi.com/hub",
          "2. Search for 'API-Football'",
          "3. Click 'Subscribe' and choose the free tier",
          "4. Make sure your RAPID_API_KEY in backend/.env matches your RapidAPI key",
          "5. Verify your subscription is active in your RapidAPI dashboard"
        ]
      });
    }
    
    // Check if it's a rate limit error
    if (error.message.includes("Too many requests") || error.message.includes("429")) {
      return res.status(429).json({ 
        error: "Rate limit exceeded",
        message: "You've made too many requests. Wait a few minutes before trying again, or upgrade your RapidAPI plan.",
        note: "Caching will help reduce API calls once data is cached."
      });
    }
    
    res.status(500).json({ 
      error: "Server error while fetching standings",
      message: error.message 
    });
  }
});

// ========================================
// ENDPOINT 2: GET /api/football/fixtures
// ========================================
// This endpoint fetches football fixtures (matches) from RapidAPI
// Frontend can call: GET http://localhost:5000/api/football/fixtures
//
// QUERY PARAMETERS (optional):
// - date: Match date in YYYY-MM-DD format (e.g., "2024-01-15", defaults to today)
// - leagueId: League ID number (e.g., "39" for Premier League)
// - teamId: Team ID number (optional)
//
// EXAMPLE FRONTEND USAGE:
// fetch("http://localhost:5000/api/football/fixtures?date=2024-01-15&leagueId=39")
//
router.get("/fixtures", async (req, res) => {
  try {
    // Step 1: Check if API key exists
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(500).json({ 
        error: "API key not configured. Please add RAPID_API_KEY to .env file" 
      });
    }

    // Step 2: Get query parameters from frontend request
    // Example: /api/football/fixtures?date=2024-01-15&leagueId=39&season=2023
    // If season is provided, we'll use it to filter fixtures
    // If date is provided, use it; otherwise default to today
    let date = req.query.date;
    const season = req.query.season || "";
    const leagueId = req.query.leagueId || "";
    const teamId = req.query.teamId || "";
    
    // If season is provided but no date, use a representative date from that season
    // Season 2023 = 2023-08-01 (start of 2023-2024 season)
    // Season 2022 = 2022-08-01 (start of 2022-2023 season)
    // Season 2021 = 2021-08-01 (start of 2021-2022 season)
    if (!date && season) {
      date = `${season}-08-01`; // Use August 1st of the season year
    } else if (!date) {
      date = new Date().toISOString().split('T')[0]; // Default to today
    }

    // Step 3: Create cache key based on parameters
    // This ensures each unique combination has its own cache
    const cacheKey = `fixtures-${date}-${leagueId}-${season}-${teamId}`;

    // Step 4: Check if data is in cache
    const cached = getCache(cacheKey);
    if (cached) {
      console.log("Returning cached fixtures data");
      return res.json(cached);
    }

    // Step 5: Data not in cache, fetch from API
    const data = await getFixtures(date, leagueId, teamId);
    
    // Step 6: Store data in cache for future requests
    setCache(cacheKey, data);

    // Step 7: Send data back to frontend
    res.json(data);

  } catch (error) {
    // Step 8: Handle any errors
    console.error("Error fetching fixtures:", error);
    
    // Check if it's a subscription error (403)
    if (error.message.includes("403") || error.message.includes("not subscribed") || error.message.includes("Forbidden")) {
      return res.status(403).json({ 
        error: "Subscription Error",
        message: "You are not subscribed to this API on RapidAPI",
        help: [
          "1. Go to https://rapidapi.com/hub",
          "2. Search for 'API-Football'",
          "3. Click 'Subscribe' and choose the free tier",
          "4. Make sure your RAPID_API_KEY in backend/.env matches your RapidAPI key",
          "5. Verify your subscription is active in your RapidAPI dashboard"
        ]
      });
    }
    
    // Check if it's a rate limit error
    if (error.message.includes("Too many requests") || error.message.includes("429")) {
      return res.status(429).json({ 
        error: "Rate limit exceeded",
        message: "You've made too many requests. Wait a few minutes before trying again, or upgrade your RapidAPI plan.",
        note: "Caching will help reduce API calls once data is cached."
      });
    }
    
    res.status(500).json({ 
      error: "Server error while fetching fixtures",
      message: error.message 
    });
  }
});

// Export the router so it can be used in server.js
export default router;

