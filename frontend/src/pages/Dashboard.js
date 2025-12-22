// ========================================
// Dashboard.js - Main Home Page
// ========================================
// Shows live matches and other stats.
// User login status is now shown in the navbar (App.js).

import { useEffect, useState } from "react";

export default function Dashboard() {
  // State to hold live matches array
  const [liveMatches, setLiveMatches] = useState([]);

  // Fetch live matches when component mounts
  useEffect(() => {
    async function fetchMatches() {
      try {
        // GET request to backend for current live matches
        const res = await fetch("http://localhost:5000/api/live-matches");
        const data = await res.json();
        setLiveMatches(data);
      } catch (err) {
        console.error("Error loading live matches:", err);
      }
    }

    fetchMatches();
  }, []);


  return (
    <div className="w-full max-w-4xl">
      {/* LIVE MATCHES SECTION - Display all active matches */}
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">Live Matches</h2>

      {/* Grid of match cards - each shows home/away score */}
      <div className="grid grid-cols-1 gap-4">
        {/* map() loops through liveMatches array and renders a card for each match */}
        {liveMatches.map((match) => (
          <div key={match.id} className="bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-700 transition">
            <div className="flex justify-between">
              {/* Show: Home Team | Score | Away Team */}
              <span>{match.home}</span>
              <strong>{match.score}</strong>
              <span>{match.away}</span>
            </div>
            {/* Show current minute of the match */}
            <p className="text-sm text-gray-400">{match.minute} minute</p>
          </div>
        ))}
      </div>

      {/* More sections can be added here later */}
    </div>
  );
}
