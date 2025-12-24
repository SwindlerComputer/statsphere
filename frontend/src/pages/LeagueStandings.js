// LeagueStandings.js
// This page shows football league standings (team rankings)
// It gets data from our backend and shows it in a table

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function LeagueStandings() {
  // Get league ID from the URL
  // Example: /leagues/39/standings means leagueId = "39"
  const { leagueId } = useParams();
  
  // These are variables that store data
  // useState is a React function that lets us store changing data
  const [standings, setStandings] = useState([]); // List of teams
  const [loading, setLoading] = useState(true); // Is data loading? (true or false)
  const [error, setError] = useState(null); // Any error message
  const [season, setSeason] = useState("2023"); // Which season (2021, 2022, or 2023)
  const [selectedLeague, setSelectedLeague] = useState(leagueId || "39"); // Which league
  
  // List of leagues we can choose from
  const leagues = [
    { id: "39", name: "Premier League" },
    { id: "140", name: "La Liga" },
    { id: "78", name: "Bundesliga" },
    { id: "135", name: "Serie A" },
    { id: "61", name: "Ligue 1" }
  ];

  // This function runs when the page loads or when season/league changes
  useEffect(function() {
    // Set loading to true (show loading message)
    setLoading(true);
    setError(null);
    
    // Build the URL to call our backend
    const url = "http://localhost:5000/api/football/standings?leagueId=" + selectedLeague + "&season=" + season;
    
    // Call the backend API
    fetch(url)
      .then(function(response) {
        // Check if we got data successfully
        if (!response.ok) {
          throw new Error("Could not get standings");
        }
        // Convert response to JSON (JavaScript object)
        return response.json();
      })
      .then(function(data) {
        // Check if we have data
        if (data.response && data.response.length > 0) {
          // Get the standings from the response
          const leagueData = data.response[0];
          if (leagueData.league && leagueData.league.standings) {
            // Save the standings to our state
            setStandings(leagueData.league.standings[0] || []);
          } else {
            setStandings([]);
          }
        } else {
          setStandings([]);
        }
        setLoading(false); // Done loading
      })
      .catch(function(err) {
        // If something went wrong, save the error
        console.error("Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [selectedLeague, season]); // Run again if league or season changes

  // Function to handle when user changes the season dropdown
  function handleSeasonChange(e) {
    setSeason(e.target.value);
  }

  // Function to handle when user changes the league dropdown
  function handleLeagueChange(e) {
    setSelectedLeague(e.target.value);
  }

  // Function to get league name from ID
  function getLeagueName(id) {
    for (let i = 0; i < leagues.length; i++) {
      if (leagues[i].id === id) {
        return leagues[i].name;
      }
    }
    return "League " + id;
  }

  // Show the page
  return (
    <div className="w-full max-w-6xl">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-cyan-400 mb-4">
        {getLeagueName(selectedLeague)} Standings
      </h1>

      {/* Dropdowns for League and Season */}
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

      {/* Show loading message */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading...</p>
        </div>
      )}

      {/* Show error message if something went wrong */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Show the standings table */}
      {!loading && !error && (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm text-gray-300">Pos</th>
                <th className="px-6 py-3 text-left text-sm text-gray-300">Team</th>
                <th className="px-6 py-3 text-center text-sm text-gray-300">Played</th>
                <th className="px-6 py-3 text-center text-sm text-gray-300">Won</th>
                <th className="px-6 py-3 text-center text-sm text-gray-300">Draw</th>
                <th className="px-6 py-3 text-center text-sm text-gray-300">Lost</th>
                <th className="px-6 py-3 text-center text-sm text-gray-300">Points</th>
              </tr>
            </thead>
            
            {/* Table Body - Show each team */}
            <tbody>
              {standings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    No data available
                  </td>
                </tr>
              ) : (
                standings.map(function(team, index) {
                  // Get team info
                  const teamName = team.team ? team.team.name : "Unknown";
                  const teamLogo = team.team ? team.team.logo : "";
                  const position = team.rank || index + 1;
                  const points = team.points || 0;
                  const played = team.all ? team.all.played : 0;
                  const won = team.all ? team.all.win : 0;
                  const draw = team.all ? team.all.draw : 0;
                  const lost = team.all ? team.all.lose : 0;
                  
                  // Color for position (green = top 4, red = bottom 3)
                  let positionColor = "text-white";
                  if (position <= 4) {
                    positionColor = "text-green-400";
                  } else if (position >= standings.length - 2) {
                    positionColor = "text-red-400";
                  }
                  
                  return (
                    <tr key={team.team ? team.team.id : index} className="hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <span className={"text-lg font-bold " + positionColor}>
                          {position}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {teamLogo && (
                            <img src={teamLogo} alt={teamName} className="h-8 w-8 mr-3" />
                          )}
                          <span>{teamName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-300">{played}</td>
                      <td className="px-6 py-4 text-center text-green-400">{won}</td>
                      <td className="px-6 py-4 text-center text-yellow-400">{draw}</td>
                      <td className="px-6 py-4 text-center text-red-400">{lost}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xl font-bold text-cyan-400">{points}</span>
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
