// ========================================
// generateMlScoresPrecomputed.js (student-level)
// ========================================
// SIMPLE IDEA: We run the Python model once on all 200 players and save the scores to a JSON file.
// The live server then just reads that file (no Python needed on the server).
//
// Run:  node scripts/generateMlScoresPrecomputed.js   (from backend folder)
// Output: backend/data/ml_scores_precomputed.json
// Do this AFTER: npm run ml:ballondor

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLAYERS_PATH = path.join(__dirname, "..", "data", "mockPlayers.json");
const OUTPUT_PATH = path.join(__dirname, "..", "data", "ml_scores_precomputed.json");
const SCRIPT_PATH = path.resolve(__dirname, "..", "ml", "predict_ballondor.py");

const LEAGUE_STRENGTH = {
  "Premier League": 1.0, "La Liga": 0.95, "Serie A": 0.9, "Bundesliga": 0.9,
  "Ligue 1": 0.85, "Saudi Pro League": 0.7,
};
const TEAM_TROPHIES = {
  "Real Madrid": 1, "Liverpool": 1, "Inter Milan": 1, "Paris Saint-Germain": 1,
  "Al Hilal": 1, "Everton": 0,
};
const UCL_STAGE = {
  "Liverpool": 3, "Barcelona": 3, "Arsenal": 3, "Inter Milan": 3,
  "Bayern Munich": 3, "Real Madrid": 3, "Paris Saint-Germain": 3,
  "Borussia Dortmund": 3, "Atletico Madrid": 2, "AC Milan": 2,
  "Manchester City": 2, "Juventus": 1, "Napoli": 1, "Aston Villa": 1,
  "Chelsea": 1, "Everton": 0,
};

function playerToMLFeatures(p) {
  return {
    id: p.id,
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
}

console.log("Loading players from:", PLAYERS_PATH);
const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, "utf8"));
const mlPlayers = players.map(playerToMLFeatures);

const pythonCmd = process.platform === "win32" ? "python" : "python3";
const child = spawn(pythonCmd, [SCRIPT_PATH], {
  cwd: path.resolve(__dirname, ".."),
  stdio: ["pipe", "pipe", "pipe"],
});

let stdout = "";
let stderr = "";

child.stdout.on("data", (d) => { stdout += d.toString(); });
child.stderr.on("data", (d) => { stderr += d.toString(); });

child.stdin.write(JSON.stringify({ players: mlPlayers }), "utf8");
child.stdin.end();

child.on("close", (code) => {
  if (code !== 0) {
    console.error("Python error:", stderr || stdout);
    process.exit(1);
  }
  try {
    const result = JSON.parse(stdout);
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), "utf8");
    console.log("Wrote", OUTPUT_PATH, "with", result.results?.length || 0, "scores");
  } catch (e) {
    console.error("Parse error:", e);
    process.exit(1);
  }
});

child.on("error", (err) => {
  console.error("Failed to run Python:", err.message);
  process.exit(1);
});
