// ========================================
// Profile.js - My Profile Page
// ========================================
// This page lets logged-in users manage their favorites.
// All favorites are saved to localStorage (browser storage)
// so they persist even after refreshing the page.
//
// FEATURES:
// - User info card showing name and email
// - Favorite Team: click "Add" to pick a team from a list
// - Favorite League: click "Add" to pick a league from a list
// - Favorite Players: search and click "+" to add (max 5)
//
// HOW LOCALSTORAGE WORKS:
// - localStorage.setItem("key", "value") saves data
// - localStorage.getItem("key") loads data
// - Data is stored as strings, so we use JSON.stringify()
//   to save arrays/objects and JSON.parse() to load them
// ========================================

import { useEffect, useState } from "react";

// Backend URL from .env file
var API_BASE = process.env.REACT_APP_API_URL;

export default function Profile({ user }) {
  // All players loaded from the backend (for searching)
  var [allPlayers, setAllPlayers] = useState([]);
  // What the user typed in the player search box
  var [playerSearch, setPlayerSearch] = useState("");

  // The user's saved favorites
  var [favoritePlayers, setFavoritePlayers] = useState([]);
  var [favoriteTeam, setFavoriteTeam] = useState("");
  var [favoriteLeague, setFavoriteLeague] = useState("");

  // Controls which "picker" panel is open
  // Can be: "" (none), "team", "league", or "player"
  var [openPicker, setOpenPicker] = useState("");

  // "Saved!" message
  var [saved, setSaved] = useState(false);

  // Search text for filtering teams
  var [teamSearch, setTeamSearch] = useState("");
  // Search text for filtering leagues
  var [leagueSearch, setLeagueSearch] = useState("");

  // All available teams the user can pick from
  var teams = [
    "Real Madrid", "Barcelona", "Manchester City", "Arsenal", "Liverpool",
    "Chelsea", "Manchester United", "Bayern Munich", "PSG", "Juventus",
    "Inter Milan", "AC Milan", "Atletico Madrid", "Napoli",
    "Borussia Dortmund", "Bayer Leverkusen", "Galatasaray",
    "Al Nassr", "Al Hilal", "Al Ittihad", "Tottenham", "Aston Villa"
  ];

  // All available leagues
  var leagues = [
    "Premier League", "La Liga", "Serie A", "Bundesliga",
    "Ligue 1", "Saudi Pro League", "Super Lig", "Champions League"
  ];

  // ========================================
  // LOAD DATA: Fetch players from backend
  // ========================================
  // useEffect runs once when the page first loads (empty [] array)
  useEffect(function () {
    fetch(API_BASE + "/api/insights/players")
      .then(function (res) { return res.json(); })
      .then(function (data) { setAllPlayers(data); })
      .catch(function (err) { console.error("Error loading players:", err); });
  }, []);

  // ========================================
  // LOAD DATA: Get saved favorites from localStorage
  // ========================================
  // This also runs once when the page loads
  useEffect(function () {
    try {
      var savedPlayers = localStorage.getItem("favoritePlayers");
      var savedTeam = localStorage.getItem("favoriteTeam");
      var savedLeague = localStorage.getItem("favoriteLeague");

      // JSON.parse turns a string back into an array
      if (savedPlayers) setFavoritePlayers(JSON.parse(savedPlayers));
      if (savedTeam) setFavoriteTeam(savedTeam);
      if (savedLeague) setFavoriteLeague(savedLeague);
    } catch (err) {
      console.error("Error loading favorites:", err);
    }
  }, []);

  // ========================================
  // FUNCTION: Add a player to favorites
  // ========================================
  // Maximum 5 players allowed
  function addFavoritePlayer(player) {
    // Check if this player is already in the list
    var alreadyAdded = false;
    for (var i = 0; i < favoritePlayers.length; i++) {
      if (favoritePlayers[i].id === player.id) {
        alreadyAdded = true;
      }
    }
    if (alreadyAdded) return;

    // Check we haven't hit the limit
    if (favoritePlayers.length >= 5) {
      alert("Maximum 5 favorite players. Remove one first.");
      return;
    }

    // Create a simple object with just the info we need
    var newPlayer = { id: player.id, name: player.name, team: player.team };
    // .concat() adds newPlayer to the array and returns a new array
    var updated = favoritePlayers.concat(newPlayer);
    setFavoritePlayers(updated);
    // Save to localStorage so it persists after page refresh
    localStorage.setItem("favoritePlayers", JSON.stringify(updated));
    setPlayerSearch("");
    showSaved();
  }

  // ========================================
  // FUNCTION: Remove a player from favorites
  // ========================================
  // .filter() keeps only players whose id does NOT match
  function removeFavoritePlayer(playerId) {
    var updated = favoritePlayers.filter(function (fav) {
      return fav.id !== playerId;
    });
    setFavoritePlayers(updated);
    localStorage.setItem("favoritePlayers", JSON.stringify(updated));
    showSaved();
  }

  // ========================================
  // FUNCTION: Set favorite team
  // ========================================
  function selectTeam(teamName) {
    setFavoriteTeam(teamName);
    localStorage.setItem("favoriteTeam", teamName);
    setOpenPicker("");
    setTeamSearch("");
    showSaved();
  }

  // ========================================
  // FUNCTION: Remove favorite team
  // ========================================
  function removeTeam() {
    setFavoriteTeam("");
    localStorage.removeItem("favoriteTeam");
    showSaved();
  }

  // ========================================
  // FUNCTION: Set favorite league
  // ========================================
  function selectLeague(leagueName) {
    setFavoriteLeague(leagueName);
    localStorage.setItem("favoriteLeague", leagueName);
    setOpenPicker("");
    setLeagueSearch("");
    showSaved();
  }

  // ========================================
  // FUNCTION: Remove favorite league
  // ========================================
  function removeLeague() {
    setFavoriteLeague("");
    localStorage.removeItem("favoriteLeague");
    showSaved();
  }

  // ========================================
  // FUNCTION: Show "Saved!" message for 2 seconds
  // ========================================
  // setTimeout calls a function after a delay (in milliseconds)
  function showSaved() {
    setSaved(true);
    setTimeout(function () { setSaved(false); }, 2000);
  }

  // ========================================
  // SEARCH: Filter players based on what user typed
  // ========================================
  // Only search if they typed at least 2 characters
  var searchResults = [];
  if (playerSearch.length >= 2) {
    var lowerSearch = playerSearch.toLowerCase();
    for (var i = 0; i < allPlayers.length; i++) {
      if (allPlayers[i].name.toLowerCase().indexOf(lowerSearch) >= 0) {
        searchResults.push(allPlayers[i]);
      }
      // Only show first 8 results
      if (searchResults.length >= 8) break;
    }
  }

  // Filter teams based on team search
  var filteredTeams = [];
  for (var t = 0; t < teams.length; t++) {
    if (teamSearch === "" || teams[t].toLowerCase().indexOf(teamSearch.toLowerCase()) >= 0) {
      filteredTeams.push(teams[t]);
    }
  }

  // Filter leagues based on league search
  var filteredLeagues = [];
  for (var l = 0; l < leagues.length; l++) {
    if (leagueSearch === "" || leagues[l].toLowerCase().indexOf(leagueSearch.toLowerCase()) >= 0) {
      filteredLeagues.push(leagues[l]);
    }
  }

  // ========================================
  // NOT LOGGED IN: Show login prompt
  // ========================================
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

  // ========================================
  // MAIN PAGE LAYOUT
  // ========================================
  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6 text-center">
        My Profile
      </h1>

      {/* "Saved!" confirmation banner */}
      {saved && (
        <div className="bg-green-900 border border-green-700 text-green-200 px-3 py-2 rounded-lg mb-4 text-center text-sm">
          Saved!
        </div>
      )}

      {/* ========================================
          USER INFO CARD
          ======================================== */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-4">
          {/* Avatar circle with first letter of username */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-cyan-500 flex items-center justify-center text-xl sm:text-2xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>

      {/* ========================================
          FAVORITE TEAM SECTION
          ======================================== */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-cyan-400">Favorite Team</h3>
          {/* Add/Change button */}
          <button
            onClick={function () {
              setOpenPicker(openPicker === "team" ? "" : "team");
              setTeamSearch("");
            }}
            className={
              "px-3 py-1 rounded text-sm font-semibold transition " +
              (openPicker === "team"
                ? "bg-gray-600 text-gray-300"
                : "bg-cyan-500 hover:bg-cyan-600 text-white")
            }
          >
            {openPicker === "team" ? "Cancel" : (favoriteTeam ? "Change" : "+ Add")}
          </button>
        </div>

        {/* Show current favorite team */}
        {favoriteTeam && openPicker !== "team" && (
          <div className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-sm font-bold">
                {favoriteTeam.charAt(0)}
              </div>
              <span className="font-semibold">{favoriteTeam}</span>
            </div>
            <button
              onClick={removeTeam}
              className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-gray-600"
            >
              Remove
            </button>
          </div>
        )}

        {/* No team selected yet */}
        {!favoriteTeam && openPicker !== "team" && (
          <p className="text-gray-500 text-sm">No favorite team yet. Click "+ Add" to pick one.</p>
        )}

        {/* Team picker panel (shows when Add is clicked) */}
        {openPicker === "team" && (
          <div className="mt-2">
            <input
              type="text"
              placeholder="Search teams..."
              value={teamSearch}
              onChange={function (e) { setTeamSearch(e.target.value); }}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-cyan-400 focus:outline-none text-sm mb-2"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {filteredTeams.map(function (team) {
                var isSelected = team === favoriteTeam;
                return (
                  <button
                    key={team}
                    onClick={function () { selectTeam(team); }}
                    className={
                      "p-2 rounded text-sm text-left transition " +
                      (isSelected
                        ? "bg-cyan-600 text-white font-semibold"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300")
                    }
                  >
                    {team}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================
          FAVORITE LEAGUE SECTION
          ======================================== */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-cyan-400">Favorite League</h3>
          <button
            onClick={function () {
              setOpenPicker(openPicker === "league" ? "" : "league");
              setLeagueSearch("");
            }}
            className={
              "px-3 py-1 rounded text-sm font-semibold transition " +
              (openPicker === "league"
                ? "bg-gray-600 text-gray-300"
                : "bg-cyan-500 hover:bg-cyan-600 text-white")
            }
          >
            {openPicker === "league" ? "Cancel" : (favoriteLeague ? "Change" : "+ Add")}
          </button>
        </div>

        {/* Show current favorite league */}
        {favoriteLeague && openPicker !== "league" && (
          <div className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold">
                {favoriteLeague.charAt(0)}
              </div>
              <span className="font-semibold">{favoriteLeague}</span>
            </div>
            <button
              onClick={removeLeague}
              className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-gray-600"
            >
              Remove
            </button>
          </div>
        )}

        {!favoriteLeague && openPicker !== "league" && (
          <p className="text-gray-500 text-sm">No favorite league yet. Click "+ Add" to pick one.</p>
        )}

        {/* League picker panel */}
        {openPicker === "league" && (
          <div className="mt-2">
            <input
              type="text"
              placeholder="Search leagues..."
              value={leagueSearch}
              onChange={function (e) { setLeagueSearch(e.target.value); }}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-cyan-400 focus:outline-none text-sm mb-2"
            />
            <div className="grid grid-cols-2 gap-2">
              {filteredLeagues.map(function (lg) {
                var isSelected = lg === favoriteLeague;
                return (
                  <button
                    key={lg}
                    onClick={function () { selectLeague(lg); }}
                    className={
                      "p-2 rounded text-sm text-left transition " +
                      (isSelected
                        ? "bg-green-600 text-white font-semibold"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300")
                    }
                  >
                    {lg}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================
          FAVORITE PLAYERS SECTION
          ======================================== */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-cyan-400">
            Favorite Players ({favoritePlayers.length}/5)
          </h3>
          {/* Only show Add button if under the 5 player limit */}
          {favoritePlayers.length < 5 && (
            <button
              onClick={function () {
                setOpenPicker(openPicker === "player" ? "" : "player");
                setPlayerSearch("");
              }}
              className={
                "px-3 py-1 rounded text-sm font-semibold transition " +
                (openPicker === "player"
                  ? "bg-gray-600 text-gray-300"
                  : "bg-cyan-500 hover:bg-cyan-600 text-white")
              }
            >
              {openPicker === "player" ? "Cancel" : "+ Add"}
            </button>
          )}
        </div>

        {/* List of current favorite players */}
        {favoritePlayers.length > 0 && (
          <div className="space-y-2 mb-3">
            {favoritePlayers.map(function (fav, index) {
              return (
                <div key={fav.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    {/* Number badge */}
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-cyan-400">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{fav.name}</p>
                      <p className="text-xs text-gray-400">{fav.team}</p>
                    </div>
                  </div>
                  <button
                    onClick={function () { removeFavoritePlayer(fav.id); }}
                    className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-gray-600"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {favoritePlayers.length === 0 && openPicker !== "player" && (
          <p className="text-gray-500 text-sm">No favorite players yet. Click "+ Add" to search and add players.</p>
        )}

        {/* Player search panel (shows when + Add is clicked) */}
        {openPicker === "player" && (
          <div className="mt-2 relative">
            <input
              type="text"
              placeholder="Type a player name to search..."
              value={playerSearch}
              onChange={function (e) { setPlayerSearch(e.target.value); }}
              className="w-full p-2 sm:p-3 rounded bg-gray-700 border border-gray-600 focus:border-cyan-400 focus:outline-none text-sm"
            />

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-gray-700 rounded-lg border border-gray-600 max-h-48 overflow-y-auto">
                {searchResults.map(function (player) {
                  // Check if this player is already in favorites
                  var isAlreadyFav = false;
                  for (var j = 0; j < favoritePlayers.length; j++) {
                    if (favoritePlayers[j].id === player.id) {
                      isAlreadyFav = true;
                    }
                  }
                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between px-3 py-2 border-b border-gray-600 last:border-0"
                    >
                      <div>
                        <span className="text-sm font-semibold">{player.name}</span>
                        <span className="text-xs text-gray-400 ml-2">{player.team}</span>
                      </div>
                      {isAlreadyFav ? (
                        <span className="text-xs text-cyan-400 font-semibold">Added</span>
                      ) : (
                        <button
                          onClick={function () { addFavoritePlayer(player); }}
                          className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs px-3 py-1 rounded font-semibold transition"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hint text */}
            {playerSearch.length > 0 && playerSearch.length < 2 && (
              <p className="text-xs text-gray-500 mt-1">Type at least 2 characters to search...</p>
            )}
            {playerSearch.length >= 2 && searchResults.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">No players found for "{playerSearch}"</p>
            )}
          </div>
        )}
      </div>

      {/* ========================================
          SUMMARY CARD
          ======================================== */}
      {(favoriteTeam || favoriteLeague || favoritePlayers.length > 0) && (
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-3">Your Favorites Summary</h3>
          <div className="space-y-2 text-sm">
            {favoriteTeam && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-16">Team:</span>
                <span className="font-semibold text-white">{favoriteTeam}</span>
              </div>
            )}
            {favoriteLeague && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-16">League:</span>
                <span className="font-semibold text-white">{favoriteLeague}</span>
              </div>
            )}
            {favoritePlayers.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-gray-400 w-16">Players:</span>
                <span className="font-semibold text-white">
                  {favoritePlayers.map(function (f) { return f.name; }).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
