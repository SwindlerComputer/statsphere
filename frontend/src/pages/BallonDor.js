// ========================================
// BallonDor.js - Ballon d'Or Predictor (Top 10)
// ========================================
// Ranks players by current-season stats (WhoScored-style).
// Loads all players from /api/insights/players, scores each with the formula below,
// then shows the top 10.
//
// HOW THE SCORING WORKS:
// Each player gets points for goals, assists, rating, etc.
// The points are multiplied by a "league weight" so that
// scoring in harder leagues (like Premier League) counts more.

import { useEffect, useState } from "react";

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
  "Saudi Pro League": 0.7,
  "Brazilian Serie A": 0.65
};

// ========================================
// Calculate a Ballon d'Or score for one player
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

export default function BallonDor() {
  var [top10, setTop10] = useState([]);
  var [loading, setLoading] = useState(true);

  // ========================================
  // Fetch players and calculate top 10
  // ========================================
  useEffect(function () {
    fetch(API_BASE + "/api/insights/players")
      .then(function (res) {
        return res.json();
      })
      .then(function (allPlayers) {
        var scored = [];
        for (var i = 0; i < allPlayers.length; i++) {
          var player = allPlayers[i];
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

        scored.sort(function (a, b) {
          return b.score - a.score;
        });

        var topTen = scored.slice(0, 10);
        setTop10(topTen);
        setLoading(false);
      })
      .catch(function (err) {
        console.error("Error loading players:", err);
        setLoading(false);
      });
  }, []);

  function getMedal(rank) {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "#" + rank;
  }

  // ========================================
  // RENDER THE PAGE
  // ========================================
  return (
    <div className="w-full max-w-4xl px-2">
      <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-2 text-center">
        Ballon d'Or Predictor
      </h1>
      <p className="text-gray-400 text-center mb-6 text-sm sm:text-base">
        Top 10 based on current season stats (WhoScored-style). Score uses goals, assists, rating, key passes, goals/90 and league weight.
      </p>

      {/* Explain the formula */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-6">
        <h3 className="text-base font-semibold text-gray-300 mb-2">How the Score Works:</h3>
        <p className="text-xs sm:text-sm text-gray-400 mb-2">
          Score = [(Goals x 4) + (Assists x 3) + (Rating x 10) + (Key Passes x 0.5) + (Goals/90 x 50)] x League Weight
        </p>
        <p className="text-xs text-gray-500">
          League Weights: PL = 1.0, La Liga = 0.95, Serie A &amp; Bundesliga = 0.9, Ligue 1 = 0.85, Super Lig = 0.75, Saudi Pro League = 0.7
        </p>
      </div>

      {/* Loading message */}
      {loading && (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">Loading players...</p>
        </div>
      )}

      {/* Top 10 Cards */}
      {!loading && top10.length > 0 && (
        <div className="space-y-4 mb-6">
          {top10.map(function (player, index) {
            var rank = index + 1;
            var isTopThree = rank <= 3;

            return (
              <div
                key={player.id}
                className={
                  "bg-gray-800 rounded-lg p-4 shadow-lg " +
                  (isTopThree ? "border border-yellow-500" : "")
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
                    <p className={isTopThree ? "text-2xl font-bold text-green-400" : "text-xl font-bold text-gray-300"}>
                      {player.score}
                    </p>
                    <p className="text-xs text-gray-500">points</p>
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

      {/* Score breakdown for #1 player */}
      {!loading && top10.length > 0 && (
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
    </div>
  );
}
