// ========================================
// PlayerComparison.js - Compare Two Players
// ========================================
// This page allows users to select two players and compare their stats.
// The higher stat value is highlighted in green for easy comparison.
// Uses the 200-player mock dataset for a wide range of comparisons.

import { useEffect, useState } from "react";

// API_BASE = backend URL from .env file
const API_BASE = process.env.REACT_APP_API_URL;

export default function PlayerComparison() {
  // State to hold all players from backend
  const [players, setPlayers] = useState([]);
  // State for selected players (null means not selected yet)
  const [playerA, setPlayerA] = useState(null);
  const [playerB, setPlayerB] = useState(null);
  // Search filters for each dropdown
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");

  // Fetch the full 200-player mock dataset
  useEffect(function () {
    fetch(API_BASE + "/api/insights/players")
      .then(function (res) { return res.json(); })
      .then(function (data) { setPlayers(data); })
      .catch(function (err) { console.error("Error loading players:", err); });
  }, []);

  // Handle dropdown selection for Player A
  function handleSelectA(e) {
    var id = parseInt(e.target.value);
    var selected = players.find(function (p) { return p.id === id; });
    setPlayerA(selected || null);
  }

  // Handle dropdown selection for Player B
  function handleSelectB(e) {
    var id = parseInt(e.target.value);
    var selected = players.find(function (p) { return p.id === id; });
    setPlayerB(selected || null);
  }

  // Compare two values and return which one is higher
  function compareStats(valueA, valueB) {
    if (valueA > valueB) return "A";
    if (valueB > valueA) return "B";
    return "tie";
  }

  // ========================================
  // getPlaystyle - Determine player's playing style
  // ========================================
  function getPlaystyle(player) {
    if (player.position === "Goalkeeper") return "Shot Stopper";

    if (player.goals >= 15 && player.shots > 0 && (player.goals / player.shots) > 0.15) {
      return "Clinical Finisher";
    }
    if (player.assists >= 10 && player.keyPasses >= 40) {
      return "Creative Playmaker";
    }
    if (player.tackles >= 70 && player.interceptions >= 50) {
      return "Defensive Rock";
    }
    if (player.dribbles >= 60 && player.goals >= 8) {
      return "Skillful Attacker";
    }
    if (player.passes >= 1800 && player.position === "Midfielder") {
      return "Deep-Lying Playmaker";
    }
    if (player.goals >= 8 && player.assists >= 5) {
      return "All-Round Attacker";
    }
    if (player.position === "Forward") return "Goal-Focused Forward";
    if (player.position === "Midfielder") return "Box-to-Box Midfielder";
    if (player.position === "Defender") return "Solid Defender";
    return "Versatile Player";
  }

  // Filter players by search text
  var filteredA = players.filter(function (p) {
    return p.name.toLowerCase().includes(searchA.toLowerCase());
  });
  var filteredB = players.filter(function (p) {
    return p.name.toLowerCase().includes(searchB.toLowerCase());
  });

  // Render a single stat row with highlighting
  function StatRow({ statName, valueA, valueB }) {
    var winner = compareStats(valueA, valueB);
    return (
      <div className="flex justify-between items-center py-2 border-b border-gray-700">
        <span className={"w-1/3 text-left " + (winner === "A" ? "text-green-400 font-bold" : "")}>
          {valueA}
        </span>
        <span className="w-1/3 text-center text-gray-400">{statName}</span>
        <span className={"w-1/3 text-right " + (winner === "B" ? "text-green-400 font-bold" : "")}>
          {valueB}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl px-2">
      <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6 text-center">
        Player Comparison
      </h1>

      {/* Player Selection Dropdowns */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mb-8">
        {/* Player A */}
        <div className="flex-1">
          <label className="block mb-2 text-sm text-gray-400">Select Player A</label>
          <input
            type="text"
            placeholder="Search..."
            value={searchA}
            onChange={function (e) { setSearchA(e.target.value); }}
            className="w-full p-2 mb-2 rounded bg-gray-700 border border-gray-600 text-sm"
          />
          <select
            onChange={handleSelectA}
            className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:border-cyan-400 focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>Choose a player</option>
            {filteredA.map(function (player) {
              return (
                <option key={player.id} value={player.id}>
                  {player.name} ({player.team})
                </option>
              );
            })}
          </select>
        </div>

        {/* VS Label */}
        <div className="flex items-center justify-center sm:items-end sm:pb-3">
          <span className="text-2xl font-bold text-gray-500">VS</span>
        </div>

        {/* Player B */}
        <div className="flex-1">
          <label className="block mb-2 text-sm text-gray-400">Select Player B</label>
          <input
            type="text"
            placeholder="Search..."
            value={searchB}
            onChange={function (e) { setSearchB(e.target.value); }}
            className="w-full p-2 mb-2 rounded bg-gray-700 border border-gray-600 text-sm"
          />
          <select
            onChange={handleSelectB}
            className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:border-cyan-400 focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>Choose a player</option>
            {filteredB.map(function (player) {
              return (
                <option key={player.id} value={player.id}>
                  {player.name} ({player.team})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Comparison Results */}
      {playerA && playerB && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          {/* Player Names + Playstyle */}
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
            <StatRow statName="Rating" valueA={playerA.rating} valueB={playerB.rating} />
          </div>

          {/* Attacking Stats */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Attacking</h3>
            <StatRow statName="Goals" valueA={playerA.goals} valueB={playerB.goals} />
            <StatRow statName="Assists" valueA={playerA.assists} valueB={playerB.assists} />
            <StatRow statName="Shots" valueA={playerA.shots} valueB={playerB.shots} />
            <StatRow statName="Shots on Target" valueA={playerA.shotsOnTarget} valueB={playerB.shotsOnTarget} />
            <StatRow statName="Key Passes" valueA={playerA.keyPasses} valueB={playerB.keyPasses} />
            <StatRow statName="Dribbles" valueA={playerA.dribbles} valueB={playerB.dribbles} />
          </div>

          {/* Defensive / Passing Stats */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Defensive & Passing</h3>
            <StatRow statName="Passes" valueA={playerA.passes} valueB={playerB.passes} />
            <StatRow statName="Tackles" valueA={playerA.tackles} valueB={playerB.tackles} />
            <StatRow statName="Interceptions" valueA={playerA.interceptions} valueB={playerB.interceptions} />
            <StatRow statName="Clean Sheets" valueA={playerA.cleanSheets} valueB={playerB.cleanSheets} />
          </div>

          {/* Discipline */}
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Discipline</h3>
            <StatRow statName="Yellow Cards" valueA={playerA.yellowCards} valueB={playerB.yellowCards} />
            <StatRow statName="Red Cards" valueA={playerA.redCards} valueB={playerB.redCards} />
            <StatRow statName="Minutes Played" valueA={playerA.minutesPlayed} valueB={playerB.minutesPlayed} />
          </div>
        </div>
      )}

      {/* Message when players not selected */}
      {(!playerA || !playerB) && (
        <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
          <p className="text-lg mb-2">Select two players above to compare their stats</p>
          <p className="text-sm">Choose from {players.length} players across multiple leagues</p>
        </div>
      )}
    </div>
  );
}
