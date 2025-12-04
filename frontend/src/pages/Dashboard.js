// ========================================
// Dashboard.js - Main Home Page
// ========================================
// Shows logged-in user greeting, live matches, and other stats.
// Fetches user data from auth endpoint and live matches from API.

import { useEffect, useState } from "react";

export default function Dashboard() {
  // State to hold logged-in user object (null if not logged in)
  const [user, setUser] = useState(null); 
  // State to track if user fetch is complete (prevents showing Login link while checking)
  const [loadingUser, setLoadingUser] = useState(true);

  // Fetch logged-in user when component mounts
  // This checks if user has valid session cookie
  useEffect(() => {
    async function fetchUser() {
      try {
        // GET request with credentials: "include" sends cookies to backend
        // This lets backend verify who you are
        const res = await fetch("http://localhost:5000/auth/me", {
          credentials: "include",
        });

        // If status 200: user is logged in, parse response
        if (res.status === 200) {
          const data = await res.json();
          setUser(data.user);
        }

      } catch (err) {
        console.log("User not logged in");
      }

      // Mark loading as complete (show UI either way)
      setLoadingUser(false);
    }

    fetchUser();
  }, []);

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
    <div className="min-h-screen bg-gray-900 text-white p-6">

      {/* Top Bar - Show logo on left, user info on right (if logged in) */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-cyan-400">StatSphere</h1>

        {/* If user is logged in, show greeting + logout button */}
        {/* If not logged in, show nothing (Login link is already in navbar) */}
        {!loadingUser && user && (
          <div className="flex items-center gap-4">
            <p className="text-gray-300">
              Hi, <span className="font-semibold">{user.name}</span>
            </p>

            {/* Logout button - POST request to backend with credentials */}
            <button
              onClick={async () => {
                await fetch("http://localhost:5000/auth/logout", {
                  method: "POST",
                  credentials: "include",
                });
                window.location.reload();
              }}
              className="bg-red-500 px-3 py-2 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* LIVE MATCHES SECTION - Display all active matches */}
      <h2 className="text-2xl font-bold mb-4">Live Matches</h2>

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
