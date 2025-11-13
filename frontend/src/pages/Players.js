import { useEffect, useState } from "react";

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");

  useEffect(() => {
    fetch("http://localhost:5000/api/players")
      .then((res) => res.json())
      .then((data) => setPlayers(data))
      .catch((err) => console.error("Error loading players:", err));
  }, []);

  // Unique filter options
  const positions = ["All", ...new Set(players.map((p) => p.position))];
  const teams = ["All", ...new Set(players.map((p) => p.team))];

  // Apply search + filters
  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase());

    const matchesPosition =
      positionFilter === "All" || player.position === positionFilter;

    const matchesTeam = teamFilter === "All" || player.team === teamFilter;

    return matchesSearch && matchesPosition && matchesTeam;
  });

  return (
    <div className="text-white w-full max-w-6xl mx-auto mt-10">
      <h1 className="text-3xl font-bold text-center mb-6">
        ⚽ StatSphere – Player Statistics
      </h1>

      {/* Search + Filters */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 flex flex-wrap gap-4 justify-center">

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 w-60 rounded bg-gray-700 text-white border border-gray-600"
        />

        {/* Position Filter */}
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          {positions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>

        {/* Team Filter */}
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      {/* Player Table */}
      <div className="overflow-x-auto bg-gray-800 p-4 rounded-lg shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-600 text-cyan-300">
              <th className="p-2">#</th>
              <th className="p-2">Name</th>
              <th className="p-2">Team</th>
              <th className="p-2">Position</th>
              <th className="p-2">Goals</th>
              <th className="p-2">Assists</th>
              <th className="p-2">xG</th>
              <th className="p-2">xA</th>
              <th className="p-2">npxG</th>
              <th className="p-2">Shots</th>
              <th className="p-2">Goals/90</th>
            </tr>
          </thead>

          <tbody>
            {filteredPlayers.map((p, i) => (
              <tr
                key={p.id}
                className="border-b border-gray-700 hover:bg-gray-700 transition"
              >
                <td className="p-2">{i + 1}</td>
                <td className="p-2 font-semibold">{p.name}</td>
                <td className="p-2">{p.team}</td>
                <td className="p-2">{p.position}</td>
                <td className="p-2">{p.goals}</td>
                <td className="p-2">{p.assists}</td>
                <td className="p-2">{p.xG}</td>
                <td className="p-2">{p.xA}</td>
                <td className="p-2">{p.npxG}</td>
                <td className="p-2">{p.shots}</td>
                <td className="p-2">{p.goals_per90}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
