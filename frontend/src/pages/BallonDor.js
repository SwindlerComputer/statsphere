// ========================================
// BallonDor.js - Ballon d'Or Predictor
// ========================================
// This page predicts who might win the Ballon d'Or award.
// We calculate a score for each player based on their stats.
// The player with the highest score is ranked #1.

import { useEffect, useState } from "react";

// API_BASE = backend URL from .env file
const API_BASE = process.env.REACT_APP_API_URL;

export default function BallonDor() {
  // Store all players from the database
  const [players, setPlayers] = useState([]);
  // Store players after we add scores and sort them
  const [rankedPlayers, setRankedPlayers] = useState([]);

  // Fetch players when page loads
  useEffect(() => {
    fetch(`${API_BASE}/api/players`)
      .then((res) => res.json())
      .then((data) => setPlayers(data))
      .catch((err) => console.error("Error:", err));
  }, []);

  // ========================================
  // League Weights - How strong each league is
  // ========================================
  // Premier League is the hardest (1.0 = 100%)
  // Other leagues are slightly easier, so we reduce the score
  // This means scoring 20 goals in Saudi Pro League counts less than Premier League
  const leagueWeights = {
    "Premier League": 1.0,    // 100% - hardest league
    "La Liga": 0.95,          // 95%
    "Serie A": 0.9,           // 90%
    "Bundesliga": 0.9,        // 90%
    "Ligue 1": 0.85,          // 85%
    "Super Lig": 0.75,        // 75% - Turkish league
    "Saudi Pro League": 0.7   // 70% - easier league
  };

  // ========================================
  // calculateBallonDorScore Function
  // ========================================
  // Takes a player and returns a number (their score).
  // We multiply each stat by a "weight" to show importance.
  // Then we multiply by league weight to adjust for difficulty.
  //
  // Formula: Score = [(Goals x 4) + (Assists x 3) + (xG x 2) + (xA x 2) + (Goals/90 x 50)] x League Weight
  //
  function calculateBallonDorScore(player) {
    // Step 1: Get the league weight (default to 0.8 if league not found)
    let leagueWeight = leagueWeights[player.league];
    if (leagueWeight === undefined) {
      leagueWeight = 0.8; // Default for unknown leagues
    }

    // Step 2: Calculate points for each stat
    let goalsPoints = player.goals * 4;       // Goals are worth 4 points each
    let assistsPoints = player.assists * 3;   // Assists are worth 3 points each
    let xgPoints = player.xG * 2;             // Expected goals worth 2 points
    let xaPoints = player.xA * 2;             // Expected assists worth 2 points
    let consistencyPoints = player.per90.goals * 50;  // Goals per game worth 50 points

    // Step 3: Add all the points together
    let rawScore = goalsPoints + assistsPoints + xgPoints + xaPoints + consistencyPoints;

    // Step 4: Multiply by league weight
    // Example: 150 points in Saudi Pro League = 150 x 0.7 = 105 points
    let totalScore = rawScore * leagueWeight;

    // Step 5: Round to 1 decimal place
    totalScore = Math.round(totalScore * 10) / 10;

    return totalScore;
  }

  // When players load, calculate scores and sort
  useEffect(() => {
    // Don't run if no players yet
    if (players.length === 0) {
      return;
    }

    // Step 1: Add a score to each player
    let playersWithScores = [];
    for (let i = 0; i < players.length; i++) {
      let player = players[i];
      let score = calculateBallonDorScore(player);
      
      // Create new object with score added
      playersWithScores.push({
        ...player,
        ballonDorScore: score
      });
    }

    // Step 2: Sort by score (highest first)
    playersWithScores.sort(function(a, b) {
      return b.ballonDorScore - a.ballonDorScore;
    });

    // Step 3: Save the sorted list
    setRankedPlayers(playersWithScores);
  }, [players]);

  // Returns medal emoji for top 3, otherwise the number
  function getMedal(rank) {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  }

  return (
    <div className="w-full max-w-4xl">
      <h1 className="text-3xl font-bold text-cyan-400 mb-2 text-center">
        Ballon d'Or Predictor
      </h1>
      <p className="text-gray-400 text-center mb-6">
        Rankings based on goals, assists, xG, xA, and consistency
      </p>

      {/* Show the formula */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-2">How the Score is Calculated:</h3>
        <p className="text-sm text-gray-400 mb-2">
          Score = [(Goals × 4) + (Assists × 3) + (xG × 2) + (xA × 2) + (Goals/90 × 50)] × League Weight
        </p>
        <p className="text-xs text-gray-500">
          League Weights: Premier League (1.0), La Liga (0.95), Serie A (0.9), Bundesliga (0.9), Ligue 1 (0.85), Super Lig (0.75), Saudi Pro League (0.7)
        </p>
      </div>

      {/* Rankings Table */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-600 text-cyan-300">
              <th className="p-3 text-left">Rank</th>
              <th className="p-3 text-left">Player</th>
              <th className="p-3 text-left">Team</th>
              <th className="p-3 text-left">League</th>
              <th className="p-3 text-center">Goals</th>
              <th className="p-3 text-center">Assists</th>
              <th className="p-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {rankedPlayers.map((player, index) => {
              // index starts at 0, so rank = index + 1
              let rank = index + 1;
              let isTopThree = rank <= 3;

              return (
                <tr
                  key={player.id}
                  className="border-b border-gray-700 hover:bg-gray-700"
                >
                  <td className="p-3">
                    <span className={isTopThree ? "text-xl font-bold" : ""}>
                      {getMedal(rank)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={isTopThree ? "font-semibold text-cyan-400" : "font-semibold"}>
                      {player.name}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400">{player.team}</td>
                  <td className="p-3 text-gray-400">{player.league}</td>
                  <td className="p-3 text-center">{player.goals}</td>
                  <td className="p-3 text-center">{player.assists}</td>
                  <td className="p-3 text-right">
                    <span className={isTopThree ? "font-bold text-green-400" : "font-bold text-gray-300"}>
                      {player.ballonDorScore}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Show breakdown for #1 player */}
      {rankedPlayers.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">
            🏆 Why {rankedPlayers[0].name} is #1
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400">Goals</p>
              <p className="text-xl font-bold">{rankedPlayers[0].goals} × 4 = {rankedPlayers[0].goals * 4}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400">Assists</p>
              <p className="text-xl font-bold">{rankedPlayers[0].assists} × 3 = {rankedPlayers[0].assists * 3}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400">xG</p>
              <p className="text-xl font-bold">{rankedPlayers[0].xG} × 2 = {(rankedPlayers[0].xG * 2).toFixed(1)}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400">Consistency</p>
              <p className="text-xl font-bold">{rankedPlayers[0].per90.goals} × 50 = {(rankedPlayers[0].per90.goals * 50).toFixed(1)}</p>
            </div>
          </div>
          {/* League Weight Info */}
          <div className="mt-4 bg-gray-700 p-3 rounded">
            <p className="text-gray-400">League Weight ({rankedPlayers[0].league})</p>
            <p className="text-xl font-bold">
              Raw Score × {leagueWeights[rankedPlayers[0].league] || 0.8} = {rankedPlayers[0].ballonDorScore}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
