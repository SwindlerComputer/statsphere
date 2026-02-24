// ========================================
// Rankings.js - Team Power Rankings
// ========================================
// Shows a FIFA-style ranking table for all teams.
//
// HOW THE RANKING SCORE IS CALCULATED:
//   overallScore = (attack * 0.35) + (defense * 0.30) + (form * 0.20) + (leagueBonus * 0.15)
//
//   - attack (0-100):  how good the team is at scoring goals
//   - defense (0-100): how good the team is at stopping goals
//   - form (0-100):    how well the team is playing recently
//   - leagueBonus:     bonus points for playing in a harder league
//
// LEAGUE BONUS VALUES:
//   Premier League:   15 (hardest league)
//   La Liga:          13
//   Serie A:          12
//   Bundesliga:       12
//   Ligue 1:          10
//   Saudi Pro League:  6 (weakest league)
//
// Teams are sorted by overall score (highest = rank 1)
// ========================================

import { useEffect, useState } from "react";

var API_BASE = process.env.REACT_APP_API_URL;

// League bonus points (outside the component so it doesn't get recreated)
// Harder leagues get more bonus points
function getLeagueBonus(league) {
  if (league === "Premier League") return 15;
  if (league === "La Liga") return 13;
  if (league === "Serie A") return 12;
  if (league === "Bundesliga") return 12;
  if (league === "Ligue 1") return 10;
  if (league === "Saudi Pro League") return 6;
  return 8;
}

// Calculate the overall ranking score for a team
function calculateOverall(team) {
  var attackScore = team.attack * 0.35;
  var defenseScore = team.defense * 0.30;
  var formScore = team.form * 0.20;
  var leagueScore = getLeagueBonus(team.league) * 0.15;
  var total = attackScore + defenseScore + formScore + leagueScore;
  return Math.round(total * 10) / 10;
}

export default function Rankings() {
  var [teams, setTeams] = useState([]);
  var [loading, setLoading] = useState(true);
  // Filter: which league to show ("all" or a specific league name)
  var [leagueFilter, setLeagueFilter] = useState("all");

  // Fetch the teams when the page loads
  useEffect(function () {
    fetch(API_BASE + "/api/prediction-teams")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        // Calculate score for each team and sort by score (highest first)
        var teamsWithScore = [];
        for (var i = 0; i < data.length; i++) {
          var team = data[i];
          team.overall = calculateOverall(team);
          teamsWithScore.push(team);
        }

        // Sort by overall score (highest first)
        teamsWithScore.sort(function (a, b) {
          return b.overall - a.overall;
        });

        setTeams(teamsWithScore);
        setLoading(false);
      })
      .catch(function (err) {
        console.error("Failed to load teams:", err);
        setLoading(false);
      });
  }, []);

  // Get unique leagues for the filter dropdown
  function getLeagues() {
    var list = [];
    for (var i = 0; i < teams.length; i++) {
      if (list.indexOf(teams[i].league) === -1) {
        list.push(teams[i].league);
      }
    }
    return list;
  }

  // Filter teams by selected league
  function getFilteredTeams() {
    if (leagueFilter === "all") return teams;
    var filtered = [];
    for (var i = 0; i < teams.length; i++) {
      if (teams[i].league === leagueFilter) {
        filtered.push(teams[i]);
      }
    }
    return filtered;
  }

  // Get a colour for the rank badge
  function getRankColor(rank) {
    if (rank === 1) return "bg-yellow-500 text-black";
    if (rank === 2) return "bg-gray-300 text-black";
    if (rank === 3) return "bg-amber-600 text-white";
    return "bg-gray-700 text-gray-300";
  }

  // Get colour for the stat bar based on value
  function getBarColor(value) {
    if (value >= 90) return "bg-green-400";
    if (value >= 80) return "bg-cyan-400";
    if (value >= 70) return "bg-yellow-400";
    return "bg-red-400";
  }

  // Get an arrow showing if the team is top, mid, or bottom tier
  function getTierLabel(rank, total) {
    if (rank <= 3) return "Elite";
    if (rank <= Math.round(total / 2)) return "Strong";
    if (rank <= Math.round(total * 0.75)) return "Mid";
    return "Developing";
  }

  function getTierColor(rank, total) {
    if (rank <= 3) return "text-yellow-400";
    if (rank <= Math.round(total / 2)) return "text-green-400";
    if (rank <= Math.round(total * 0.75)) return "text-gray-400";
    return "text-red-400";
  }

  var filteredTeams = getFilteredTeams();

  if (loading) {
    return (
      <div className="text-center text-gray-400 mt-20">
        <p className="text-lg">Loading rankings...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2">
      <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-2 text-center">
        Team Power Rankings
      </h1>
      <p className="text-gray-400 text-center mb-6 text-sm">
        Teams ranked by overall score. Based on attack, defense, form, and league strength.
      </p>

      {/* Formula explanation */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-1">Ranking Formula:</h3>
        <p className="text-xs text-gray-400">
          Overall = (Attack x 0.35) + (Defense x 0.30) + (Form x 0.20) + (League Bonus x 0.15)
        </p>
      </div>

      {/* League filter + count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <select
          value={leagueFilter}
          onChange={function (e) { setLeagueFilter(e.target.value); }}
          className="bg-gray-800 border border-gray-600 rounded p-2 text-sm w-full sm:w-auto"
        >
          <option value="all">All Leagues</option>
          {getLeagues().map(function (league) {
            return <option key={league} value={league}>{league}</option>;
          })}
        </select>
        <p className="text-xs text-gray-500">{filteredTeams.length} teams</p>
      </div>

      {/* ========================================
          TOP 3 PODIUM (only shown when viewing all leagues)
          ======================================== */}
      {leagueFilter === "all" && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          {/* 2nd place */}
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 text-center mt-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 text-black font-bold text-lg sm:text-xl flex items-center justify-center mx-auto mb-2">
              2
            </div>
            <p className="font-semibold text-sm sm:text-base truncate">{filteredTeams[1] ? filteredTeams[1].name : ""}</p>
            <p className="text-xs text-gray-400">{filteredTeams[1] ? filteredTeams[1].league : ""}</p>
            <p className="text-lg sm:text-xl font-bold text-cyan-400 mt-1">{filteredTeams[1] ? filteredTeams[1].overall : ""}</p>
          </div>

          {/* 1st place (taller) */}
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 text-center border border-yellow-500">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-500 text-black font-bold text-xl sm:text-2xl flex items-center justify-center mx-auto mb-2">
              1
            </div>
            <p className="font-bold text-sm sm:text-base truncate">{filteredTeams[0] ? filteredTeams[0].name : ""}</p>
            <p className="text-xs text-gray-400">{filteredTeams[0] ? filteredTeams[0].league : ""}</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-400 mt-1">{filteredTeams[0] ? filteredTeams[0].overall : ""}</p>
          </div>

          {/* 3rd place */}
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 text-center mt-8">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-600 text-white font-bold text-lg sm:text-xl flex items-center justify-center mx-auto mb-2">
              3
            </div>
            <p className="font-semibold text-sm sm:text-base truncate">{filteredTeams[2] ? filteredTeams[2].name : ""}</p>
            <p className="text-xs text-gray-400">{filteredTeams[2] ? filteredTeams[2].league : ""}</p>
            <p className="text-lg sm:text-xl font-bold text-cyan-400 mt-1">{filteredTeams[2] ? filteredTeams[2].overall : ""}</p>
          </div>
        </div>
      )}

      {/* ========================================
          FULL RANKINGS TABLE
          ======================================== */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-12 gap-2 p-3 bg-gray-700 text-xs text-gray-400 font-semibold">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-3">Team</div>
          <div className="col-span-2">League</div>
          <div className="col-span-1 text-center">ATK</div>
          <div className="col-span-1 text-center">DEF</div>
          <div className="col-span-1 text-center">FORM</div>
          <div className="col-span-1 text-center">Score</div>
          <div className="col-span-2 text-center">Tier</div>
        </div>

        {/* Team rows */}
        {filteredTeams.map(function (team, index) {
          var rank = index + 1;
          var totalTeams = filteredTeams.length;

          return (
            <div
              key={team.id}
              className={
                "p-3 border-b border-gray-700 last:border-0 " +
                (rank <= 3 ? "bg-gray-750" : "")
              }
            >
              {/* Desktop layout */}
              <div className="hidden sm:grid grid-cols-12 gap-2 items-center">
                {/* Rank */}
                <div className="col-span-1 text-center">
                  <span className={"inline-flex w-7 h-7 rounded-full text-xs font-bold items-center justify-center " + getRankColor(rank)}>
                    {rank}
                  </span>
                </div>
                {/* Team name */}
                <div className="col-span-3 font-semibold text-sm">{team.name}</div>
                {/* League */}
                <div className="col-span-2 text-xs text-gray-400">{team.league}</div>
                {/* Attack */}
                <div className="col-span-1 text-center">
                  <span className="text-sm font-semibold">{team.attack}</span>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                    <div className={"h-1 rounded-full " + getBarColor(team.attack)} style={{ width: team.attack + "%" }}></div>
                  </div>
                </div>
                {/* Defense */}
                <div className="col-span-1 text-center">
                  <span className="text-sm font-semibold">{team.defense}</span>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                    <div className={"h-1 rounded-full " + getBarColor(team.defense)} style={{ width: team.defense + "%" }}></div>
                  </div>
                </div>
                {/* Form */}
                <div className="col-span-1 text-center">
                  <span className="text-sm font-semibold">{team.form}</span>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                    <div className={"h-1 rounded-full " + getBarColor(team.form)} style={{ width: team.form + "%" }}></div>
                  </div>
                </div>
                {/* Overall score */}
                <div className="col-span-1 text-center">
                  <span className="text-base font-bold text-cyan-400">{team.overall}</span>
                </div>
                {/* Tier */}
                <div className="col-span-2 text-center">
                  <span className={"text-xs font-semibold " + getTierColor(rank, totalTeams)}>
                    {getTierLabel(rank, totalTeams)}
                  </span>
                </div>
              </div>

              {/* Mobile layout */}
              <div className="sm:hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={"inline-flex w-7 h-7 rounded-full text-xs font-bold items-center justify-center " + getRankColor(rank)}>
                      {rank}
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{team.name}</p>
                      <p className="text-xs text-gray-400">{team.league}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-cyan-400">{team.overall}</p>
                    <p className={"text-xs font-semibold " + getTierColor(rank, totalTeams)}>
                      {getTierLabel(rank, totalTeams)}
                    </p>
                  </div>
                </div>
                {/* Stat bars (mobile) */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-400">
                  <div>
                    <p>ATK {team.attack}</p>
                    <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                      <div className={"h-1 rounded-full " + getBarColor(team.attack)} style={{ width: team.attack + "%" }}></div>
                    </div>
                  </div>
                  <div>
                    <p>DEF {team.defense}</p>
                    <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                      <div className={"h-1 rounded-full " + getBarColor(team.defense)} style={{ width: team.defense + "%" }}></div>
                    </div>
                  </div>
                  <div>
                    <p>FORM {team.form}</p>
                    <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                      <div className={"h-1 rounded-full " + getBarColor(team.form)} style={{ width: team.form + "%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* League bonus reference */}
      <div className="bg-gray-800 rounded-lg p-4 mt-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">League Bonus Points</h3>
        <p className="text-xs text-gray-500 mb-2">
          Teams in harder leagues get extra bonus points added to their ranking score.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
          <div className="bg-gray-700 p-2 rounded">
            <p className="text-gray-400">PL</p>
            <p className="font-bold text-green-400">15</p>
          </div>
          <div className="bg-gray-700 p-2 rounded">
            <p className="text-gray-400">La Liga</p>
            <p className="font-bold">13</p>
          </div>
          <div className="bg-gray-700 p-2 rounded">
            <p className="text-gray-400">Serie A</p>
            <p className="font-bold">12</p>
          </div>
          <div className="bg-gray-700 p-2 rounded">
            <p className="text-gray-400">Bund.</p>
            <p className="font-bold">12</p>
          </div>
          <div className="bg-gray-700 p-2 rounded">
            <p className="text-gray-400">Ligue 1</p>
            <p className="font-bold">10</p>
          </div>
          <div className="bg-gray-700 p-2 rounded">
            <p className="text-gray-400">Saudi</p>
            <p className="font-bold text-red-400">6</p>
          </div>
        </div>
      </div>
    </div>
  );
}
