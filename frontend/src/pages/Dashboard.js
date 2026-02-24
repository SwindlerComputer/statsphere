// ========================================
// Dashboard.js - Main Home Page
// ========================================
// Shows live matches and quick stats overview.
// Now includes a league filter dropdown so users can see
// matches from different competitions.

import { useEffect, useState } from "react";

// API_BASE = backend URL from .env file
const API_BASE = process.env.REACT_APP_API_URL;

export default function Dashboard() {
  // State to hold live matches array
  const [liveMatches, setLiveMatches] = useState([]);
  // State for league filter
  const [leagueFilter, setLeagueFilter] = useState("All");

  // Fetch live matches when component mounts
  useEffect(function () {
    fetch(API_BASE + "/api/live-matches")
      .then(function (res) { return res.json(); })
      .then(function (data) { setLiveMatches(data); })
      .catch(function (err) { console.error("Error loading live matches:", err); });
  }, []);

  // Get unique leagues from live matches for the dropdown
  var leagues = ["All", ...new Set(liveMatches.map(function (m) { return m.league; }))];

  // Filter matches by selected league
  var filteredMatches = liveMatches.filter(function (match) {
    return leagueFilter === "All" || match.league === leagueFilter;
  });

  return (
    <div className="w-full max-w-4xl px-2">
      {/* Page Header */}
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-cyan-400">
        Live Matches
      </h2>

      {/* League Filter Dropdown */}
      <div className="bg-gray-800 p-3 rounded-lg mb-4">
        <label className="text-sm text-gray-300 mr-3">Filter by League:</label>
        <select
          value={leagueFilter}
          onChange={function (e) { setLeagueFilter(e.target.value); }}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600 hover:border-cyan-400"
        >
          {leagues.map(function (league) {
            return <option key={league} value={league}>{league}</option>;
          })}
        </select>
      </div>

      {/* Live Matches Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {filteredMatches.length === 0 ? (
          <div className="col-span-2 bg-gray-800 p-6 rounded-lg text-center text-gray-400">
            No live matches right now
          </div>
        ) : (
          filteredMatches.map(function (match) {
            return (
              <div key={match.id} className="bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-700 transition">
                {/* League badge */}
                <p className="text-xs text-cyan-400 mb-2 font-semibold">{match.league}</p>
                {/* Teams and Score */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{match.home}</span>
                  <strong className="text-lg text-yellow-400 px-3">{match.score}</strong>
                  <span className="font-semibold">{match.away}</span>
                </div>
                {/* Match minute */}
                <div className="flex justify-center mt-2">
                  <span className="text-xs bg-red-600 px-2 py-1 rounded-full animate-pulse">
                    {match.minute}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Stats Overview */}
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-cyan-400">Quick Stats</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-3xl font-bold text-green-400">200</p>
          <p className="text-sm text-gray-400">Players Tracked</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-3xl font-bold text-blue-400">21</p>
          <p className="text-sm text-gray-400">Teams</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-3xl font-bold text-purple-400">7</p>
          <p className="text-sm text-gray-400">Competitions</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-3xl font-bold text-yellow-400">6</p>
          <p className="text-sm text-gray-400">Leagues</p>
        </div>
      </div>

      {/* Feature Cards */}
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-cyan-400">Explore Features</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a href="/insights" className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition block">
          <p className="font-bold text-cyan-400 mb-1">Player Insights</p>
          <p className="text-sm text-gray-400">Detailed stats, charts, and AI analysis</p>
        </a>
        <a href="/compare" className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition block">
          <p className="font-bold text-cyan-400 mb-1">Compare Players</p>
          <p className="text-sm text-gray-400">Head-to-head stat comparison</p>
        </a>
        <a href="/predictions" className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition block">
          <p className="font-bold text-cyan-400 mb-1">Match Predictions</p>
          <p className="text-sm text-gray-400">AI-powered match outcome predictor</p>
        </a>
      </div>
    </div>
  );
}
