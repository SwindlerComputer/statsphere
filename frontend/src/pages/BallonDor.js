// ========================================
// BallonDor.js - Ballon d'Or Predictor (Top 10)
// ========================================
// This page predicts who might win the Ballon d'Or.
// It supports two modes:
//   1. Rule-Based: simple weighted formula (runs in browser)
//   2. ML Ranking: calls backend Python RandomForest model
//
// HOW THE RULE-BASED SCORING WORKS:
// Each player gets points for goals, assists, rating, etc.
// The points are multiplied by a "league weight" so that
// scoring in harder leagues (like Premier League) counts more.

import { useEffect, useState } from "react";

// API_BASE = backend URL from .env file
const API_BASE = process.env.REACT_APP_API_URL;

// ========================================
// League Weights - How strong each league is
// ========================================
var leagueWeights = {
  "Premier League": 1.0,
  "La Liga": 0.95,
  "Serie A": 0.9,
  "Bundesliga": 0.9,
  "Ligue 1": 0.85,
  "Super Lig": 0.75,
  "Saudi Pro League": 0.7
};

// ========================================
// Team UCL stage scores (Feb 2026 snapshot)
// ========================================
var teamUCLStage = {
  "Liverpool": 3, "Barcelona": 3, "Arsenal": 3, "Inter Milan": 3,
  "Bayern Munich": 3, "Real Madrid": 3, "Paris Saint-Germain": 3,
  "Borussia Dortmund": 3, "Atletico Madrid": 2, "AC Milan": 2,
  "Manchester City": 2, "Juventus": 1, "Napoli": 1,
  "Aston Villa": 1, "Chelsea": 1, "Everton": 0
};

// ========================================
// Team trophies this season
// ========================================
var teamTrophies = {
  "Real Madrid": 1, "Liverpool": 1, "Inter Milan": 1,
  "Paris Saint-Germain": 1, "Al Hilal": 1, "Everton": 0
};

// ========================================
// Calculate a Ballon d'Or score for one player (rule-based)
// ========================================
function calculateScore(player) {
  var weight = leagueWeights[player.league] || 0.8;

  var goalsPer90 = 0;
  if (player.minutesPlayed > 0) {
    goalsPer90 = (player.goals / player.minutesPlayed) * 90;
  }

  var points = 0;
  points = points + (player.goals * 4);
  points = points + (player.assists * 3);
  points = points + (player.rating * 10);
  points = points + (player.keyPasses * 0.5);
  points = points + (goalsPer90 * 50);

  var finalScore = points * weight;
  finalScore = Math.round(finalScore * 10) / 10;

  return finalScore;
}

// ========================================
// Map a player object to the ML feature format
// ========================================
function playerToMLFeatures(player) {
  return {
    id: player.id,
    goals: player.goals || 0,
    assists: player.assists || 0,
    minutes: player.minutesPlayed || 0,
    avg_rating: player.rating || 0,
    shots_on_target: player.shotsOnTarget || 0,
    key_passes: player.keyPasses || 0,
    dribbles_completed: player.dribbles || 0,
    tackles: player.tackles || 0,
    interceptions: player.interceptions || 0,
    clean_sheets: player.cleanSheets || 0,
    team_trophies: teamTrophies[player.team] || 0,
    ucl_stage_score: teamUCLStage[player.team] || 0,
    league_strength: leagueWeights[player.league] || 0.8,
  };
}

export default function BallonDor() {
  var [top10, setTop10] = useState([]);
  var [loading, setLoading] = useState(true);
  // "rule" = rule-based scoring, "ml" = ML model scoring
  var [mode, setMode] = useState("rule");
  var [mlError, setMlError] = useState(null);
  var [mlMeta, setMlMeta] = useState(null);
  var [allPlayers, setAllPlayers] = useState([]);

  // ========================================
  // Fetch all players once on mount
  // ========================================
  useEffect(function () {
    fetch(API_BASE + "/api/insights/players")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        setAllPlayers(data);
        runRuleBased(data);
      })
      .catch(function (err) {
        console.error("Error loading players:", err);
        setLoading(false);
      });
  }, []);

  // ========================================
  // Re-run scoring when mode changes
  // ========================================
  useEffect(function () {
    if (allPlayers.length === 0) return;

    if (mode === "rule") {
      runRuleBased(allPlayers);
    } else {
      runMLRanking(allPlayers);
    }
  }, [mode, allPlayers]);

  // ========================================
  // Rule-based scoring (runs in browser)
  // ========================================
  function runRuleBased(players) {
    setLoading(true);
    setMlError(null);
    setMlMeta(null);

    var scored = [];
    for (var i = 0; i < players.length; i++) {
      var player = players[i];
      var score = calculateScore(player);
      scored.push({
        id: player.id,
        name: player.name,
        team: player.team,
        league: player.league,
        position: player.position,
        age: player.age,
        goals: player.goals,
        assists: player.assists,
        rating: player.rating,
        keyPasses: player.keyPasses,
        minutesPlayed: player.minutesPlayed,
        score: score
      });
    }

    scored.sort(function (a, b) { return b.score - a.score; });
    setTop10(scored.slice(0, 10));
    setLoading(false);
  }

  // ========================================
  // ML-based scoring (calls backend Python model)
  // ========================================
  function runMLRanking(players) {
    setLoading(true);
    setMlError(null);
    setMlMeta(null);

    // Build feature array for all players
    var mlPlayers = players.map(playerToMLFeatures);

    fetch(API_BASE + "/api/ballondor/ml-rank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players: mlPlayers }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) {
            var msg = data.error || "ML request failed";
            if (data.details) msg += " — " + data.details;
            throw new Error(msg);
          }
          return data;
        });
      })
      .then(function (data) {
        if (data.error) {
          setMlError(data.details ? data.error + ": " + data.details : data.error);
          setLoading(false);
          return;
        }

        // Build a lookup map: id -> ml_score
        var scoreMap = {};
        for (var r = 0; r < data.results.length; r++) {
          scoreMap[data.results[r].id] = data.results[r].ml_score;
        }

        // Merge ml_score into player objects
        var scored = [];
        for (var i = 0; i < players.length; i++) {
          var player = players[i];
          scored.push({
            id: player.id,
            name: player.name,
            team: player.team,
            league: player.league,
            position: player.position,
            age: player.age,
            goals: player.goals,
            assists: player.assists,
            rating: player.rating,
            keyPasses: player.keyPasses,
            minutesPlayed: player.minutesPlayed,
            score: scoreMap[player.id] || 0
          });
        }

        scored.sort(function (a, b) { return b.score - a.score; });
        setTop10(scored.slice(0, 10));
        setMlMeta(data.meta || null);
        setLoading(false);
      })
      .catch(function (err) {
        console.error("ML ranking error:", err);
        setMlError("Failed to connect to ML backend. Is the server running? " + err.message);
        setLoading(false);
      });
  }

  function getMedal(rank) {
    if (rank === 1) return "\u{1F947}";
    if (rank === 2) return "\u{1F948}";
    if (rank === 3) return "\u{1F949}";
    return "#" + rank;
  }

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="w-full max-w-4xl px-2">
      <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-2 text-center">
        Ballon d'Or Predictor
      </h1>
      <p className="text-gray-400 text-center mb-4 text-sm sm:text-base">
        Top 10 candidates based on goals, assists, rating, and consistency
      </p>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-800 rounded-lg p-1 flex gap-1">
          <button
            onClick={function () { setMode("rule"); }}
            className={
              "px-4 py-2 rounded-lg text-sm font-semibold transition " +
              (mode === "rule"
                ? "bg-cyan-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700")
            }
          >
            Rule-Based
          </button>
          <button
            onClick={function () { setMode("ml"); }}
            className={
              "px-4 py-2 rounded-lg text-sm font-semibold transition " +
              (mode === "ml"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700")
            }
          >
            ML Ranking
          </button>
        </div>
      </div>

      {/* Formula explanation */}
      {mode === "rule" && (
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-6">
          <h3 className="text-base font-semibold text-gray-300 mb-2">How the Score Works:</h3>
          <p className="text-xs sm:text-sm text-gray-400 mb-2">
            Score = [(Goals x 4) + (Assists x 3) + (Rating x 10) + (Key Passes x 0.5) + (Goals/90 x 50)] x League Weight
          </p>
          <p className="text-xs text-gray-500">
            League Weights: PL = 1.0, La Liga = 0.95, Serie A &amp; Bundesliga = 0.9, Ligue 1 = 0.85, Saudi Pro League = 0.7
          </p>
        </div>
      )}

      {mode === "ml" && (
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-6 border border-purple-700">
          <h3 className="text-base font-semibold text-purple-300 mb-2">ML Model (RandomForest)</h3>
          <p className="text-xs sm:text-sm text-gray-400 mb-2">
            A RandomForestRegressor trained on 13 features including goals, assists, rating, team trophies, UCL progress, and league strength.
          </p>
          {mlMeta && mlMeta.metrics && (
            <div className="flex gap-4 text-xs text-gray-500 mt-2">
              <span>MAE: <strong className="text-gray-300">{mlMeta.metrics.mae}</strong></span>
              <span>R²: <strong className="text-gray-300">{mlMeta.metrics.r2}</strong></span>
              <span>Trained: <strong className="text-gray-300">{mlMeta.trained_at ? mlMeta.trained_at.split("T")[0] : "unknown"}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* ML Error */}
      {mlError && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
          <p className="font-semibold">ML Error</p>
          <p>{mlError}</p>
          <p className="text-xs text-red-400 mt-1">
            Make sure the backend is running and the model has been trained (npm run ml:ballondor).
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">
            {mode === "ml" ? "Running ML predictions..." : "Loading players..."}
          </p>
        </div>
      )}

      {/* Top 10 Cards */}
      {!loading && top10.length > 0 && (
        <div className="space-y-4 mb-6">
          {top10.map(function (player, index) {
            var rank = index + 1;
            var isTopThree = rank <= 3;
            var borderColor = mode === "ml" ? "border-purple-500" : "border-yellow-500";

            return (
              <div
                key={player.id}
                className={
                  "bg-gray-800 rounded-lg p-4 shadow-lg " +
                  (isTopThree ? "border " + borderColor : "")
                }
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <span className={isTopThree ? "text-2xl font-bold" : "text-lg font-bold text-gray-400"}>
                      {getMedal(rank)}
                    </span>
                    <div>
                      <p className={isTopThree ? "text-lg font-bold text-cyan-400" : "font-semibold"}>
                        {player.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {player.team} · {player.league} · {player.position}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={isTopThree
                      ? "text-2xl font-bold " + (mode === "ml" ? "text-purple-400" : "text-green-400")
                      : "text-xl font-bold text-gray-300"
                    }>
                      {player.score}
                    </p>
                    <p className="text-xs text-gray-500">
                      {mode === "ml" ? "ml score" : "points"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-300 mt-2 pt-2 border-t border-gray-700">
                  <span>Goals: <strong className="text-green-400">{player.goals}</strong></span>
                  <span>Assists: <strong className="text-blue-400">{player.assists}</strong></span>
                  <span>Rating: <strong className="text-yellow-400">{player.rating}</strong></span>
                  <span>Key Passes: <strong className="text-purple-400">{player.keyPasses}</strong></span>
                  <span>Age: {player.age}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Score breakdown for #1 player (rule-based mode) */}
      {!loading && top10.length > 0 && mode === "rule" && (
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-cyan-400 mb-4">
            Why {top10[0].name} is #1
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400 text-xs">Goals Points</p>
              <p className="text-lg font-bold">{top10[0].goals} x 4 = {top10[0].goals * 4}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400 text-xs">Assists Points</p>
              <p className="text-lg font-bold">{top10[0].assists} x 3 = {top10[0].assists * 3}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400 text-xs">Rating Points</p>
              <p className="text-lg font-bold">{top10[0].rating} x 10 = {(top10[0].rating * 10).toFixed(1)}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400 text-xs">League Weight</p>
              <p className="text-lg font-bold">{leagueWeights[top10[0].league] || 0.8}</p>
            </div>
          </div>
          <div className="mt-3 bg-gray-700 p-3 rounded">
            <p className="text-gray-400 text-xs">Final Score</p>
            <p className="text-xl font-bold text-green-400">{top10[0].score} points</p>
          </div>
        </div>
      )}

      {/* ML model info for #1 player */}
      {!loading && top10.length > 0 && mode === "ml" && mlMeta && (
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-purple-700">
          <h3 className="text-base sm:text-lg font-semibold text-purple-300 mb-3">
            ML Model Details
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400 text-xs">Model Type</p>
              <p className="font-bold">{mlMeta.model_type}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400 text-xs">Features Used</p>
              <p className="font-bold">{mlMeta.features_used ? mlMeta.features_used.length : "?"}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400 text-xs">MAE (avg error)</p>
              <p className="font-bold text-yellow-400">{mlMeta.metrics.mae}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400 text-xs">R² (accuracy)</p>
              <p className="font-bold text-green-400">{mlMeta.metrics.r2}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
