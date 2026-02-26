// ========================================
// Rankings.js - All Rankings Page
// ========================================
// This page shows multiple types of rankings:
//   1. Team Power Rankings (our own calculated ranking)
//   2. UEFA Club Coefficient Rankings (European clubs)
//   3. FIFA World Rankings (top 20 nations)
//   4. FIFA Africa Rankings (CAF - top 10)
//   5. FIFA South America Rankings (CONMEBOL - top 10)
//   6. FIFA Asia Rankings (AFC - top 10)
//
// The user picks which ranking to view using tabs at the top.
// The "activeView" state variable controls which ranking is shown.
//
// DATA SOURCES:
//   - Team Power: /api/prediction-teams (our mock data)
//   - UEFA Clubs: /api/uefa-club-rankings (JSON file)
//   - FIFA rankings: /api/fifa-rankings (JSON file)
// ========================================

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

var API_BASE = process.env.REACT_APP_API_URL;

// ========================================
// HELPER: League bonus for Team Power Rankings
// ========================================
function getLeagueBonus(league) {
  if (league === "Premier League") return 15;
  if (league === "La Liga") return 13;
  if (league === "Serie A") return 12;
  if (league === "Bundesliga") return 12;
  if (league === "Ligue 1") return 10;
  if (league === "Saudi Pro League") return 6;
  return 8;
}

// Calculate overall score for a team
function calculateOverall(team) {
  var attackScore = team.attack * 0.35;
  var defenseScore = team.defense * 0.30;
  var formScore = team.form * 0.20;
  var leagueScore = getLeagueBonus(team.league) * 0.15;
  var total = attackScore + defenseScore + formScore + leagueScore;
  return Math.round(total * 10) / 10;
}

// Get colour for rank badge (gold, silver, bronze)
function getRankColor(rank) {
  if (rank === 1) return "bg-yellow-500 text-black";
  if (rank === 2) return "bg-gray-300 text-black";
  if (rank === 3) return "bg-amber-600 text-white";
  return "bg-gray-700 text-gray-300";
}

// Get bar colour based on stat value
function getBarColor(value) {
  if (value >= 90) return "bg-green-400";
  if (value >= 80) return "bg-cyan-400";
  if (value >= 70) return "bg-yellow-400";
  return "bg-red-400";
}

export default function Rankings() {
  // useSearchParams reads the ?view= part of the URL
  // For example: /rankings?view=uefa means the user clicked "UEFA Clubs"
  var [searchParams] = useSearchParams();
  var viewFromUrl = searchParams.get("view");

  // Which ranking view is currently active
  // Options: "power", "uefa", "fifaWorld", "fifaAfrica", "fifaSouthAmerica", "fifaAsia"
  var [activeView, setActiveView] = useState(viewFromUrl || "power");

  // When the URL changes (user clicked a nav dropdown link), update the view
  useEffect(function () {
    if (viewFromUrl) {
      setActiveView(viewFromUrl);
    }
  }, [viewFromUrl]);

  // Data for each ranking type
  var [powerTeams, setPowerTeams] = useState([]);
  var [uefaData, setUefaData] = useState(null);
  var [fifaData, setFifaData] = useState(null);

  // Search box for filtering the table
  var [searchText, setSearchText] = useState("");

  // Loading state
  var [loading, setLoading] = useState(true);

  // ========================================
  // LOAD ALL DATA when the page first loads
  // ========================================
  useEffect(function () {
    var loaded = 0;
    var total = 3;

    // Helper: check if all data is loaded
    function checkDone() {
      loaded = loaded + 1;
      if (loaded >= total) setLoading(false);
    }

    // Load Team Power data
    fetch(API_BASE + "/api/prediction-teams")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        // Calculate score for each team
        for (var i = 0; i < data.length; i++) {
          data[i].overall = calculateOverall(data[i]);
        }
        // Sort by score (highest first)
        data.sort(function (a, b) { return b.overall - a.overall; });
        setPowerTeams(data);
        checkDone();
      })
      .catch(function () { checkDone(); });

    // Load UEFA club rankings
    fetch(API_BASE + "/api/uefa-club-rankings")
      .then(function (res) { return res.json(); })
      .then(function (data) { setUefaData(data); checkDone(); })
      .catch(function () { checkDone(); });

    // Load FIFA rankings
    fetch(API_BASE + "/api/fifa-rankings")
      .then(function (res) { return res.json(); })
      .then(function (data) { setFifaData(data); checkDone(); })
      .catch(function () { checkDone(); });
  }, []);

  // Clear search when switching views
  function switchView(view) {
    setActiveView(view);
    setSearchText("");
  }

  // ========================================
  // ALL TAB OPTIONS
  // ========================================
  var tabs = [
    { id: "power",            label: "Team Power" },
    { id: "uefa",             label: "UEFA Clubs" },
    { id: "fifaWorld",        label: "FIFA World" },
    { id: "fifaAfrica",       label: "FIFA Africa" },
    { id: "fifaSouthAmerica", label: "FIFA South America" },
    { id: "fifaAsia",         label: "FIFA Asia" }
  ];

  // Loading screen
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
        Rankings
      </h1>
      <p className="text-gray-400 text-center mb-4 text-sm">
        Choose a ranking type below
      </p>

      {/* ========================================
          TAB BUTTONS - choose which ranking to see
          ======================================== */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {tabs.map(function (tab) {
          var isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={function () { switchView(tab.id); }}
              className={
                "px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition " +
                (isActive
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600")
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={function (e) { setSearchText(e.target.value); }}
          className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:border-cyan-400 focus:outline-none text-sm"
        />
      </div>

      {/* ========================================
          VIEW: Team Power Rankings
          ======================================== */}
      {activeView === "power" && (
        <PowerRankingsView teams={powerTeams} searchText={searchText} />
      )}

      {/* ========================================
          VIEW: UEFA Club Rankings
          ======================================== */}
      {activeView === "uefa" && uefaData && (
        <UefaRankingsView data={uefaData} searchText={searchText} />
      )}

      {/* ========================================
          VIEW: FIFA World Rankings
          ======================================== */}
      {activeView === "fifaWorld" && fifaData && (
        <FifaRankingsView
          title="FIFA World Rankings"
          subtitle="Top 20 nations in the world"
          nations={fifaData.worldRankings}
          lastUpdated={fifaData.lastUpdated}
          searchText={searchText}
          showConfederation={true}
        />
      )}

      {/* ========================================
          VIEW: FIFA Africa Rankings
          ======================================== */}
      {activeView === "fifaAfrica" && fifaData && (
        <FifaRankingsView
          title="FIFA Africa Rankings (CAF)"
          subtitle="Top 10 African nations"
          nations={fifaData.africa}
          lastUpdated={fifaData.lastUpdated}
          searchText={searchText}
          showWorldRank={true}
        />
      )}

      {/* ========================================
          VIEW: FIFA South America Rankings
          ======================================== */}
      {activeView === "fifaSouthAmerica" && fifaData && (
        <FifaRankingsView
          title="FIFA South America Rankings (CONMEBOL)"
          subtitle="Top 10 South American nations"
          nations={fifaData.southAmerica}
          lastUpdated={fifaData.lastUpdated}
          searchText={searchText}
          showWorldRank={true}
        />
      )}

      {/* ========================================
          VIEW: FIFA Asia Rankings
          ======================================== */}
      {activeView === "fifaAsia" && fifaData && (
        <FifaRankingsView
          title="FIFA Asia Rankings (AFC)"
          subtitle="Top 10 Asian nations"
          nations={fifaData.asia}
          lastUpdated={fifaData.lastUpdated}
          searchText={searchText}
          showWorldRank={true}
        />
      )}
    </div>
  );
}

// ========================================
// COMPONENT: Team Power Rankings View
// ========================================
// This is the original team ranking with attack/defense/form
function PowerRankingsView(props) {
  var teams = props.teams;
  var searchText = props.searchText;

  // Filter teams by search
  var filtered = [];
  var lower = searchText.toLowerCase();
  for (var i = 0; i < teams.length; i++) {
    if (searchText === "" || teams[i].name.toLowerCase().indexOf(lower) >= 0 || teams[i].league.toLowerCase().indexOf(lower) >= 0) {
      filtered.push(teams[i]);
    }
  }

  return (
    <div>
      <div className="bg-gray-800 rounded-lg p-3 mb-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-1">Ranking Formula:</h3>
        <p className="text-xs text-gray-400">
          Overall = (Attack x 0.35) + (Defense x 0.30) + (Form x 0.20) + (League Bonus x 0.15)
        </p>
      </div>

      <p className="text-xs text-gray-500 mb-3">{filtered.length} teams</p>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {filtered.map(function (team, index) {
          var rank = index + 1;
          return (
            <div key={team.id} className="p-3 border-b border-gray-700 last:border-0">
              {/* Desktop */}
              <div className="hidden sm:flex items-center gap-4">
                <span className={"inline-flex w-8 h-8 rounded-full text-xs font-bold items-center justify-center " + getRankColor(rank)}>
                  {rank}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{team.name}</p>
                  <p className="text-xs text-gray-400">{team.league}</p>
                </div>
                <div className="flex gap-4 items-center text-center text-xs">
                  <div className="w-12">
                    <p className="text-gray-400">ATK</p>
                    <p className="font-bold">{team.attack}</p>
                    <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                      <div className={"h-1 rounded-full " + getBarColor(team.attack)} style={{ width: team.attack + "%" }}></div>
                    </div>
                  </div>
                  <div className="w-12">
                    <p className="text-gray-400">DEF</p>
                    <p className="font-bold">{team.defense}</p>
                    <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                      <div className={"h-1 rounded-full " + getBarColor(team.defense)} style={{ width: team.defense + "%" }}></div>
                    </div>
                  </div>
                  <div className="w-12">
                    <p className="text-gray-400">FORM</p>
                    <p className="font-bold">{team.form}</p>
                    <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                      <div className={"h-1 rounded-full " + getBarColor(team.form)} style={{ width: team.form + "%" }}></div>
                    </div>
                  </div>
                </div>
                <div className="w-16 text-center">
                  <p className="text-lg font-bold text-cyan-400">{team.overall}</p>
                </div>
              </div>
              {/* Mobile */}
              <div className="sm:hidden flex items-center gap-3">
                <span className={"inline-flex w-7 h-7 rounded-full text-xs font-bold items-center justify-center " + getRankColor(rank)}>
                  {rank}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{team.name}</p>
                  <p className="text-xs text-gray-400">{team.league}</p>
                </div>
                <p className="text-lg font-bold text-cyan-400">{team.overall}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========================================
// COMPONENT: UEFA Club Coefficient Rankings View
// ========================================
function UefaRankingsView(props) {
  var data = props.data;
  var searchText = props.searchText;

  // Filter by search
  var filtered = [];
  var lower = searchText.toLowerCase();
  for (var i = 0; i < data.rankings.length; i++) {
    var club = data.rankings[i];
    if (searchText === "" || club.club.toLowerCase().indexOf(lower) >= 0 || club.country.toLowerCase().indexOf(lower) >= 0) {
      filtered.push(club);
    }
  }

  return (
    <div>
      <div className="bg-gray-800 rounded-lg p-3 mb-4">
        <h2 className="text-lg font-bold text-cyan-400 mb-1">UEFA Club Coefficient Rankings</h2>
        <p className="text-xs text-gray-400">
          Based on results in European competitions (Champions League, Europa League).
          Season: {data.season}
        </p>
        <p className="text-xs text-gray-500 mt-1">Last updated: {data.lastUpdated}</p>
      </div>

      <p className="text-xs text-gray-500 mb-3">{filtered.length} clubs</p>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-12 gap-2 p-3 bg-gray-700 text-xs text-gray-400 font-semibold">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">Club</div>
          <div className="col-span-3">Country</div>
          <div className="col-span-3 text-right">Coefficient Pts</div>
        </div>

        {filtered.map(function (club) {
          return (
            <div key={club.rank} className="p-3 border-b border-gray-700 last:border-0">
              {/* Desktop */}
              <div className="hidden sm:grid grid-cols-12 gap-2 items-center">
                <div className="col-span-1 text-center">
                  <span className={"inline-flex w-7 h-7 rounded-full text-xs font-bold items-center justify-center " + getRankColor(club.rank)}>
                    {club.rank}
                  </span>
                </div>
                <div className="col-span-5 font-semibold text-sm">{club.club}</div>
                <div className="col-span-3 text-sm text-gray-400">{club.country}</div>
                <div className="col-span-3 text-right font-bold text-cyan-400">{club.points.toFixed(3)}</div>
              </div>
              {/* Mobile */}
              <div className="sm:hidden flex items-center gap-3">
                <span className={"inline-flex w-7 h-7 rounded-full text-xs font-bold items-center justify-center " + getRankColor(club.rank)}>
                  {club.rank}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{club.club}</p>
                  <p className="text-xs text-gray-400">{club.country}</p>
                </div>
                <p className="font-bold text-cyan-400 text-sm">{club.points.toFixed(3)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========================================
// COMPONENT: FIFA Nation Rankings View
// ========================================
// Reusable for World, Africa, South America, Asia
function FifaRankingsView(props) {
  var title = props.title;
  var subtitle = props.subtitle;
  var nations = props.nations;
  var lastUpdated = props.lastUpdated;
  var searchText = props.searchText;
  var showConfederation = props.showConfederation || false;
  var showWorldRank = props.showWorldRank || false;

  // Filter by search
  var filtered = [];
  var lower = searchText.toLowerCase();
  for (var i = 0; i < nations.length; i++) {
    var nation = nations[i];
    if (searchText === "" || nation.nation.toLowerCase().indexOf(lower) >= 0) {
      filtered.push(nation);
    }
  }

  return (
    <div>
      <div className="bg-gray-800 rounded-lg p-3 mb-4">
        <h2 className="text-lg font-bold text-cyan-400 mb-1">{title}</h2>
        <p className="text-xs text-gray-400">{subtitle}</p>
        <p className="text-xs text-gray-500 mt-1">Last updated: {lastUpdated}</p>
      </div>

      <p className="text-xs text-gray-500 mb-3">{filtered.length} nations</p>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-12 gap-2 p-3 bg-gray-700 text-xs text-gray-400 font-semibold">
          <div className="col-span-1 text-center">#</div>
          <div className={showConfederation ? "col-span-4" : "col-span-5"}>Nation</div>
          {showConfederation && <div className="col-span-2">Confederation</div>}
          {showWorldRank && <div className="col-span-2 text-center">World Rank</div>}
          <div className={showWorldRank || showConfederation ? "col-span-3" : "col-span-6"} style={{ textAlign: "right" }}>Points</div>
        </div>

        {filtered.map(function (nation) {
          return (
            <div key={nation.rank + nation.nation} className="p-3 border-b border-gray-700 last:border-0">
              {/* Desktop */}
              <div className="hidden sm:grid grid-cols-12 gap-2 items-center">
                <div className="col-span-1 text-center">
                  <span className={"inline-flex w-7 h-7 rounded-full text-xs font-bold items-center justify-center " + getRankColor(nation.rank)}>
                    {nation.rank}
                  </span>
                </div>
                <div className={showConfederation ? "col-span-4" : "col-span-5"}>
                  <span className="font-semibold text-sm">{nation.nation}</span>
                </div>
                {showConfederation && (
                  <div className="col-span-2 text-xs text-gray-400">{nation.confederation}</div>
                )}
                {showWorldRank && (
                  <div className="col-span-2 text-center text-xs text-gray-400">#{nation.worldRank}</div>
                )}
                <div className={showWorldRank || showConfederation ? "col-span-3" : "col-span-6"} style={{ textAlign: "right" }}>
                  <span className="font-bold text-cyan-400">{nation.points.toFixed(2)}</span>
                </div>
              </div>
              {/* Mobile */}
              <div className="sm:hidden flex items-center gap-3">
                <span className={"inline-flex w-7 h-7 rounded-full text-xs font-bold items-center justify-center " + getRankColor(nation.rank)}>
                  {nation.rank}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{nation.nation}</p>
                  <p className="text-xs text-gray-400">
                    {showConfederation ? nation.confederation : ""}
                    {showWorldRank ? "World #" + nation.worldRank : ""}
                  </p>
                </div>
                <p className="font-bold text-cyan-400 text-sm">{nation.points.toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
