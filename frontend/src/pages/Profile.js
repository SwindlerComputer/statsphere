// ========================================
// Profile.js - My Profile Page
// ========================================
// Shows user info and lets them pick favorites:
// - Favorite players (from the 200 player list)
// - Favorite team
// - Favorite league
// Favorites are saved in localStorage so they persist.

import { useEffect, useState } from "react";

var API_BASE = process.env.REACT_APP_API_URL;

export default function Profile({ user }) {
  // All players loaded from backend
  var [allPlayers, setAllPlayers] = useState([]);
  // Search text for finding players
  var [playerSearch, setPlayerSearch] = useState("");

  // Favorites loaded from localStorage
  var [favoritePlayers, setFavoritePlayers] = useState([]);
  var [favoriteTeam, setFavoriteTeam] = useState("");
  var [favoriteLeague, setFavoriteLeague] = useState("");

  // Success message
  var [saved, setSaved] = useState(false);

  // Available teams and leagues
  var teams = [
    "Real Madrid", "Barcelona", "Manchester City", "Arsenal", "Liverpool",
    "Chelsea", "Manchester United", "Bayern Munich", "PSG", "Juventus",
    "Inter Milan", "AC Milan", "Atletico Madrid", "Napoli",
    "Borussia Dortmund", "Bayer Leverkusen", "Galatasaray",
    "Al Nassr", "Al Hilal", "Al Ittihad"
  ];

  var leagues = [
    "Premier League", "La Liga", "Serie A", "Bundesliga",
    "Ligue 1", "Saudi Pro League", "Super Lig"
  ];

  // Load players from backend
  useEffect(function () {
    fetch(API_BASE + "/api/insights/players")
      .then(function (res) { return res.json(); })
      .then(function (data) { setAllPlayers(data); })
      .catch(function (err) { console.error("Error:", err); });
  }, []);

  // Load saved favorites from localStorage when page loads
  useEffect(function () {
    try {
      var savedFavPlayers = localStorage.getItem("favoritePlayers");
      var savedFavTeam = localStorage.getItem("favoriteTeam");
      var savedFavLeague = localStorage.getItem("favoriteLeague");

      if (savedFavPlayers) setFavoritePlayers(JSON.parse(savedFavPlayers));
      if (savedFavTeam) setFavoriteTeam(savedFavTeam);
      if (savedFavLeague) setFavoriteLeague(savedFavLeague);
    } catch (err) {
      console.error("Error loading favorites:", err);
    }
  }, []);

  // Add a player to favorites (max 5)
  function addFavoritePlayer(player) {
    // Check if already in favorites
    var alreadyAdded = favoritePlayers.some(function (fav) {
      return fav.id === player.id;
    });
    if (alreadyAdded) return;

    if (favoritePlayers.length >= 5) {
      alert("You can only have 5 favorite players. Remove one first.");
      return;
    }

    var updated = [...favoritePlayers, { id: player.id, name: player.name, team: player.team }];
    setFavoritePlayers(updated);
    localStorage.setItem("favoritePlayers", JSON.stringify(updated));
    setPlayerSearch("");
    showSaved();
  }

  // Remove a player from favorites
  function removeFavoritePlayer(playerId) {
    var updated = favoritePlayers.filter(function (fav) {
      return fav.id !== playerId;
    });
    setFavoritePlayers(updated);
    localStorage.setItem("favoritePlayers", JSON.stringify(updated));
    showSaved();
  }

  // Save favorite team
  function handleTeamChange(e) {
    var value = e.target.value;
    setFavoriteTeam(value);
    localStorage.setItem("favoriteTeam", value);
    showSaved();
  }

  // Save favorite league
  function handleLeagueChange(e) {
    var value = e.target.value;
    setFavoriteLeague(value);
    localStorage.setItem("favoriteLeague", value);
    showSaved();
  }

  // Show "Saved!" message briefly
  function showSaved() {
    setSaved(true);
    setTimeout(function () { setSaved(false); }, 2000);
  }

  // Filter players for the search dropdown
  var searchResults = [];
  if (playerSearch.length >= 2) {
    searchResults = allPlayers.filter(function (p) {
      return p.name.toLowerCase().includes(playerSearch.toLowerCase());
    }).slice(0, 10);
  }

  // If not logged in, show a message
  if (!user) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-4">My Profile</h1>
        <div className="bg-gray-800 rounded-lg p-8">
          <p className="text-gray-400 mb-4">You need to be logged in to view your profile.</p>
          <a href="/login" className="text-cyan-400 hover:underline">Login here</a>
          <span className="text-gray-500 mx-2">or</span>
          <a href="/register" className="text-cyan-400 hover:underline">Create an account</a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6 text-center">
        My Profile
      </h1>

      {/* User Info Card */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-cyan-500 flex items-center justify-center text-xl sm:text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Saved confirmation */}
      {saved && (
        <div className="bg-green-900 border border-green-700 text-green-200 px-3 py-2 rounded-lg mb-4 text-center text-sm">
          Saved!
        </div>
      )}

      {/* Favorite Team */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-4">
        <h3 className="text-lg font-semibold text-cyan-400 mb-3">Favorite Team</h3>
        <select
          value={favoriteTeam}
          onChange={handleTeamChange}
          className="w-full p-2 sm:p-3 rounded bg-gray-700 border border-gray-600 text-white text-sm sm:text-base"
        >
          <option value="">Select your favorite team</option>
          {teams.map(function (team) {
            return <option key={team} value={team}>{team}</option>;
          })}
        </select>
        {favoriteTeam && (
          <p className="mt-2 text-sm text-gray-300">Your team: <span className="text-cyan-400 font-semibold">{favoriteTeam}</span></p>
        )}
      </div>

      {/* Favorite League */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-4">
        <h3 className="text-lg font-semibold text-cyan-400 mb-3">Favorite League</h3>
        <select
          value={favoriteLeague}
          onChange={handleLeagueChange}
          className="w-full p-2 sm:p-3 rounded bg-gray-700 border border-gray-600 text-white text-sm sm:text-base"
        >
          <option value="">Select your favorite league</option>
          {leagues.map(function (lg) {
            return <option key={lg} value={lg}>{lg}</option>;
          })}
        </select>
        {favoriteLeague && (
          <p className="mt-2 text-sm text-gray-300">Your league: <span className="text-cyan-400 font-semibold">{favoriteLeague}</span></p>
        )}
      </div>

      {/* Favorite Players */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-4">
        <h3 className="text-lg font-semibold text-cyan-400 mb-3">
          Favorite Players ({favoritePlayers.length}/5)
        </h3>

        {/* Current favorites */}
        {favoritePlayers.length > 0 && (
          <div className="space-y-2 mb-4">
            {favoritePlayers.map(function (fav) {
              return (
                <div key={fav.id} className="flex justify-between items-center bg-gray-700 rounded p-2 sm:p-3">
                  <div>
                    <span className="font-semibold text-sm sm:text-base">{fav.name}</span>
                    <span className="text-gray-400 text-xs sm:text-sm ml-2">({fav.team})</span>
                  </div>
                  <button
                    onClick={function () { removeFavoritePlayer(fav.id); }}
                    className="text-red-400 hover:text-red-300 text-xs sm:text-sm px-2 py-1 rounded hover:bg-gray-600"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {favoritePlayers.length === 0 && (
          <p className="text-gray-500 text-sm mb-4">No favorite players yet. Search to add some!</p>
        )}

        {/* Search to add players */}
        {favoritePlayers.length < 5 && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a player to add..."
              value={playerSearch}
              onChange={function (e) { setPlayerSearch(e.target.value); }}
              className="w-full p-2 sm:p-3 rounded bg-gray-700 border border-gray-600 focus:border-cyan-400 focus:outline-none text-sm sm:text-base"
            />

            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-700 rounded-lg border border-gray-600 max-h-48 overflow-y-auto">
                {searchResults.map(function (player) {
                  var isAlreadyFav = favoritePlayers.some(function (f) { return f.id === player.id; });
                  return (
                    <button
                      key={player.id}
                      onClick={function () { addFavoritePlayer(player); }}
                      disabled={isAlreadyFav}
                      className={
                        "w-full text-left px-3 py-2 text-sm hover:bg-gray-600 transition border-b border-gray-600 last:border-0 " +
                        (isAlreadyFav ? "text-gray-500 cursor-not-allowed" : "text-white")
                      }
                    >
                      {player.name} <span className="text-gray-400">- {player.team}</span>
                      {isAlreadyFav && <span className="text-xs text-cyan-400 ml-2">(added)</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Summary */}
      {(favoriteTeam || favoriteLeague || favoritePlayers.length > 0) && (
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-3">Your Summary</h3>
          <div className="space-y-2 text-sm sm:text-base">
            {favoriteTeam && <p className="text-gray-300">Team: <span className="text-white font-semibold">{favoriteTeam}</span></p>}
            {favoriteLeague && <p className="text-gray-300">League: <span className="text-white font-semibold">{favoriteLeague}</span></p>}
            {favoritePlayers.length > 0 && (
              <p className="text-gray-300">Players: <span className="text-white font-semibold">{favoritePlayers.map(function (f) { return f.name; }).join(", ")}</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
