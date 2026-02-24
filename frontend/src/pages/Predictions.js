// ========================================
// Predictions.js - Match Outcome Predictor
// ========================================
// The user picks two teams (Team A = Home, Team B = Away).
// The backend uses a weighted formula to predict:
//   - Who will win
//   - The predicted score (e.g. 2-1)
//   - Win/Draw/Loss percentages
//   - A full breakdown of how it calculated the result
//
// THE PREDICTION MODEL USES:
//   1. Attack strength (how good the team is at scoring)
//   2. Defense weakness (how easy it is to score against them)
//   3. League weight (Premier League = 1.0, Saudi = 0.7, etc.)
//   4. Form rating (how well the team has been playing recently)
//   5. Home advantage (Team A gets a 10% boost)
//   6. Average goals per match (2.7 in real football)
// ========================================

import { useEffect, useState } from "react";

var API_BASE = process.env.REACT_APP_API_URL;

export default function Predictions() {
  // Store all teams loaded from backend
  var [teams, setTeams] = useState([]);
  // Store the selected team names
  var [teamAName, setTeamAName] = useState("");
  var [teamBName, setTeamBName] = useState("");
  // Store the prediction result from the backend
  var [result, setResult] = useState(null);
  // Loading state
  var [loading, setLoading] = useState(false);

  // Fetch teams when the page loads
  useEffect(function () {
    fetch(API_BASE + "/api/prediction-teams")
      .then(function (res) { return res.json(); })
      .then(function (data) { setTeams(data); })
      .catch(function (err) { console.error("Failed to load teams:", err); });
  }, []);

  // Get unique leagues from the teams for grouping
  function getLeagues() {
    var leagueList = [];
    for (var i = 0; i < teams.length; i++) {
      var league = teams[i].league;
      if (leagueList.indexOf(league) === -1) {
        leagueList.push(league);
      }
    }
    return leagueList;
  }

  // Get teams for a specific league
  function getTeamsInLeague(league) {
    var leagueTeams = [];
    for (var i = 0; i < teams.length; i++) {
      if (teams[i].league === league) {
        leagueTeams.push(teams[i]);
      }
    }
    return leagueTeams;
  }

  // Handle the Predict button click
  function handlePredict() {
    // Check that two different teams are selected
    if (!teamAName || !teamBName) {
      alert("Please select both teams.");
      return;
    }
    if (teamAName === teamBName) {
      alert("Please select two DIFFERENT teams.");
      return;
    }

    // Find the full team objects from the array
    var teamAData = null;
    var teamBData = null;
    for (var i = 0; i < teams.length; i++) {
      if (teams[i].name === teamAName) teamAData = teams[i];
      if (teams[i].name === teamBName) teamBData = teams[i];
    }

    if (!teamAData || !teamBData) {
      alert("Could not find team data.");
      return;
    }

    // Show loading
    setLoading(true);
    setResult(null);

    // Send both teams to the backend for prediction
    fetch(API_BASE + "/api/predict-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamA: teamAData, teamB: teamBData })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        setResult(data);
        setLoading(false);
      })
      .catch(function (err) {
        console.error("Prediction error:", err);
        setLoading(false);
      });
  }

  // Get the league weight display text
  function getLeagueWeightText(weight) {
    if (weight === 1.0) return "1.0 (Hardest)";
    if (weight === 0.95) return "0.95";
    if (weight === 0.9) return "0.9";
    if (weight === 0.85) return "0.85";
    if (weight === 0.7) return "0.7 (Weakest)";
    return String(weight);
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-2">
      <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-2 text-center">
        Match Outcome Predictor
      </h1>
      <p className="text-gray-400 text-center mb-6 text-sm sm:text-base">
        Pick two teams. Team A is the Home team (gets home advantage).
      </p>

      {/* How it works summary */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">How the Prediction Works:</h3>
        <p className="text-xs text-gray-400">
          Expected Goals = (Attack Strength x Opponent Defense Weakness x 2.7) x Form Bonus x Home Boost
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Attack Strength = (Attack Rating / 100) x League Weight.
          Defense Weakness = 1 - (Defense Rating / 100).
          Home team gets a 10% boost.
        </p>
      </div>

      {/* Team Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 items-end">
        {/* Team A (Home) */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Team A (Home)</label>
          <select
            value={teamAName}
            onChange={function (e) { setTeamAName(e.target.value); setResult(null); }}
            className="w-full p-2 sm:p-3 bg-gray-800 rounded border border-gray-600 text-sm sm:text-base"
          >
            <option value="">Select Team A</option>
            {getLeagues().map(function (league) {
              return (
                <optgroup key={league} label={league}>
                  {getTeamsInLeague(league).map(function (t) {
                    return <option key={t.id} value={t.name}>{t.name}</option>;
                  })}
                </optgroup>
              );
            })}
          </select>
        </div>

        {/* VS label */}
        <div className="text-center">
          <span className="text-gray-500 font-bold text-xl">VS</span>
        </div>

        {/* Team B (Away) */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Team B (Away)</label>
          <select
            value={teamBName}
            onChange={function (e) { setTeamBName(e.target.value); setResult(null); }}
            className="w-full p-2 sm:p-3 bg-gray-800 rounded border border-gray-600 text-sm sm:text-base"
          >
            <option value="">Select Team B</option>
            {getLeagues().map(function (league) {
              return (
                <optgroup key={league} label={league}>
                  {getTeamsInLeague(league).map(function (t) {
                    return <option key={t.id} value={t.name}>{t.name}</option>;
                  })}
                </optgroup>
              );
            })}
          </select>
        </div>
      </div>

      {/* Predict Button */}
      <div className="text-center mb-8">
        <button
          onClick={handlePredict}
          disabled={loading}
          className={
            "px-8 py-3 rounded font-semibold transition text-sm sm:text-base " +
            (loading ? "bg-gray-600 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-600")
          }
        >
          {loading ? "Calculating..." : "Predict Match"}
        </button>
      </div>

      {/* ========================================
          PREDICTION RESULTS
          ======================================== */}
      {result && (
        <div className="space-y-4">

          {/* Main result card */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 text-center">
            <p className="text-sm text-gray-400 mb-2">Predicted Winner</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-3">
              {result.prediction}
            </h2>

            {/* Predicted Score */}
            <div className="bg-gray-700 rounded-lg p-4 inline-block mb-4">
              <p className="text-xs text-gray-400 mb-1">Predicted Score</p>
              <p className="text-3xl sm:text-4xl font-bold">
                <span className="text-white">{result.teamA.name}</span>
                <span className="text-yellow-400 mx-3">{result.predictedScore}</span>
                <span className="text-white">{result.teamB.name}</span>
              </p>
            </div>

            {/* Win/Draw/Loss Percentages */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-xs text-gray-400">{result.teamA.name} Win</p>
                <p className={"text-xl sm:text-2xl font-bold " + (result.probabilities.winA > result.probabilities.winB ? "text-green-400" : "text-gray-300")}>
                  {result.probabilities.winA}%
                </p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-xs text-gray-400">Draw</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-400">
                  {result.probabilities.draw}%
                </p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-xs text-gray-400">{result.teamB.name} Win</p>
                <p className={"text-xl sm:text-2xl font-bold " + (result.probabilities.winB > result.probabilities.winA ? "text-green-400" : "text-gray-300")}>
                  {result.probabilities.winB}%
                </p>
              </div>
            </div>

            {/* Probability bar */}
            <div className="mt-4">
              <div className="w-full h-4 rounded-full overflow-hidden flex">
                <div
                  className="bg-green-500 h-full"
                  style={{ width: result.probabilities.winA + "%" }}
                ></div>
                <div
                  className="bg-yellow-500 h-full"
                  style={{ width: result.probabilities.draw + "%" }}
                ></div>
                <div
                  className="bg-red-500 h-full"
                  style={{ width: result.probabilities.winB + "%" }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{result.teamA.name}</span>
                <span>Draw</span>
                <span>{result.teamB.name}</span>
              </div>
            </div>
          </div>

          {/* Expected Goals */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Expected Goals (xG)</h3>
            <p className="text-xs text-gray-500 mb-3">
              Expected goals is how many goals the model thinks each team will score.
              Based on their attack, the opponent's defense, form, and league strength.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 p-3 rounded text-center">
                <p className="text-sm text-gray-400">{result.teamA.name}</p>
                <p className="text-2xl font-bold text-green-400">{result.expectedGoals.teamA}</p>
                <p className="text-xs text-gray-500">expected goals</p>
              </div>
              <div className="bg-gray-700 p-3 rounded text-center">
                <p className="text-sm text-gray-400">{result.teamB.name}</p>
                <p className="text-2xl font-bold text-green-400">{result.expectedGoals.teamB}</p>
                <p className="text-xs text-gray-500">expected goals</p>
              </div>
            </div>
          </div>

          {/* Team Stats Comparison */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Team Ratings</h3>
            <div className="space-y-3">
              {/* Attack */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{result.teamA.attack}</span>
                  <span className="text-gray-400">Attack</span>
                  <span className="text-gray-300">{result.teamB.attack}</span>
                </div>
                <div className="flex gap-1 h-3">
                  <div className="flex-1 bg-gray-700 rounded-l overflow-hidden flex justify-end">
                    <div className="bg-cyan-500 h-full rounded-l" style={{ width: result.teamA.attack + "%" }}></div>
                  </div>
                  <div className="flex-1 bg-gray-700 rounded-r overflow-hidden">
                    <div className="bg-red-500 h-full rounded-r" style={{ width: result.teamB.attack + "%" }}></div>
                  </div>
                </div>
              </div>
              {/* Defense */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{result.teamA.defense}</span>
                  <span className="text-gray-400">Defense</span>
                  <span className="text-gray-300">{result.teamB.defense}</span>
                </div>
                <div className="flex gap-1 h-3">
                  <div className="flex-1 bg-gray-700 rounded-l overflow-hidden flex justify-end">
                    <div className="bg-cyan-500 h-full rounded-l" style={{ width: result.teamA.defense + "%" }}></div>
                  </div>
                  <div className="flex-1 bg-gray-700 rounded-r overflow-hidden">
                    <div className="bg-red-500 h-full rounded-r" style={{ width: result.teamB.defense + "%" }}></div>
                  </div>
                </div>
              </div>
              {/* Form */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{result.teamA.form}</span>
                  <span className="text-gray-400">Form</span>
                  <span className="text-gray-300">{result.teamB.form}</span>
                </div>
                <div className="flex gap-1 h-3">
                  <div className="flex-1 bg-gray-700 rounded-l overflow-hidden flex justify-end">
                    <div className="bg-cyan-500 h-full rounded-l" style={{ width: result.teamA.form + "%" }}></div>
                  </div>
                  <div className="flex-1 bg-gray-700 rounded-r overflow-hidden">
                    <div className="bg-red-500 h-full rounded-r" style={{ width: result.teamB.form + "%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Calculation Breakdown */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Full Calculation Breakdown</h3>
            <p className="text-xs text-gray-500 mb-3">Step-by-step how the prediction was calculated</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400">
                    <th className="p-2 text-left">Step</th>
                    <th className="p-2 text-center">{result.teamA.name}</th>
                    <th className="p-2 text-center">{result.teamB.name}</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-700">
                    <td className="p-2">League</td>
                    <td className="p-2 text-center">{result.teamA.league}</td>
                    <td className="p-2 text-center">{result.teamB.league}</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="p-2">League Weight</td>
                    <td className="p-2 text-center text-yellow-400">{getLeagueWeightText(result.breakdown.leagueWeightA)}</td>
                    <td className="p-2 text-center text-yellow-400">{getLeagueWeightText(result.breakdown.leagueWeightB)}</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="p-2">Attack Strength</td>
                    <td className="p-2 text-center">{result.breakdown.attackStrengthA}</td>
                    <td className="p-2 text-center">{result.breakdown.attackStrengthB}</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="p-2">Opp. Defense Weakness</td>
                    <td className="p-2 text-center">{result.breakdown.defenseWeaknessB}</td>
                    <td className="p-2 text-center">{result.breakdown.defenseWeaknessA}</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="p-2">Form Bonus</td>
                    <td className="p-2 text-center">{result.breakdown.formBonusA}</td>
                    <td className="p-2 text-center">{result.breakdown.formBonusB}</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="p-2">Home Boost</td>
                    <td className="p-2 text-center text-green-400">x {result.breakdown.homeBoost} (Home)</td>
                    <td className="p-2 text-center text-gray-500">x 1.0 (Away)</td>
                  </tr>
                  <tr className="border-b border-gray-700 font-bold">
                    <td className="p-2">Expected Goals</td>
                    <td className="p-2 text-center text-green-400">{result.expectedGoals.teamA}</td>
                    <td className="p-2 text-center text-green-400">{result.expectedGoals.teamB}</td>
                  </tr>
                  <tr className="font-bold">
                    <td className="p-2">Win Probability</td>
                    <td className="p-2 text-center text-cyan-400">{result.probabilities.winA}%</td>
                    <td className="p-2 text-center text-cyan-400">{result.probabilities.winB}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* League Weights Reference */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-3">League Weights Reference</h3>
            <p className="text-xs text-gray-500 mb-3">
              Teams from harder leagues get a higher weight, meaning their stats count for more.
              For example, an 85-rated attack in the Premier League is worth more than an 85-rated attack in the Saudi Pro League.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              <div className="bg-gray-700 p-2 rounded">
                <p className="text-gray-400 text-xs">Premier League</p>
                <p className="font-bold text-green-400">1.0</p>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <p className="text-gray-400 text-xs">La Liga</p>
                <p className="font-bold">0.95</p>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <p className="text-gray-400 text-xs">Serie A / Bundesliga</p>
                <p className="font-bold">0.9</p>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <p className="text-gray-400 text-xs">Ligue 1</p>
                <p className="font-bold">0.85</p>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <p className="text-gray-400 text-xs">Saudi Pro League</p>
                <p className="font-bold text-red-400">0.7</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="bg-gray-800 rounded-lg p-6 sm:p-8 text-center text-gray-400">
          <p className="text-lg mb-2">Select two teams and click Predict</p>
          <p className="text-sm">Team A is the Home team and gets a 10% goal boost</p>
        </div>
      )}
    </div>
  );
}
