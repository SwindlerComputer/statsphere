import { useEffect, useState } from "react";
import axios from "axios";

export default function Players() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/players")
      .then((res) => setPlayers(res.data))
      .catch((err) => console.error("Error fetching players:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">⚽ StatSphere - Player Statistics</h1>

      {players.length === 0 ? (
        <p className="text-gray-400">Loading player data...</p>
      ) : (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-3xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700 text-lg">
                <th className="p-2">#</th>
                <th className="p-2">Name</th>
                <th className="p-2">Team</th>
                <th className="p-2">Position</th>
                <th className="p-2">Goals</th>
                <th className="p-2">Assists</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2 font-semibold">{p.name}</td>
                  <td className="p-2">{p.team}</td>
                  <td className="p-2">{p.position}</td>
                  <td className="p-2">{p.goals}</td>
                  <td className="p-2">{p.assists}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
