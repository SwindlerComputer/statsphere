// ========================================
// Players.js - Player Statistics with Pagination
// ========================================
// This page shows all 200 players in a table.
// Users can search, filter, and browse through pages.
// It shows 20 players per page with Previous/Next buttons.

import { useEffect, useState } from "react";

// API_BASE = backend URL from .env file
const API_BASE = process.env.REACT_APP_API_URL;

// How many players to show per page
var PLAYERS_PER_PAGE = 20;

export default function Players() {
  // Store all players from backend
  var [players, setPlayers] = useState([]);
  // Search box text
  var [search, setSearch] = useState("");
  // Filter dropdowns
  var [positionFilter, setPositionFilter] = useState("All");
  var [teamFilter, setTeamFilter] = useState("All");
  var [leagueFilter, setLeagueFilter] = useState("All");
  // Current page number (starts at 1)
  var [currentPage, setCurrentPage] = useState(1);

  // Fetch the 200 players when page loads
  useEffect(function () {
    fetch(API_BASE + "/api/insights/players")
      .then(function (res) { return res.json(); })
      .then(function (data) { setPlayers(data); })
      .catch(function (err) { console.error("Error loading players:", err); });
  }, []);

  // Get unique values for the filter dropdowns
  var positions = ["All", ...new Set(players.map(function (p) { return p.position; }))];
  var teams = ["All", ...new Set(players.map(function (p) { return p.team; }))];
  var leagues = ["All", ...new Set(players.map(function (p) { return p.league; }))];

  // Apply all filters and search
  var filteredPlayers = players.filter(function (player) {
    var matchesSearch = player.name.toLowerCase().includes(search.toLowerCase());
    var matchesPosition = positionFilter === "All" || player.position === positionFilter;
    var matchesTeam = teamFilter === "All" || player.team === teamFilter;
    var matchesLeague = leagueFilter === "All" || player.league === leagueFilter;
    return matchesSearch && matchesPosition && matchesTeam && matchesLeague;
  });

  // ========================================
  // PAGINATION LOGIC
  // ========================================
  // Work out how many pages we need
  var totalPages = Math.ceil(filteredPlayers.length / PLAYERS_PER_PAGE);

  // Make sure current page is valid (reset to 1 if filters change)
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = 1;
  }

  // Get only the players for the current page
  // slice(start, end) cuts out a portion of the array
  var startIndex = (currentPage - 1) * PLAYERS_PER_PAGE;
  var endIndex = startIndex + PLAYERS_PER_PAGE;
  var playersOnThisPage = filteredPlayers.slice(startIndex, endIndex);

  // Go to the next page
  function goToNextPage() {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  }

  // Go to the previous page
  function goToPreviousPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  }

  // Reset to page 1 when any filter changes
  function handleSearchChange(e) {
    setSearch(e.target.value);
    setCurrentPage(1);
  }

  function handleLeagueChange(e) {
    setLeagueFilter(e.target.value);
    setCurrentPage(1);
  }

  function handlePositionChange(e) {
    setPositionFilter(e.target.value);
    setCurrentPage(1);
  }

  function handleTeamChange(e) {
    setTeamFilter(e.target.value);
    setCurrentPage(1);
  }

  return (
    <div className="text-white w-full max-w-6xl mx-auto px-2">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        Player Statistics
      </h1>

      {/* Search + Filters */}
      <div className="bg-gray-800 p-3 sm:p-4 rounded-lg mb-6 flex flex-wrap gap-3 sm:gap-4 justify-center">
        {/* Search bar */}
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={handleSearchChange}
          className="p-2 w-full sm:w-60 rounded bg-gray-700 text-white border border-gray-600"
        />

        {/* League filter */}
        <select
          value={leagueFilter}
          onChange={handleLeagueChange}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          {leagues.map(function (lg) {
            return <option key={lg} value={lg}>{lg}</option>;
          })}
        </select>

        {/* Position filter */}
        <select
          value={positionFilter}
          onChange={handlePositionChange}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          {positions.map(function (pos) {
            return <option key={pos} value={pos}>{pos}</option>;
          })}
        </select>

        {/* Team filter */}
        <select
          value={teamFilter}
          onChange={handleTeamChange}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          {teams.map(function (team) {
            return <option key={team} value={team}>{team}</option>;
          })}
        </select>
      </div>

      {/* Results count + page info */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-gray-400">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredPlayers.length)} of {filteredPlayers.length} players
        </p>
        <p className="text-sm text-gray-400">
          Page {currentPage} of {totalPages || 1}
        </p>
      </div>

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
            {playersOnThisPage.length === 0 ? (
              <tr>
                <td colSpan="12" className="p-6 text-center text-gray-400">
                  No players found matching your filters
                </td>
              </tr>
            ) : (
              playersOnThisPage.map(function (p, i) {
                return (
                  <tr
                    key={p.id}
                    className="border-b border-gray-700 hover:bg-gray-700 transition"
                  >
                    <td className="p-2">{startIndex + i + 1}</td>
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
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================
          PAGINATION BUTTONS
          ======================================== */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          {/* Previous button */}
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={
              "px-4 py-2 rounded font-semibold transition " +
              (currentPage === 1
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-cyan-500 hover:bg-cyan-600 text-white")
            }
          >
            Previous
          </button>

          {/* Page number display */}
          <span className="text-gray-300">
            Page {currentPage} of {totalPages}
          </span>

          {/* Next button */}
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={
              "px-4 py-2 rounded font-semibold transition " +
              (currentPage === totalPages
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-cyan-500 hover:bg-cyan-600 text-white")
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
