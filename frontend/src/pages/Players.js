// ========================================
// Players.js - Player Statistics with Filters
// ========================================
// Fetches player data and lets users search by name or filter by position/team.
// filteredPlayers = result of applying all filters and search to the full players array.

import { useEffect, useState } from "react";

// API_BASE = backend URL from .env file
const API_BASE = process.env.REACT_APP_API_URL;

export default function Players() {
  // State for the full players list from backend
  const [players, setPlayers] = useState([]);
  // State for search input (user types player name)
  const [search, setSearch] = useState("");
  // State for selected position filter dropdown (default = "All")
  const [positionFilter, setPositionFilter] = useState("All");
  // State for selected team filter dropdown (default = "All")
  const [teamFilter, setTeamFilter] = useState("All");

  // Fetch players from backend when component mounts
  useEffect(() => {
    // GET request using the fetch API (similar to axios, but built-in)
    fetch(`${API_BASE}/api/players`)
      .then((res) => res.json())  // Convert response to JSON
      .then((data) => setPlayers(data))  // Store players in state
      .catch((err) => console.error("Error loading players:", err));
  }, []);

  // Extract unique positions from players array to populate position dropdown
  // players.map((p) => p.position) = get position from each player
  // new Set(...) = remove duplicates
  // ["All", ...] = add "All" at start using spread operator
  const positions = ["All", ...new Set(players.map((p) => p.position))];
  // Same logic for team dropdown options
  const teams = ["All", ...new Set(players.map((p) => p.team))];

  // filter() creates a new array with only players that pass ALL conditions
  // This is the key function: it combines search + both filter dropdowns
  const filteredPlayers = players.filter((player) => {
    // Check if player name includes the search text (case-insensitive)
    const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase());

    // Check if player position matches filter (or filter is "All")
    const matchesPosition =
      positionFilter === "All" || player.position === positionFilter;

    // Check if player team matches filter (or filter is "All")
    const matchesTeam = teamFilter === "All" || player.team === teamFilter;

    // Player is included only if ALL three conditions are true
    return matchesSearch && matchesPosition && matchesTeam;
  });

  return (
    <div className="text-white w-full max-w-6xl mx-auto px-2">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        ⚽ StatSphere – Player Statistics
      </h1>

      {/* Search + Filters */}
      <div className="bg-gray-800 p-3 sm:p-4 rounded-lg mb-6 flex flex-wrap gap-3 sm:gap-4 justify-center">

        {/* Search Bar - Updates search state as user types */}
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 w-full sm:w-60 rounded bg-gray-700 text-white border border-gray-600"
        />

        {/* Position Filter Dropdown */}
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          {/* map() creates <option> for each position in positions array */}
          {positions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>

        {/* Team Filter Dropdown */}
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          {/* map() creates <option> for each team in teams array */}
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      {/* Player Table */}
      <div className="overflow-x-auto bg-gray-800 p-4 rounded-lg shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-600 text-cyan-300">
              <th className="p-2">#</th>
              <th className="p-2">Name</th>
              <th className="p-2">Team</th>
              <th className="p-2">Position</th>
              <th className="p-2">Goals</th>
              <th className="p-2">Assists</th>
              <th className="p-2">xG</th>
              <th className="p-2">xA</th>
              <th className="p-2">npxG</th>
              <th className="p-2">Shots</th>
              <th className="p-2">Goals/90</th>
            </tr>
          </thead>

          <tbody>
            {/* map() loops through filteredPlayers (result of search + filters) */}
            {/* Each player becomes a table row <tr> with their stats */}
            {filteredPlayers.map((p, i) => (
              <tr
                key={p.id}
                className="border-b border-gray-700 hover:bg-gray-700 transition"
              >
                <td className="p-2">{i + 1}</td>
                <td className="p-2 font-semibold">{p.name}</td>
                <td className="p-2">{p.team}</td>
                <td className="p-2">{p.position}</td>
                <td className="p-2">{p.goals}</td>
                <td className="p-2">{p.assists}</td>
                <td className="p-2">{p.xG}</td>
                <td className="p-2">{p.xA}</td>
                <td className="p-2">{p.npxG}</td>
                <td className="p-2">{p.shots}</td>
                <td className="p-2">{p.goals_per90}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
