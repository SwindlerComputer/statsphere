// ========================================
// exportBallonDorTrainingData.js (student-level)
// ========================================
// SIMPLE IDEA: Read all players from JSON. For each player we add a "Ballon d'Or score"
// (from a simple formula). We write one row per player to a CSV so Python can train on it.
//
// Run:  node scripts/exportBallonDorTrainingData.js   (from backend folder)
// Output: backend/data/ballondor_train.csv

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// PATHS
// ========================================
const PLAYERS_PATH = path.join(__dirname, "..", "data", "mockPlayers.json");
const CSV_PATH = path.join(__dirname, "..", "data", "ballondor_train.csv");

// ========================================
// LEAGUE STRENGTH LOOKUP
// ========================================
// Higher = stronger league. Affects Ballon d'Or chances.
const LEAGUE_STRENGTH = {
  "Premier League": 1.0,
  "La Liga": 0.95,
  "Serie A": 0.9,
  "Bundesliga": 0.9,
  "Ligue 1": 0.85,
  "Saudi Pro League": 0.7,
};

// ========================================
// TEAM TROPHIES (2025-26 season so far)
// ========================================
// How many trophies the team has won this season (domestic cups, super cups, etc.)
const TEAM_TROPHIES = {
  "Real Madrid": 1,
  "Barcelona": 0,
  "Manchester City": 0,
  "Arsenal": 0,
  "Liverpool": 1,
  "Chelsea": 0,
  "Bayern Munich": 0,
  "Borussia Dortmund": 0,
  "Inter Milan": 1,
  "AC Milan": 0,
  "Juventus": 0,
  "Napoli": 0,
  "Paris Saint-Germain": 1,
  "Manchester United": 0,
  "Tottenham": 0,
  "Aston Villa": 0,
  "Atletico Madrid": 0,
  "Bayer Leverkusen": 0,
  "Everton": 0,
  "Al Nassr": 0,
  "Al Hilal": 1,
  "Al Ittihad": 0,
};

// ========================================
// UCL STAGE SCORE
// ========================================
// 0 = not in UCL, 1 = group stage exit, 2 = playoff round,
// 3 = Round of 16, 4 = Quarter-final, 5 = Semi-final, 6 = Winner
const UCL_STAGE = {
  "Liverpool": 3,
  "Barcelona": 3,
  "Arsenal": 3,
  "Inter Milan": 3,
  "Bayern Munich": 3,
  "Real Madrid": 3,
  "Paris Saint-Germain": 3,
  "Borussia Dortmund": 3,
  "Atletico Madrid": 2,
  "AC Milan": 2,
  "Manchester City": 2,
  "Juventus": 1,
  "Napoli": 1,
  "Aston Villa": 1,
  "Chelsea": 1,
  "Everton": 0,
};

// ========================================
// Our "label" for training: a simple score formula
// ========================================
// We need one number per player for the model to learn from. We use a simple formula:
// score = goals×4 + assists×3 + rating×10 + ... + team_trophies×15 + ucl×8 + league×20 + goals-per-90 bonus
function computeBallonDorScore(p) {
  var score = 0;
  score += (p.goals || 0) * 4;
  score += (p.assists || 0) * 3;
  score += (p.avg_rating || 0) * 10;
  score += (p.shots_on_target || 0) * 0.3;
  score += (p.key_passes || 0) * 0.5;
  score += (p.dribbles_completed || 0) * 0.3;
  score += (p.tackles || 0) * 0.2;
  score += (p.interceptions || 0) * 0.2;
  score += (p.clean_sheets || 0) * 2;
  score += (p.team_trophies || 0) * 15;
  score += (p.ucl_stage_score || 0) * 8;
  score += (p.league_strength || 0.8) * 20;

  // Goals-per-90 bonus (rewards consistent scorers)
  if (p.minutes > 0) {
    var gp90 = (p.goals / p.minutes) * 90;
    score += gp90 * 30;
  }

  return Math.round(score * 100) / 100;
}

// ========================================
// MAIN: Read players, compute features, write CSV
// ========================================
console.log("Reading players from:", PLAYERS_PATH);
var raw = fs.readFileSync(PLAYERS_PATH, "utf8");
var players = JSON.parse(raw);
console.log("Loaded", players.length, "players");

// CSV header row
var columns = [
  "id", "name", "goals", "assists", "minutes", "avg_rating",
  "shots_on_target", "key_passes", "dribbles_completed",
  "tackles", "interceptions", "clean_sheets",
  "team_trophies", "ucl_stage_score", "league_strength",
  "ballondor_score"
];

var rows = [columns.join(",")];

for (var i = 0; i < players.length; i++) {
  var p = players[i];

  // Map existing JSON fields to CSV column names
  var mapped = {
    id: p.id,
    name: p.name,
    goals: p.goals || 0,
    assists: p.assists || 0,
    minutes: p.minutesPlayed || 0,
    avg_rating: p.rating || 0,
    shots_on_target: p.shotsOnTarget || 0,
    key_passes: p.keyPasses || 0,
    dribbles_completed: p.dribbles || 0,
    tackles: p.tackles || 0,
    interceptions: p.interceptions || 0,
    clean_sheets: p.cleanSheets || 0,
    team_trophies: TEAM_TROPHIES[p.team] || 0,
    ucl_stage_score: UCL_STAGE[p.team] || 0,
    league_strength: LEAGUE_STRENGTH[p.league] || 0.8,
  };

  // Compute the target label
  mapped.ballondor_score = computeBallonDorScore(mapped);

  // Build CSV row (quote name in case it contains commas)
  var row = [
    mapped.id,
    '"' + mapped.name.replace(/"/g, '""') + '"',
    mapped.goals,
    mapped.assists,
    mapped.minutes,
    mapped.avg_rating,
    mapped.shots_on_target,
    mapped.key_passes,
    mapped.dribbles_completed,
    mapped.tackles,
    mapped.interceptions,
    mapped.clean_sheets,
    mapped.team_trophies,
    mapped.ucl_stage_score,
    mapped.league_strength,
    mapped.ballondor_score,
  ];

  rows.push(row.join(","));
}

fs.writeFileSync(CSV_PATH, rows.join("\n"), "utf8");
console.log("Wrote", players.length, "rows to:", CSV_PATH);
console.log("Done!");
