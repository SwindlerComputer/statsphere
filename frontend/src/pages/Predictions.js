// ========================================
// Predictions.js - Match Winner Predictor
// ========================================
// User selects two teams from dropdowns, clicks Predict, and backend calculates
// a predicted winner based on team stats (attack, defense, form).

import { useEffect, useState } from "react";

// API_BASE = backend URL from .env file
const API_BASE = process.env.REACT_APP_API_URL;

export default function Predictions() {
  // State for teams list fetched from backend
  const [teams, setTeams] = useState([]);
  // State for selected Team A (user picks from dropdown)
  const [teamA, setTeamA] = useState("");
  // State for selected Team B (user picks from dropdown)
  const [teamB, setTeamB] = useState("");
  // State for prediction result from backend (null = no prediction yet)
  const [result, setResult] = useState(null);

  // Fetch prediction teams when component mounts
  useEffect(() => {
    // GET request to get list of teams for the dropdowns
    fetch(`${API_BASE}/api/prediction-teams`)
      .then((res) => res.json())  // Parse response as JSON
      .then(setTeams)  // Store teams array in state
      .catch(err => console.error("Failed to load teams:", err));
  }, []);

  // Main function: called when user clicks "Predict Match" button
  const handlePredict = async () => {
    // Validation: both teams must be selected and they must be different
    if (!teamA || !teamB || teamA === teamB) {
      alert("Please select two different teams.");
      return;
    }

    // Find the full team OBJECT by name (not just the name string)
    // teams.find() searches array and returns first match
    const tA = teams.find((t) => t.name === teamA);
    const tB = teams.find((t) => t.name === teamB);

    // POST request to backend with both full team objects
    // async/await makes it easier to wait for response before proceeding
    const res = await fetch(`${API_BASE}/api/predict-match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Send team objects with their stats (attack, defense, form)
      body: JSON.stringify({ teamA: tA, teamB: tB }),
    });

    // Parse response and store the prediction result
    const data = await res.json();
    setResult(data);  // This triggers a re-render, showing the result
  };

  return (
    <div className="mt-20 text-white text-center">
      <h1 className="text-3xl font-bold mb-6">🔮 Match Outcome Predictor</h1>

      {/* Dropdowns - Let user pick two teams */}
      <div className="flex justify-center gap-6 mb-8">
        {/* Team A Dropdown */}
        <select
          onChange={(e) => setTeamA(e.target.value)}
          className="p-3 bg-gray-800 rounded"
        >
          <option value="">Select Team A</option>
          {/* map() creates <option> for each team in teams array */}
          {teams.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Team B Dropdown */}
        <select
          onChange={(e) => setTeamB(e.target.value)}
          className="p-3 bg-gray-800 rounded"
        >
          <option value="">Select Team B</option>
          {/* map() creates <option> for each team in teams array */}
          {teams.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Predict Button - Calls handlePredict when clicked */}
      <button
        onClick={handlePredict}
        className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded font-semibold"
      >
        Predict Match
      </button>

      {/* Result Section - Only shows if result is not null (prediction received) */}
      {/* && operator: if result is truthy, show the div */}
      {result && (
        <div className="mt-10 bg-gray-800 p-6 rounded-lg w-[450px] mx-auto shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Prediction Result</h2>
          <p className="text-lg">
            {/* result.prediction = winner name from backend */}
            <span className="text-cyan-400">{result.prediction}</span> is likely to win.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {/* result.confidence = confidence percentage from backend */}
            Confidence: {result.confidence}
          </p>
        </div>
      )}
    </div>
  );
}
