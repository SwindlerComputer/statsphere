// ========================================
// PlayerComparison.js - Compare Two Players
// ========================================
// This page allows users to select two players and compare their stats.
// The higher stat value is highlighted in green for easy comparison.

import { useEffect, useState } from "react";

// API_BASE = backend URL from .env file
const API_BASE = process.env.REACT_APP_API_URL;

export default function PlayerComparison() {
  // State to hold all players from backend
  const [players, setPlayers] = useState([]);
  // State for selected players (null means not selected yet)
  const [playerA, setPlayerA] = useState(null);
  const [playerB, setPlayerB] = useState(null);

  // Fetch players when component loads
  useEffect(() => {
    async function fetchPlayers() {
      try {
        const res = await fetch(`${API_BASE}/api/players`);
        const data = await res.json();
        setPlayers(data);
      } catch (err) {
        console.error("Error loading players:", err);
      }
    }
    fetchPlayers();
  }, []);

  // Handle dropdown selection for Player A
  const handleSelectA = (e) => {
    const id = parseInt(e.target.value);
    const selected = players.find((p) => p.id === id);
    setPlayerA(selected || null);
  };

  // Handle dropdown selection for Player B
  const handleSelectB = (e) => {
    const id = parseInt(e.target.value);
    const selected = players.find((p) => p.id === id);
    setPlayerB(selected || null);
  };

  // Compare two values and return which one is higher
  // Returns: "A" if valueA is higher, "B" if valueB is higher, "tie" if equal
  const compareStats = (valueA, valueB) => {
    if (valueA > valueB) return "A";
    if (valueB > valueA) return "B";
    return "tie";
  };

  // ========================================
  // getPlaystyle - Determine player's playing style
  // ========================================
  // This function looks at a player's stats and returns a label
  // describing how they play. It uses simple if/else logic.
  const getPlaystyle = (player) => {
    // Step 1: Calculate some useful numbers
    // goalsPerShot = what percentage of shots become goals
    const goalsPerShot = player.goals / player.shots;
    
    // assistRatio = what percentage of their output is assists
    const totalOutput = player.goals + player.assists;
    const assistRatio = player.assists / totalOutput;

    // Step 2: Check conditions from most specific to least specific

    // If player scores lots of goals efficiently = Clinical Finisher
    if (player.goals >= 15 && goalsPerShot > 0.2) {
      return "Clinical Finisher";
    }

    // If player has many assists and high expected assists = Creative Playmaker
    if (player.assists >= 10 && player.xA > 5) {
      return "Creative Playmaker";
    }

    // If player takes lots of shots but doesn't score much = High-Volume Shooter
    if (player.shots >= 60 && goalsPerShot < 0.15) {
      return "High-Volume Shooter";
    }

    // If more than half their output is assists = Team Playmaker
    if (assistRatio > 0.5) {
      return "Team Playmaker";
    }

    // If player scores often per 90 minutes = Direct Goal Scorer
    if (player.per90.goals >= 0.7) {
      return "Direct Goal Scorer";
    }

    // If player has decent goals AND assists = All-Round Attacker
    if (player.goals >= 8 && player.assists >= 5) {
      return "All-Round Attacker";
    }

    // Step 3: Default labels based on position
    if (player.position === "Forward") {
      return "Goal-Focused Forward";
    }
    
    if (player.position === "Midfielder") {
      return "Box-to-Box Midfielder";
    }

    // If nothing else matches
    return "Versatile Player";
  };

  // Render a single stat row with highlighting
  // statName: display name, valueA: player A's value, valueB: player B's value
  const StatRow = ({ statName, valueA, valueB }) => {
    const winner = compareStats(valueA, valueB);

    return (
      <div className="flex justify-between items-center py-2 border-b border-gray-700">
        {/* Player A value - green if higher */}
        <span className={`w-1/3 text-left ${winner === "A" ? "text-green-400 font-bold" : ""}`}>
          {valueA}
        </span>

        {/* Stat name in the middle */}
        <span className="w-1/3 text-center text-gray-400">{statName}</span>

        {/* Player B value - green if higher */}
        <span className={`w-1/3 text-right ${winner === "B" ? "text-green-400 font-bold" : ""}`}>
          {valueB}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl px-2">
      <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6 text-center">
        Player Comparison
      </h1>

      {/* Player Selection Dropdowns */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mb-8">
        {/* Player A Dropdown */}
        <div className="flex-1">
          <label className="block mb-2 text-sm text-gray-400">Select Player A</label>
          <select
            onChange={handleSelectA}
            className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:border-cyan-400 focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>Choose a player</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} ({player.team})
              </option>
            ))}
          </select>
        </div>

        {/* VS Label */}
        <div className="flex items-center justify-center sm:items-end sm:pb-3">
          <span className="text-2xl font-bold text-gray-500">VS</span>
        </div>

        {/* Player B Dropdown */}
        <div className="flex-1">
          <label className="block mb-2 text-sm text-gray-400">Select Player B</label>
          <select
            onChange={handleSelectB}
            className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:border-cyan-400 focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>Choose a player</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} ({player.team})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Results - Only show when both players are selected */}
      {playerA && playerB && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          {/* Player Names Header with Playstyle */}
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-600">
            <div className="w-1/3 text-left">
              <h2 className="text-xl font-bold text-cyan-400">{playerA.name}</h2>
              <p className="text-sm text-gray-400">{playerA.team}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-purple-600 text-white text-xs rounded-full">
                {getPlaystyle(playerA)}
              </span>
            </div>
            <div className="w-1/3 text-center">
              <span className="text-gray-500">Stats</span>
            </div>
            <div className="w-1/3 text-right">
              <h2 className="text-xl font-bold text-cyan-400">{playerB.name}</h2>
              <p className="text-sm text-gray-400">{playerB.team}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-purple-600 text-white text-xs rounded-full">
                {getPlaystyle(playerB)}
              </span>
            </div>
          </div>

          {/* Basic Info */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Basic Info</h3>
            <StatRow statName="Age" valueA={playerA.age} valueB={playerB.age} />
            <StatRow statName="Position" valueA={playerA.position} valueB={playerB.position} />
            <StatRow statName="League" valueA={playerA.league} valueB={playerB.league} />
          </div>

          {/* Season Stats */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Season Stats</h3>
            <StatRow statName="Goals" valueA={playerA.goals} valueB={playerB.goals} />
            <StatRow statName="Assists" valueA={playerA.assists} valueB={playerB.assists} />
            <StatRow statName="Shots" valueA={playerA.shots} valueB={playerB.shots} />
            <StatRow statName="Shots on Target" valueA={playerA.shotsOnTarget} valueB={playerB.shotsOnTarget} />
          </div>

          {/* Advanced Stats */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Advanced Stats</h3>
            <StatRow statName="xG (Expected Goals)" valueA={playerA.xG} valueB={playerB.xG} />
            <StatRow statName="xA (Expected Assists)" valueA={playerA.xA} valueB={playerB.xA} />
            <StatRow statName="npxG (Non-Penalty xG)" valueA={playerA.npxG} valueB={playerB.npxG} />
          </div>

          {/* Per 90 Stats */}
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Per 90 Minutes</h3>
            <StatRow statName="Goals/90" valueA={playerA.per90.goals} valueB={playerB.per90.goals} />
            <StatRow statName="Assists/90" valueA={playerA.per90.assists} valueB={playerB.per90.assists} />
            <StatRow statName="xG/90" valueA={playerA.per90.xG} valueB={playerB.per90.xG} />
            <StatRow statName="Shots/90" valueA={playerA.per90.shots} valueB={playerB.per90.shots} />
          </div>
        </div>
      )}

      {/* Message when players not selected */}
      {(!playerA || !playerB) && (
        <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
          <p>Select two players above to compare their stats</p>
        </div>
      )}
    </div>
  );
}

