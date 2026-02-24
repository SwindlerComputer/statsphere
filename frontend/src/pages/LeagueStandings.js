// ========================================
// LeagueStandings.js - League Table / Standings
// ========================================
// Shows football league standings (team rankings) from mock data.
// Includes dropdowns for selecting competition (league, Champions League, World Cup).
// No external APIs needed - all data from local JSON files.

import { useEffect, useState } from "react";

// API_BASE = backend URL from .env file
const API_BASE = process.env.REACT_APP_API_URL;

export default function LeagueStandings() {
  // State variables
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompetition, setSelectedCompetition] = useState("premier-league");

  // List of competitions the user can choose from
  // Includes leagues, Champions League, and World Cup
  var competitions = [
    { id: "premier-league", name: "Premier League" },
    { id: "la-liga", name: "La Liga" },
    { id: "bundesliga", name: "Bundesliga" },
    { id: "serie-a", name: "Serie A" },
    { id: "ligue-1", name: "Ligue 1" },
    { id: "champions-league", name: "Champions League" },
    { id: "world-cup-2026", name: "World Cup 2026" }
  ];

  // Fetch standings when page loads or competition changes
  useEffect(function () {
    setLoading(true);
    setError(null);

    var url = API_BASE + "/api/football/standings?competition=" + selectedCompetition;

    fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Could not get standings");
        }
        return response.json();
      })
      .then(function (data) {
        if (data.response && data.response.length > 0) {
          var leagueData = data.response[0];
          if (leagueData.league && leagueData.league.standings) {
            setStandings(leagueData.league.standings[0] || []);
          } else {
            setStandings([]);
          }
        } else {
          setStandings([]);
        }
        setLoading(false);
      })
      .catch(function (err) {
        console.error("Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [selectedCompetition]);

  // Handle competition dropdown change
  function handleCompetitionChange(e) {
    setSelectedCompetition(e.target.value);
  }

  // Get display name for the selected competition
  function getCompetitionName(id) {
    for (var i = 0; i < competitions.length; i++) {
      if (competitions[i].id === id) {
        return competitions[i].name;
      }
    }
    return "Competition";
  }

  return (
    <div className="w-full max-w-6xl px-2">
      {/* Page Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-4">
        {getCompetitionName(selectedCompetition)} Standings
      </h1>

      {/* Competition Dropdown */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <label className="block text-sm text-gray-300 mb-2">Select Competition:</label>
        <select
          value={selectedCompetition}
          onChange={handleCompetitionChange}
          className="w-full sm:w-auto bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 hover:border-cyan-400"
        >
          {/* Group: Domestic Leagues */}
          <optgroup label="Domestic Leagues">
            {competitions.filter(function (c) {
              return c.id !== "champions-league" && c.id !== "world-cup-2026";
            }).map(function (comp) {
              return <option key={comp.id} value={comp.id}>{comp.name}</option>;
            })}
          </optgroup>
          {/* Group: International Competitions */}
          <optgroup label="International">
            <option value="champions-league">Champions League</option>
            <option value="world-cup-2026">World Cup 2026</option>
          </optgroup>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading standings...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Standings Table */}
      {!loading && !error && (
        <div className="bg-gray-800 rounded-lg overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-sm text-gray-300">Pos</th>
                <th className="px-3 sm:px-6 py-3 text-left text-sm text-gray-300">Team</th>
                <th className="px-2 sm:px-6 py-3 text-center text-sm text-gray-300">P</th>
                <th className="px-2 sm:px-6 py-3 text-center text-sm text-gray-300">W</th>
                <th className="px-2 sm:px-6 py-3 text-center text-sm text-gray-300">D</th>
                <th className="px-2 sm:px-6 py-3 text-center text-sm text-gray-300">L</th>
                <th className="px-2 sm:px-6 py-3 text-center text-sm text-gray-300">GD</th>
                <th className="px-2 sm:px-6 py-3 text-center text-sm text-gray-300">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-400">
                    No standings data available for this competition
                  </td>
                </tr>
              ) : (
                standings.map(function (team, index) {
                  var teamName = team.team ? team.team.name : "Unknown";
                  var position = team.rank || index + 1;
                  var points = team.points || 0;
                  var played = team.all ? team.all.played : 0;
                  var won = team.all ? team.all.win : 0;
                  var draw = team.all ? team.all.draw : 0;
                  var lost = team.all ? team.all.lose : 0;
                  var gd = team.goalsDiff || 0;

                  // Color coding: top 4 green, bottom 3 red
                  var positionColor = "text-white";
                  if (position <= 4) {
                    positionColor = "text-green-400";
                  } else if (standings.length >= 10 && position >= standings.length - 2) {
                    positionColor = "text-red-400";
                  }

                  return (
                    <tr key={team.team ? team.team.id : index} className="hover:bg-gray-700 border-b border-gray-700">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className={"text-base sm:text-lg font-bold " + positionColor}>
                          {position}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="text-sm sm:text-base">{teamName}</span>
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-center text-gray-300">{played}</td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-center text-green-400">{won}</td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-center text-yellow-400">{draw}</td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-center text-red-400">{lost}</td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-center text-gray-300">
                        <span className={gd > 0 ? "text-green-400" : gd < 0 ? "text-red-400" : ""}>
                          {gd > 0 ? "+" + gd : gd}
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                        <span className="text-base sm:text-xl font-bold text-cyan-400">{points}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
