// ========================================
// PlayerInsights.js - Player Insights Page
// ========================================
// This page lets users select a player and view their stats
// using charts (bar chart + radar chart) powered by Recharts.
//
// It also includes a simple RULE-BASED SYSTEM that generates
// strengths and weaknesses based on a player's stats.
//
// FEATURES:
// 1. Player dropdown selector (search by name)
// 2. Bar chart showing goals, assists, shots, key passes
// 3. Radar chart showing overall skill profile
// 4. Rule-based strengths and weaknesses analysis
// ========================================

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

// API_BASE = backend URL from .env file
const API_BASE = process.env.REACT_APP_API_URL;

// ========================================
// RULE-BASED SYSTEM: Generate Strengths & Weaknesses
// ========================================
// This function looks at a player's stats and uses simple IF rules
// to decide what they are good or bad at.
//
// HOW IT WORKS:
// - If a stat is above a threshold → it's a STRENGTH
// - If a stat is below a threshold → it's a WEAKNESS
// - Different positions have different expectations
//
// This is a "rule-based expert system" - a simple form of AI
// where humans define the rules instead of the computer learning them.
// ========================================
function analysePlayer(player) {
  // Arrays to store the results
  var strengths = [];
  var weaknesses = [];

  // ========================================
  // GOAL SCORING RULES
  // ========================================
  if (player.goals >= 20) {
    strengths.push({ label: "Elite Finisher", detail: player.goals + " goals this season" });
  } else if (player.goals >= 12) {
    strengths.push({ label: "Clinical Scorer", detail: player.goals + " goals this season" });
  } else if (player.position === "Forward" && player.goals < 5) {
    weaknesses.push({ label: "Poor Goal Output", detail: "Only " + player.goals + " goals as a forward" });
  }

  // ========================================
  // ASSIST RULES
  // ========================================
  if (player.assists >= 12) {
    strengths.push({ label: "Elite Playmaker", detail: player.assists + " assists this season" });
  } else if (player.assists >= 7) {
    strengths.push({ label: "Creative Passer", detail: player.assists + " assists this season" });
  } else if (player.position === "Midfielder" && player.assists < 3) {
    weaknesses.push({ label: "Low Creativity", detail: "Only " + player.assists + " assists as a midfielder" });
  }

  // ========================================
  // PASSING RULES
  // ========================================
  if (player.passes >= 2000) {
    strengths.push({ label: "Pass Master", detail: player.passes + " passes completed" });
  } else if (player.passes >= 1200) {
    strengths.push({ label: "Good Distribution", detail: player.passes + " passes completed" });
  } else if (player.position === "Midfielder" && player.passes < 800) {
    weaknesses.push({ label: "Limited Passing", detail: "Only " + player.passes + " passes for a midfielder" });
  }

  // ========================================
  // TACKLING / DEFENSIVE RULES
  // ========================================
  if (player.tackles >= 80) {
    strengths.push({ label: "Defensive Wall", detail: player.tackles + " tackles made" });
  } else if (player.tackles >= 50) {
    strengths.push({ label: "Solid Defender", detail: player.tackles + " tackles made" });
  } else if (player.position === "Defender" && player.tackles < 40) {
    weaknesses.push({ label: "Weak Defensively", detail: "Only " + player.tackles + " tackles as a defender" });
  } else if (player.position === "Midfielder" && player.tackles < 20) {
    weaknesses.push({ label: "Avoids Tackles", detail: "Only " + player.tackles + " tackles" });
  }

  // ========================================
  // INTERCEPTION RULES
  // ========================================
  if (player.interceptions >= 60) {
    strengths.push({ label: "Reading the Game", detail: player.interceptions + " interceptions" });
  } else if (player.position === "Defender" && player.interceptions < 30) {
    weaknesses.push({ label: "Poor Anticipation", detail: "Only " + player.interceptions + " interceptions" });
  }

  // ========================================
  // DRIBBLING RULES
  // ========================================
  if (player.dribbles >= 80) {
    strengths.push({ label: "Skillful Dribbler", detail: player.dribbles + " successful dribbles" });
  } else if (player.dribbles >= 50) {
    strengths.push({ label: "Decent on the Ball", detail: player.dribbles + " dribbles" });
  } else if (player.position === "Forward" && player.dribbles < 20) {
    weaknesses.push({ label: "Lacks Dribbling", detail: "Only " + player.dribbles + " dribbles as a forward" });
  }

  // ========================================
  // KEY PASSES RULES
  // ========================================
  if (player.keyPasses >= 60) {
    strengths.push({ label: "Chance Creator", detail: player.keyPasses + " key passes" });
  } else if (player.position === "Midfielder" && player.keyPasses < 15) {
    weaknesses.push({ label: "Rarely Creates Chances", detail: "Only " + player.keyPasses + " key passes" });
  }

  // ========================================
  // SHOOTING ACCURACY RULES
  // ========================================
  if (player.shots > 0) {
    var accuracy = Math.round((player.shotsOnTarget / player.shots) * 100);
    if (accuracy >= 50) {
      strengths.push({ label: "Accurate Shooter", detail: accuracy + "% shots on target" });
    } else if (player.position === "Forward" && accuracy < 30) {
      weaknesses.push({ label: "Wasteful Finishing", detail: "Only " + accuracy + "% shots on target" });
    }
  }

  // ========================================
  // DISCIPLINE RULES
  // ========================================
  if (player.yellowCards >= 10) {
    weaknesses.push({ label: "Lacks Discipline", detail: player.yellowCards + " yellow cards" });
  }
  if (player.redCards >= 2) {
    weaknesses.push({ label: "Reckless", detail: player.redCards + " red cards" });
  }

  // ========================================
  // CLEAN SHEETS (Defenders & Goalkeepers)
  // ========================================
  if ((player.position === "Defender" || player.position === "Goalkeeper") && player.cleanSheets >= 12) {
    strengths.push({ label: "Rock Solid", detail: player.cleanSheets + " clean sheets" });
  } else if (player.position === "Goalkeeper" && player.cleanSheets < 5) {
    weaknesses.push({ label: "Concedes Often", detail: "Only " + player.cleanSheets + " clean sheets" });
  }

  // ========================================
  // RATING RULES
  // ========================================
  if (player.rating >= 8.0) {
    strengths.push({ label: "World Class Rating", detail: "Average rating: " + player.rating });
  } else if (player.rating >= 7.5) {
    strengths.push({ label: "Consistent Performer", detail: "Average rating: " + player.rating });
  } else if (player.rating < 6.5) {
    weaknesses.push({ label: "Below Average Performances", detail: "Average rating: " + player.rating });
  }

  // If no strengths/weaknesses found, add a default
  if (strengths.length === 0) {
    strengths.push({ label: "Balanced Player", detail: "No standout strengths detected" });
  }
  if (weaknesses.length === 0) {
    weaknesses.push({ label: "No Major Flaws", detail: "Performs well in all areas" });
  }

  return { strengths: strengths, weaknesses: weaknesses };
}

// ========================================
// MAIN COMPONENT
// ========================================
export default function PlayerInsights() {
  // State: all players loaded from backend
  const [players, setPlayers] = useState([]);
  // State: the currently selected player (object or null)
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  // State: search text for filtering the player dropdown
  const [search, setSearch] = useState("");
  // State: position filter
  const [positionFilter, setPositionFilter] = useState("All");
  // State: team filter
  const [teamFilter, setTeamFilter] = useState("All");

  // ========================================
  // Fetch all 200 mock players from backend
  // ========================================
  useEffect(function () {
    fetch(API_BASE + "/api/insights/players")
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        setPlayers(data);
      })
      .catch(function (err) {
        console.error("Error loading players:", err);
      });
  }, []);

  // ========================================
  // Get unique positions and teams for filters
  // ========================================
  var positions = ["All", ...new Set(players.map(function (p) { return p.position; }))];
  var teams = ["All", ...new Set(players.map(function (p) { return p.team; }))];

  // ========================================
  // Filter players based on search + filters
  // ========================================
  var filteredPlayers = players.filter(function (player) {
    var matchesSearch = player.name.toLowerCase().includes(search.toLowerCase());
    var matchesPosition = positionFilter === "All" || player.position === positionFilter;
    var matchesTeam = teamFilter === "All" || player.team === teamFilter;
    return matchesSearch && matchesPosition && matchesTeam;
  });

  // ========================================
  // Handle player selection from dropdown
  // ========================================
  function handleSelectPlayer(playerId) {
    // Find the player by ID from the full list
    var player = players.find(function (p) {
      return p.id === Number(playerId);
    });
    setSelectedPlayer(player || null);
  }

  // ========================================
  // Prepare chart data for selected player
  // ========================================
  // Bar chart data: key offensive stats
  var barData = [];
  // Radar chart data: overall skill profile (normalized to 0-100 scale)
  var radarData = [];

  if (selectedPlayer) {
    // Bar chart: raw stat values
    barData = [
      { stat: "Goals", value: selectedPlayer.goals },
      { stat: "Assists", value: selectedPlayer.assists },
      { stat: "Shots", value: selectedPlayer.shots },
      { stat: "Key Passes", value: selectedPlayer.keyPasses },
      { stat: "Dribbles", value: selectedPlayer.dribbles },
      { stat: "Passes", value: Math.round(selectedPlayer.passes / 10) },
    ];

    // Radar chart: normalize stats to a 0-100 scale
    // We divide by the maximum possible value and multiply by 100
    radarData = [
      { stat: "Scoring", value: Math.min(100, Math.round((selectedPlayer.goals / 28) * 100)) },
      { stat: "Passing", value: Math.min(100, Math.round((selectedPlayer.passes / 2500) * 100)) },
      { stat: "Dribbling", value: Math.min(100, Math.round((selectedPlayer.dribbles / 120) * 100)) },
      { stat: "Defending", value: Math.min(100, Math.round((selectedPlayer.tackles / 140) * 100)) },
      { stat: "Creativity", value: Math.min(100, Math.round((selectedPlayer.keyPasses / 80) * 100)) },
      { stat: "Shooting", value: Math.min(100, Math.round((selectedPlayer.shots / 140) * 100)) },
    ];
  }

  // Run the rule-based analysis (only if a player is selected)
  var analysis = selectedPlayer ? analysePlayer(selectedPlayer) : null;

  return (
    <div className="text-white w-full max-w-6xl mx-auto px-2">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">
        🔍 Player Insights
      </h1>
      <p className="text-gray-400 text-center mb-6 text-sm sm:text-base">
        Select a player to view detailed stats, charts, and AI-powered analysis
      </p>

      {/* ========================================
          FILTERS & PLAYER SELECTOR
          ======================================== */}
      <div className="bg-gray-800 p-3 sm:p-4 rounded-lg mb-6">
        {/* Row 1: Search and Filters */}
        <div className="flex flex-wrap gap-3 mb-3 justify-center">
          {/* Search by name */}
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={function (e) { setSearch(e.target.value); }}
            className="p-2 w-full sm:w-60 rounded bg-gray-700 text-white border border-gray-600"
          />

          {/* Position filter */}
          <select
            value={positionFilter}
            onChange={function (e) { setPositionFilter(e.target.value); }}
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          >
            {positions.map(function (pos) {
              return <option key={pos} value={pos}>{pos}</option>;
            })}
          </select>

          {/* Team filter */}
          <select
            value={teamFilter}
            onChange={function (e) { setTeamFilter(e.target.value); }}
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          >
            {teams.map(function (team) {
              return <option key={team} value={team}>{team}</option>;
            })}
          </select>
        </div>

        {/* Row 2: Player selection dropdown */}
        <div className="flex justify-center">
          <select
            value={selectedPlayer ? selectedPlayer.id : ""}
            onChange={function (e) { handleSelectPlayer(e.target.value); }}
            className="p-2 w-full sm:w-96 rounded bg-gray-700 text-white border border-cyan-500 text-center font-semibold"
          >
            <option value="">-- Select a Player --</option>
            {filteredPlayers.map(function (player) {
              return (
                <option key={player.id} value={player.id}>
                  {player.name} ({player.team} - {player.position})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* ========================================
          SHOW PLAYER DATA (only if selected)
          ======================================== */}
      {selectedPlayer && (
        <div>
          {/* ========================================
              PLAYER INFO CARD
              ======================================== */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-6 shadow-lg">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-cyan-400">
                  {selectedPlayer.name}
                </h2>
                <p className="text-gray-400">
                  {selectedPlayer.team} · {selectedPlayer.league} · {selectedPlayer.position}
                </p>
                <p className="text-gray-500 text-sm">
                  Age: {selectedPlayer.age} · Minutes: {selectedPlayer.minutesPlayed}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-yellow-400">
                  {selectedPlayer.rating}
                </p>
                <p className="text-gray-400 text-sm">Avg Rating</p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
              <div className="bg-gray-700 p-3 rounded text-center">
                <p className="text-2xl font-bold text-green-400">{selectedPlayer.goals}</p>
                <p className="text-xs text-gray-400">Goals</p>
              </div>
              <div className="bg-gray-700 p-3 rounded text-center">
                <p className="text-2xl font-bold text-blue-400">{selectedPlayer.assists}</p>
                <p className="text-xs text-gray-400">Assists</p>
              </div>
              <div className="bg-gray-700 p-3 rounded text-center">
                <p className="text-2xl font-bold text-purple-400">{selectedPlayer.passes}</p>
                <p className="text-xs text-gray-400">Passes</p>
              </div>
              <div className="bg-gray-700 p-3 rounded text-center">
                <p className="text-2xl font-bold text-orange-400">{selectedPlayer.tackles}</p>
                <p className="text-xs text-gray-400">Tackles</p>
              </div>
              <div className="bg-gray-700 p-3 rounded text-center">
                <p className="text-2xl font-bold text-pink-400">{selectedPlayer.dribbles}</p>
                <p className="text-xs text-gray-400">Dribbles</p>
              </div>
              <div className="bg-gray-700 p-3 rounded text-center">
                <p className="text-2xl font-bold text-cyan-300">{selectedPlayer.keyPasses}</p>
                <p className="text-xs text-gray-400">Key Passes</p>
              </div>
            </div>
          </div>

          {/* ========================================
              CHARTS SECTION
              ======================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* BAR CHART - Key Stats */}
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4 text-center">
                Key Statistics
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  {/* Grid lines in the background */}
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  {/* X axis = stat names */}
                  <XAxis dataKey="stat" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                  {/* Y axis = stat values */}
                  <YAxis tick={{ fill: "#9CA3AF" }} />
                  {/* Tooltip on hover */}
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                    labelStyle={{ color: "#22D3EE" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  {/* The bars */}
                  <Bar dataKey="value" fill="#22D3EE" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 text-center mt-2">
                * Passes shown as passes/10 for chart readability
              </p>
            </div>

            {/* RADAR CHART - Skill Profile */}
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4 text-center">
                Skill Profile
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  {/* Background grid */}
                  <PolarGrid stroke="#374151" />
                  {/* Labels around the radar */}
                  <PolarAngleAxis dataKey="stat" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                  {/* Scale (0-100) */}
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#6B7280" }} />
                  {/* The radar shape */}
                  <Radar
                    name="Stats"
                    dataKey="value"
                    stroke="#22D3EE"
                    fill="#22D3EE"
                    fillOpacity={0.3}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                    labelStyle={{ color: "#22D3EE" }}
                    itemStyle={{ color: "#fff" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 text-center mt-2">
                Stats normalized to 0-100 scale for comparison
              </p>
            </div>
          </div>

          {/* ========================================
              RULE-BASED ANALYSIS: Strengths & Weaknesses
              ======================================== */}
          {analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* STRENGTHS */}
              <div className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-green-400 mb-4">
                  💪 Strengths
                </h3>
                <div className="space-y-3">
                  {analysis.strengths.map(function (item, index) {
                    return (
                      <div key={index} className="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-3">
                        <p className="font-semibold text-green-400">{item.label}</p>
                        <p className="text-sm text-gray-300">{item.detail}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* WEAKNESSES */}
              <div className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-red-400 mb-4">
                  ⚠️ Weaknesses
                </h3>
                <div className="space-y-3">
                  {analysis.weaknesses.map(function (item, index) {
                    return (
                      <div key={index} className="bg-red-900 bg-opacity-30 border border-red-700 rounded-lg p-3">
                        <p className="font-semibold text-red-400">{item.label}</p>
                        <p className="text-sm text-gray-300">{item.detail}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================
              HOW THE ANALYSIS WORKS (Explainer)
              ======================================== */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              How Does the Analysis Work?
            </h3>
            <p className="text-sm text-gray-400 mb-2">
              This page uses a <span className="text-cyan-400 font-semibold">rule-based expert system</span> to
              evaluate players. Simple IF/THEN rules check each stat against thresholds:
            </p>
            <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
              <li>Goals ≥ 20 → "Elite Finisher"</li>
              <li>Assists ≥ 12 → "Elite Playmaker"</li>
              <li>Tackles ≥ 80 → "Defensive Wall"</li>
              <li>Low tackles for a defender → "Weak Defensively"</li>
              <li>Rating ≥ 8.0 → "World Class Rating"</li>
              <li>Position-aware rules (e.g. forwards expected to score more)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Show helper text when no player is selected */}
      {!selectedPlayer && players.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400 text-lg mb-2">👆 Select a player above to view their insights</p>
          <p className="text-gray-500 text-sm">
            Choose from {players.length} players across {teams.length - 1} teams
          </p>
        </div>
      )}

      {/* Loading state */}
      {players.length === 0 && (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">Loading players...</p>
        </div>
      )}
    </div>
  );
}

