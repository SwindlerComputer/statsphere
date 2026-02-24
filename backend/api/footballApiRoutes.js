// ========================================
// footballApiRoutes.js - Mock Football Data Endpoints
// ========================================
// All data comes from local JSON files (no external APIs).
//
// ENDPOINTS:
// GET /api/football/standings  - League standings
// GET /api/football/fixtures   - Match fixtures
// GET /api/football/competitions - List of competitions
// ========================================

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

var router = express.Router();

// Fix __dirname for ES Modules (needed because we use import instead of require)
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);

console.log("Football API routes loaded (using mock data)");

// ========================================
// HELPER: Load a JSON file from the data folder
// ========================================
function loadJSON(filename) {
  var filePath = path.join(__dirname, "..", "data", filename);
  var jsonData = fs.readFileSync(filePath, "utf8");
  return JSON.parse(jsonData);
}

// ========================================
// Competition name lookup
// ========================================
// Maps URL-friendly IDs to display names
// Example: "premier-league" -> "Premier League"
function getCompetitionName(competitionId) {
  if (competitionId === "premier-league") return "Premier League";
  if (competitionId === "la-liga") return "La Liga";
  if (competitionId === "bundesliga") return "Bundesliga";
  if (competitionId === "serie-a") return "Serie A";
  if (competitionId === "ligue-1") return "Ligue 1";
  if (competitionId === "champions-league") return "Champions League";
  if (competitionId === "world-cup-2026") return "World Cup 2026";
  // Old numeric IDs (for backwards compatibility)
  if (competitionId === "39") return "Premier League";
  if (competitionId === "140") return "La Liga";
  if (competitionId === "78") return "Bundesliga";
  if (competitionId === "135") return "Serie A";
  if (competitionId === "61") return "Ligue 1";
  return competitionId;
}

// ========================================
// GET /api/football/competitions
// ========================================
// Returns the list of competitions for dropdown menus
router.get("/competitions", function (req, res) {
  var competitions = [
    { id: "premier-league", name: "Premier League" },
    { id: "la-liga", name: "La Liga" },
    { id: "bundesliga", name: "Bundesliga" },
    { id: "serie-a", name: "Serie A" },
    { id: "ligue-1", name: "Ligue 1" },
    { id: "champions-league", name: "Champions League" },
    { id: "world-cup-2026", name: "World Cup 2026" }
  ];
  res.json(competitions);
});

// ========================================
// GET /api/football/standings
// ========================================
// Returns league standings for a given competition.
// Use like: /api/football/standings?competition=premier-league
router.get("/standings", function (req, res) {
  try {
    // Get the competition from the URL query
    var competitionId = req.query.competition || req.query.leagueId || "premier-league";
    var competitionName = getCompetitionName(competitionId);

    // Load all standings from the JSON file
    var allStandings = loadJSON("mockStandings.json");

    // Find the standings for the requested competition
    var standings = allStandings[competitionName];

    // If no standings found, return empty
    if (!standings) {
      return res.json({ response: [{ league: { standings: [[]] } }] });
    }

    // Format each team into the structure the frontend expects
    var formattedStandings = [];
    for (var i = 0; i < standings.length; i++) {
      var team = standings[i];
      formattedStandings.push({
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
      });
    }

    // Send back in the format the frontend expects
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
// Returns match fixtures for a given competition.
// Use like: /api/football/fixtures?competition=premier-league
router.get("/fixtures", function (req, res) {
  try {
    // Get the competition from the URL query
    var competitionId = req.query.competition || req.query.leagueId || "premier-league";
    var competitionName = getCompetitionName(competitionId);

    // Load all fixtures from the JSON file
    var allFixtures = loadJSON("mockFixtures.json");

    // Find fixtures for the requested competition
    var fixtures = allFixtures[competitionName];

    // If no fixtures found, return empty
    if (!fixtures) {
      return res.json({ response: [] });
    }

    // Format each match into the structure the frontend expects
    var formattedFixtures = [];
    for (var i = 0; i < fixtures.length; i++) {
      var match = fixtures[i];
      formattedFixtures.push({
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
      });
    }

    res.json({ response: formattedFixtures });
  } catch (err) {
    console.error("Error loading fixtures:", err);
    res.status(500).json({ error: "Failed to load fixtures" });
  }
});

export default router;
