import { useEffect, useState } from "react";

export default function Predictions() {
  const [teams, setTeams] = useState([]);
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [result, setResult] = useState(null);

  // Load teams
  useEffect(() => {
    fetch("http://localhost:5000/api/prediction-teams")
      .then((res) => res.json())
      .then(setTeams)
      .catch(err => console.error("Failed to load teams:", err));
  }, []);

  const handlePredict = async () => {
    if (!teamA || !teamB || teamA === teamB) {
      alert("Please select two different teams.");
      return;
    }

    const tA = teams.find((t) => t.name === teamA);
    const tB = teams.find((t) => t.name === teamB);

    const res = await fetch("http://localhost:5000/api/predict-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamA: tA, teamB: tB }),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="mt-20 text-white text-center">
      <h1 className="text-3xl font-bold mb-6">🔮 Match Outcome Predictor</h1>

      {/* Dropdowns */}
      <div className="flex justify-center gap-6 mb-8">
        <select
          onChange={(e) => setTeamA(e.target.value)}
          className="p-3 bg-gray-800 rounded"
        >
          <option value="">Select Team A</option>
          {teams.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => setTeamB(e.target.value)}
          className="p-3 bg-gray-800 rounded"
        >
          <option value="">Select Team B</option>
          {teams.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handlePredict}
        className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded font-semibold"
      >
        Predict Match
      </button>

      {result && (
        <div className="mt-10 bg-gray-800 p-6 rounded-lg w-[450px] mx-auto shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Prediction Result</h2>
          <p className="text-lg">
            <span className="text-cyan-400">{result.prediction}</span> is likely to win.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Confidence: {result.confidence}
          </p>
        </div>
      )}
    </div>
  );
}
