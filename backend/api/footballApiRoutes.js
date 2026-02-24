// ========================================
// footballApiRoutes.js - Mock Football Data Endpoints
// ========================================
// UPDATED: No longer uses external APIs (RapidAPI).
// All data is now served from local JSON files (mock datasets).
//
// This makes the app fully self-contained - no API keys needed,
// no rate limits, no subscription costs, and works offline.
//
// ENDPOINTS:
// GET /api/football/standings  → League standings (from mockStandings.json)
// GET /api/football/fixtures   → Match fixtures (from mockFixtures.json)
// ========================================

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("✅ Football API routes loaded (using mock data - no external APIs)");

// ========================================
// HELPER: Load a JSON file from the data folder
// ========================================
function loadJSON(filename) {
  const filePath = path.join(__dirname, "..", "data", filename);
  const jsonData = fs.readFileSync(filePath, "utf8");
  return JSON.parse(jsonData);
}

// ========================================
// Mapping of competition names to display names
// ========================================
const COMPETITIONS = {
  "premier-league": "Premier League",
  "la-liga": "La Liga",
  "bundesliga": "Bundesliga",
  "serie-a": "Serie A",
  "ligue-1": "Ligue 1",
  "champions-league": "Champions League",
  "world-cup-2026": "World Cup 2026"
};

// ========================================
// GET /api/football/competitions
// ========================================
// Returns list of available competitions for dropdowns
router.get("/competitions", (req, res) => {
  const competitions = Object.entries(COMPETITIONS).map(function ([id, name]) {
    return { id: id, name: name };
  });
  res.json(competitions);
});

// ========================================
// GET /api/football/standings
// ========================================
// Returns league standings from mock data.
// Query params:
//   ?competition=premier-league (default)
//
// Response format matches what the frontend expects.
router.get("/standings", (req, res) => {
  try {
    const competitionId = req.query.competition || req.query.leagueId || "premier-league";
    const allStandings = loadJSON("mockStandings.json");

    // Map old numeric IDs to new string IDs for backwards compatibility
    const idMap = {
      "39": "Premier League",
      "140": "La Liga",
      "78": "Bundesliga",
      "135": "Serie A",
      "61": "Ligue 1"
    };

    // Determine the competition name to look up
    let competitionName = COMPETITIONS[competitionId] || idMap[competitionId] || competitionId;

    // Get standings for the requested competition
    const standings = allStandings[competitionName];

    if (!standings) {
      return res.json({ response: [{ league: { standings: [[]] } }] });
    }

    // Format into the structure the frontend expects
    // (matches the old RapidAPI response format for backwards compatibility)
    const formattedStandings = standings.map(function (team) {
      return {
        rank: team.rank,
        team: { id: team.rank, name: team.team, logo: "" },
        points: team.points,
        goalsDiff: team.goalDifference,
        all: {
          played: team.played,
          win: team.won,
          draw: team.draw,
          lose: team.lost,
          goals: { for: team.goalsFor, against: team.goalsAgainst }
        }
      };
    });

    res.json({
      response: [{
        league: {
          id: competitionId,
          name: competitionName,
          standings: [formattedStandings]
        }
      }]
    });
  } catch (err) {
    console.error("Error loading standings:", err);
    res.status(500).json({ error: "Failed to load standings" });
  }
});

// ========================================
// GET /api/football/fixtures
// ========================================
// Returns match fixtures from mock data.
// Query params:
//   ?competition=premier-league (default)
//
// Response format matches what the frontend expects.
router.get("/fixtures", (req, res) => {
  try {
    const competitionId = req.query.competition || req.query.leagueId || "premier-league";
    const allFixtures = loadJSON("mockFixtures.json");

    // Map old numeric IDs to new string IDs for backwards compatibility
    const idMap = {
      "39": "Premier League",
      "140": "La Liga",
      "78": "Bundesliga",
      "135": "Serie A",
      "61": "Ligue 1"
    };

    let competitionName = COMPETITIONS[competitionId] || idMap[competitionId] || competitionId;

    const fixtures = allFixtures[competitionName];

    if (!fixtures) {
      return res.json({ response: [] });
    }

    // Format into the structure the frontend expects
    // (matches the old RapidAPI response format for backwards compatibility)
    const formattedFixtures = fixtures.map(function (match) {
      return {
        fixture: {
          id: match.id,
          date: match.date,
          status: { short: match.status }
        },
        teams: {
          home: { id: match.id * 10, name: match.home, logo: "" },
          away: { id: match.id * 10 + 1, name: match.away, logo: "" }
        },
        goals: {
          home: match.homeScore,
          away: match.awayScore
        },
        round: match.round
      };
    });

    res.json({ response: formattedFixtures });
  } catch (err) {
    console.error("Error loading fixtures:", err);
    res.status(500).json({ error: "Failed to load fixtures" });
  }
});

export default router;
