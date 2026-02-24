// ========================================
// LeagueFixtures.js - Match Fixtures Page
// ========================================
// Shows match fixtures from mock data with competition dropdown.
// Includes leagues, Champions League, and World Cup 2026.
// No external APIs - all data from local JSON files.

import { useEffect, useState } from "react";

// API_BASE = backend URL from .env file
const API_BASE = process.env.REACT_APP_API_URL;

export default function LeagueFixtures() {
  // State variables
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompetition, setSelectedCompetition] = useState("premier-league");
  const [statusFilter, setStatusFilter] = useState("All");

  // List of competitions
  var competitions = [
    { id: "premier-league", name: "Premier League" },
    { id: "la-liga", name: "La Liga" },
    { id: "bundesliga", name: "Bundesliga" },
    { id: "serie-a", name: "Serie A" },
    { id: "ligue-1", name: "Ligue 1" },
    { id: "champions-league", name: "Champions League" },
    { id: "world-cup-2026", name: "World Cup 2026" }
  ];

  // Fetch fixtures when page loads or competition changes
  useEffect(function () {
    setLoading(true);
    setError(null);

    var url = API_BASE + "/api/football/fixtures?competition=" + selectedCompetition;

    fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Could not get fixtures");
        }
        return response.json();
      })
      .then(function (data) {
        if (data.response && data.response.length > 0) {
          setFixtures(data.response);
        } else {
          setFixtures([]);
        }
        setLoading(false);
      })
      .catch(function (err) {
        console.error("Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [selectedCompetition]);

  // Handle dropdown changes
  function handleCompetitionChange(e) {
    setSelectedCompetition(e.target.value);
  }

  // Get competition display name
  function getCompetitionName(id) {
    for (var i = 0; i < competitions.length; i++) {
      if (competitions[i].id === id) {
        return competitions[i].name;
      }
    }
    return "Competition";
  }

  // Format date to readable format
  function formatDate(dateString) {
    if (!dateString) return "TBD";
    var date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  // Get status badge color
  function getStatusColor(status) {
    if (status === "FT") return "bg-gray-600";
    if (status === "NS") return "bg-blue-600";
    return "bg-red-600";
  }

  // Get status label
  function getStatusLabel(status) {
    if (status === "FT") return "Full Time";
    if (status === "NS") return "Upcoming";
    return "Live";
  }

  // Filter fixtures by status
  var filteredFixtures = fixtures.filter(function (fixture) {
    var status = fixture.fixture.status ? fixture.fixture.status.short : "NS";
    if (statusFilter === "All") return true;
    if (statusFilter === "FT") return status === "FT";
    if (statusFilter === "NS") return status === "NS";
    return true;
  });

  return (
    <div className="w-full max-w-6xl px-2">
      {/* Page Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-4">
        {getCompetitionName(selectedCompetition)} Fixtures
      </h1>

      {/* Dropdowns */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Competition Dropdown */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Select Competition:</label>
            <select
              value={selectedCompetition}
              onChange={handleCompetitionChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 hover:border-cyan-400"
            >
              <optgroup label="Domestic Leagues">
                {competitions.filter(function (c) {
                  return c.id !== "champions-league" && c.id !== "world-cup-2026";
                }).map(function (comp) {
                  return <option key={comp.id} value={comp.id}>{comp.name}</option>;
                })}
              </optgroup>
              <optgroup label="International">
                <option value="champions-league">Champions League</option>
                <option value="world-cup-2026">World Cup 2026</option>
              </optgroup>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={function (e) { setStatusFilter(e.target.value); }}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 hover:border-cyan-400"
            >
              <option value="All">All Matches</option>
              <option value="FT">Completed (FT)</option>
              <option value="NS">Upcoming (NS)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading fixtures...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Fixture Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFixtures.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-gray-400">
              No fixtures available for this selection
            </div>
          ) : (
            filteredFixtures.map(function (fixture, index) {
              var match = fixture.fixture;
              var teams = fixture.teams;
              var goals = fixture.goals;
              var round = fixture.round || "";

              var homeTeam = teams.home ? teams.home.name : "Unknown";
              var awayTeam = teams.away ? teams.away.name : "Unknown";
              var homeScore = goals.home !== null ? goals.home : "-";
              var awayScore = goals.away !== null ? goals.away : "-";
              var status = match.status ? match.status.short : "NS";
              var matchDate = formatDate(match.date);

              return (
                <div
                  key={match.id || index}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition"
                >
                  {/* Round info */}
                  {round && (
                    <p className="text-xs text-cyan-400 mb-2 font-semibold">{round}</p>
                  )}

                  {/* Date and Status */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-gray-400">{matchDate}</span>
                    <span className={"text-xs px-2 py-1 rounded " + getStatusColor(status)}>
                      {getStatusLabel(status)}
                    </span>
                  </div>

                  {/* Home Team */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{homeTeam}</span>
                    <span className="text-xl font-bold text-cyan-400">{homeScore}</span>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{awayTeam}</span>
                    <span className="text-xl font-bold text-cyan-400">{awayScore}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
