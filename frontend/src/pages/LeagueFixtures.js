// LeagueFixtures.js
// This page shows football fixtures (matches) for a league
// It gets data from our backend and shows it in cards

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// API_BASE = backend URL from .env file
const API_BASE = process.env.REACT_APP_API_URL;

export default function LeagueFixtures() {
  // Get league ID from the URL
  const { leagueId } = useParams();
  
  // Variables to store data
  const [fixtures, setFixtures] = useState([]); // List of matches
  const [loading, setLoading] = useState(true); // Is data loading?
  const [error, setError] = useState(null); // Any error message
  const [season, setSeason] = useState("2023"); // Which season
  const [selectedLeague, setSelectedLeague] = useState(leagueId || "39"); // Which league
  
  // List of leagues we can choose from
  const leagues = [
    { id: "39", name: "Premier League" },
    { id: "140", name: "La Liga" },
    { id: "78", name: "Bundesliga" },
    { id: "135", name: "Serie A" },
    { id: "61", name: "Ligue 1" }
  ];

  // This runs when page loads or when league/season changes
  useEffect(function() {
    setLoading(true);
    setError(null);
    
    // Build URL to call backend
    const url = API_BASE + "/api/football/fixtures?leagueId=" + selectedLeague + "&season=" + season;
    
    // Call the backend
    fetch(url)
      .then(function(response) {
        if (!response.ok) {
          throw new Error("Could not get fixtures");
        }
        return response.json();
      })
      .then(function(data) {
        // Check if we have data
        if (data.response && data.response.length > 0) {
          setFixtures(data.response);
        } else {
          setFixtures([]);
        }
        setLoading(false);
      })
      .catch(function(err) {
        console.error("Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [selectedLeague, season]);

  // Handle season dropdown change
  function handleSeasonChange(e) {
    setSeason(e.target.value);
  }

  // Handle league dropdown change
  function handleLeagueChange(e) {
    setSelectedLeague(e.target.value);
  }

  // Get league name from ID
  function getLeagueName(id) {
    for (let i = 0; i < leagues.length; i++) {
      if (leagues[i].id === id) {
        return leagues[i].name;
      }
    }
    return "League " + id;
  }

  // Format date to readable format
  function formatDate(dateString) {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }

  // Get status color
  function getStatusColor(status) {
    if (status === "FT") {
      return "bg-gray-600"; // Finished
    } else if (status === "NS") {
      return "bg-blue-600"; // Not Started
    } else {
      return "bg-red-600"; // Live
    }
  }

  // Show the page
  return (
    <div className="w-full max-w-6xl px-2">
      {/* Page Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-4">
        {getLeagueName(selectedLeague)} Fixtures
      </h1>

      {/* Dropdowns */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* League Dropdown */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Select League:</label>
            <select
              value={selectedLeague}
              onChange={handleLeagueChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 hover:border-cyan-400"
            >
              {leagues.map(function(league) {
                return (
                  <option key={league.id} value={league.id}>
                    {league.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Season Dropdown */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Select Season:</label>
            <select
              value={season}
              onChange={handleSeasonChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 hover:border-cyan-400"
            >
              <option value="2021">2021-2022</option>
              <option value="2022">2022-2023</option>
              <option value="2023">2023-2024</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Message */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading fixtures...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Fixtures Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fixtures.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-gray-400">
              No fixtures available
            </div>
          ) : (
            fixtures.map(function(fixture, index) {
              // Get match data
              const match = fixture.fixture;
              const teams = fixture.teams;
              const goals = fixture.goals;
              
              // Get team names
              const homeTeam = teams.home ? teams.home.name : "Unknown";
              const awayTeam = teams.away ? teams.away.name : "Unknown";
              const homeLogo = teams.home ? teams.home.logo : "";
              const awayLogo = teams.away ? teams.away.logo : "";
              
              // Get scores
              const homeScore = goals.home !== null ? goals.home : "-";
              const awayScore = goals.away !== null ? goals.away : "-";
              
              // Get status
              const status = match.status ? match.status.short : "NS";
              const matchDate = match.date ? formatDate(match.date) : "TBD";
              
              return (
                <div
                  key={match.id || index}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition"
                >
                  {/* Date and Status */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-gray-400">{matchDate}</span>
                    <span className={"text-xs px-2 py-1 rounded " + getStatusColor(status)}>
                      {status}
                    </span>
                  </div>

                  {/* Home Team */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {homeLogo && (
                        <img src={homeLogo} alt={homeTeam} className="h-8 w-8 mr-3" />
                      )}
                      <span>{homeTeam}</span>
                    </div>
                    <span className="text-xl font-bold text-cyan-400">{homeScore}</span>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {awayLogo && (
                        <img src={awayLogo} alt={awayTeam} className="h-8 w-8 mr-3" />
                      )}
                      <span>{awayTeam}</span>
                    </div>
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
