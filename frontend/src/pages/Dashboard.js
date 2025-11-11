import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/teams")
      .then((res) => {
        setTeams(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-400 mx-auto mb-4"></div>
        <p className="text-gray-300">Loading team data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6">
      <header className="w-full text-center text-3xl font-bold mb-8">
        ⚽ Team Overview
      </header>

      <div className="bg-gray-800 shadow-lg rounded-lg p-4 w-full max-w-3xl mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-lg">
              <th className="p-2">#</th>
              <th className="p-2">Team</th>
              <th className="p-2">League</th>
              <th className="p-2">Country</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t, i) => (
              <tr
                key={t.id}
                className="border-b border-gray-700 hover:bg-gray-700 transition-all duration-200"
              >
                <td className="p-2">{i + 1}</td>
                <td className="p-2 font-semibold">{t.name}</td>
                <td className="p-2">{t.league}</td>
                <td className="p-2">{t.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-800 shadow-lg rounded-lg p-4 w-full max-w-3xl">
        <h2 className="text-xl mb-4 text-center">Teams by League</h2>
        <div className="flex justify-center">
          <BarChart width={500} height={300} data={teams}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="league" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="id" fill="#38bdf8" name="Teams" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}
