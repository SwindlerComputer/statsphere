// ========================================
// Players.js - Player Statistics with Filters
// ========================================
// Fetches the full 200-player mock dataset and lets users
// search by name or filter by position/team/league.

import { useEffect, useState } from "react";

// API_BASE = backend URL from .env file
const API_BASE = process.env.REACT_APP_API_URL;

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [leagueFilter, setLeagueFilter] = useState("All");

  // Fetch the full 200-player dataset
  useEffect(function () {
    fetch(API_BASE + "/api/insights/players")
      .then(function (res) { return res.json(); })
      .then(function (data) { setPlayers(data); })
      .catch(function (err) { console.error("Error loading players:", err); });
  }, []);

  // Unique values for filter dropdowns
  var positions = ["All", ...new Set(players.map(function (p) { return p.position; }))];
  var teams = ["All", ...new Set(players.map(function (p) { return p.team; }))];
  var leagues = ["All", ...new Set(players.map(function (p) { return p.league; }))];

  // Apply all filters
  var filteredPlayers = players.filter(function (player) {
    var matchesSearch = player.name.toLowerCase().includes(search.toLowerCase());
    var matchesPosition = positionFilter === "All" || player.position === positionFilter;
    var matchesTeam = teamFilter === "All" || player.team === teamFilter;
    var matchesLeague = leagueFilter === "All" || player.league === leagueFilter;
    return matchesSearch && matchesPosition && matchesTeam && matchesLeague;
  });

  return (
    <div className="text-white w-full max-w-6xl mx-auto px-2">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        Player Statistics
      </h1>

      {/* Search + Filters */}
      <div className="bg-gray-800 p-3 sm:p-4 rounded-lg mb-6 flex flex-wrap gap-3 sm:gap-4 justify-center">
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={function (e) { setSearch(e.target.value); }}
          className="p-2 w-full sm:w-60 rounded bg-gray-700 text-white border border-gray-600"
        />
        <select
          value={leagueFilter}
          onChange={function (e) { setLeagueFilter(e.target.value); }}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          {leagues.map(function (lg) {
            return <option key={lg} value={lg}>{lg}</option>;
          })}
        </select>
        <select
          value={positionFilter}
          onChange={function (e) { setPositionFilter(e.target.value); }}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          {positions.map(function (pos) {
            return <option key={pos} value={pos}>{pos}</option>;
          })}
        </select>
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

      {/* Results count */}
      <p className="text-sm text-gray-400 mb-3">
        Showing {filteredPlayers.length} of {players.length} players
      </p>

      {/* Player Table */}
      <div className="overflow-x-auto bg-gray-800 p-4 rounded-lg shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-600 text-cyan-300">
              <th className="p-2">#</th>
              <th className="p-2">Name</th>
              <th className="p-2">Team</th>
              <th className="p-2">League</th>
              <th className="p-2">Pos</th>
              <th className="p-2">Age</th>
              <th className="p-2">Rating</th>
              <th className="p-2">Goals</th>
              <th className="p-2">Assists</th>
              <th className="p-2">Passes</th>
              <th className="p-2">Tackles</th>
              <th className="p-2">Mins</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map(function (p, i) {
              return (
                <tr
                  key={p.id}
                  className="border-b border-gray-700 hover:bg-gray-700 transition"
                >
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2 font-semibold">{p.name}</td>
                  <td className="p-2">{p.team}</td>
                  <td className="p-2 text-gray-400">{p.league}</td>
                  <td className="p-2">{p.position}</td>
                  <td className="p-2">{p.age}</td>
                  <td className="p-2 text-yellow-400 font-semibold">{p.rating}</td>
                  <td className="p-2 text-green-400">{p.goals}</td>
                  <td className="p-2 text-blue-400">{p.assists}</td>
                  <td className="p-2">{p.passes}</td>
                  <td className="p-2">{p.tackles}</td>
                  <td className="p-2 text-gray-400">{p.minutesPlayed}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
