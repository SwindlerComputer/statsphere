// ========================================
// Predictions.js - Match Winner Predictor
// ========================================
// User selects two teams from dropdowns, clicks Predict, and backend calculates
// a predicted winner based on team stats (attack, defense, form).
// Teams can be filtered by league/competition.

import { useEffect, useState } from "react";

// API_BASE = backend URL from .env file
const API_BASE = process.env.REACT_APP_API_URL;

export default function Predictions() {
  const [teams, setTeams] = useState([]);
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [result, setResult] = useState(null);

  // Fetch prediction teams when component mounts
  useEffect(function () {
    fetch(API_BASE + "/api/prediction-teams")
      .then(function (res) { return res.json(); })
      .then(function (data) { setTeams(data); })
      .catch(function (err) { console.error("Failed to load teams:", err); });
  }, []);

  // Predict match outcome
  function handlePredict() {
    if (!teamA || !teamB || teamA === teamB) {
      alert("Please select two different teams.");
      return;
    }

    var tA = teams.find(function (t) { return t.name === teamA; });
    var tB = teams.find(function (t) { return t.name === teamB; });

    fetch(API_BASE + "/api/predict-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamA: tA, teamB: tB }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) { setResult(data); })
      .catch(function (err) { console.error("Prediction error:", err); });
  }

  return (
    <div className="mt-10 sm:mt-20 text-white text-center w-full max-w-xl mx-auto px-2">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Match Outcome Predictor</h1>

      <p className="text-gray-400 text-sm mb-6">
        Select two teams and our AI will predict the winner based on attack, defense, and form ratings.
      </p>

      {/* Team Selection Dropdowns */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 mb-8">
        {/* Team A */}
        <select
          onChange={function (e) { setTeamA(e.target.value); }}
          className="p-3 bg-gray-800 rounded w-full sm:w-auto border border-gray-600"
        >
          <option value="">Select Team A</option>
          {teams.map(function (t) {
            return <option key={t.id} value={t.name}>{t.name}</option>;
          })}
        </select>

        <span className="text-gray-500 font-bold text-xl self-center">VS</span>

        {/* Team B */}
        <select
          onChange={function (e) { setTeamB(e.target.value); }}
          className="p-3 bg-gray-800 rounded w-full sm:w-auto border border-gray-600"
        >
          <option value="">Select Team B</option>
          {teams.map(function (t) {
            return <option key={t.id} value={t.name}>{t.name}</option>;
          })}
        </select>
      </div>

      {/* Predict Button */}
      <button
        onClick={handlePredict}
        className="w-full sm:w-auto px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded font-semibold transition"
      >
        Predict Match
      </button>

      {/* Result Section */}
      {result && (
        <div className="mt-10 bg-gray-800 p-6 rounded-lg w-full max-w-md mx-auto shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Prediction Result</h2>

          {/* Winner */}
          <p className="text-lg mb-2">
            <span className="text-cyan-400 font-bold">{result.prediction}</span> is likely to win
          </p>

          {/* Confidence */}
          <p className="text-sm text-gray-400 mb-4">
            Confidence: {result.confidence}
          </p>

          {/* Score Breakdown */}
          {result.details && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-sm text-gray-400">{teamA}</p>
                <p className="text-xl font-bold text-cyan-400">{result.details.teamA_score}</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-sm text-gray-400">{teamB}</p>
                <p className="text-xl font-bold text-cyan-400">{result.details.teamB_score}</p>
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              Formula: (Attack × 0.4) + (Defense × 0.3) + (Form × 5)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
