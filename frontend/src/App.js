// ========================================
// App.js - Main Router & Layout
// ========================================
// This is the root component. It uses React Router to show different pages
// based on the URL. Router wraps the app, Routes matches the URL path to a
// component, and NavLink creates links that highlight when active.

import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Players from "./pages/Players";
import Predictions from "./pages/Predictions";
import Community from "./pages/Community";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PlayerComparison from "./pages/PlayerComparison";
import BallonDor from "./pages/BallonDor";
import LeagueStandings from "./pages/LeagueStandings";
import LeagueFixtures from "./pages/LeagueFixtures";

// API_BASE = backend URL from .env file
// Locally: REACT_APP_API_URL=http://localhost:5000
// Production: REACT_APP_API_URL=https://your-backend.onrender.com
const API_BASE = process.env.REACT_APP_API_URL;

function App() {
  // Store the logged in user (null means not logged in)
  let [user, setUser] = useState(null);

  // ========================================
  // Check if user is logged in when app loads
  // ========================================
  // This runs once when the page first loads.
  // It asks the server "who am I?" by checking the cookie.
  useEffect(function() {
    fetch(`${API_BASE}/auth/me`, {
      credentials: "include"  // Send cookies with request
    })
      .then(function(res) {
        return res.json();
      })
      .then(function(data) {
        // If server returns a user, save it to state
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(function(err) {
        console.log("Not logged in");
      });
  }, []);

  // ========================================
  // Handle logout button click
  // ========================================
  // Sends request to server to clear the cookie, then redirects home.
  function handleLogout() {
    fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include"
    })
      .then(function() {
        setUser(null);           // Clear user from state
        window.location.href = "/";  // Redirect to home page
      })
      .catch(function(err) {
        console.log("Logout error");
      });
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
        {/* Navigation Bar - Show logo and links to all pages */}
        <nav className="w-full flex justify-between items-center bg-gray-800 p-4 rounded-lg mb-6 shadow-lg">
          <h1 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
            <span>⚽</span> <span>StatSphere</span>
          </h1>
          {/* NavLink automatically detects active page using isActive prop */}
          <ul className="flex gap-6 text-lg items-center">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `transition-all duration-200 ${
                    isActive ? "text-cyan-400 font-semibold" : "hover:text-cyan-300"
                  }`
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/players"
                className={({ isActive }) =>
                  `transition-all duration-200 ${
                    isActive ? "text-cyan-400 font-semibold" : "hover:text-cyan-300"
                  }`
                }
              >
                Players
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/compare"
                className={({ isActive }) =>
                  `transition-all duration-200 ${
                    isActive ? "text-cyan-400 font-semibold" : "hover:text-cyan-300"
                  }`
                }
              >
                Compare
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/ballon-dor"
                className={({ isActive }) =>
                  `transition-all duration-200 ${
                    isActive ? "text-cyan-400 font-semibold" : "hover:text-cyan-300"
                  }`
                }
              >
                Ballon d'Or
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/predictions"
                className={({ isActive }) =>
                  `transition-all duration-200 ${
                    isActive ? "text-cyan-400 font-semibold" : "hover:text-cyan-300"
                  }`
                }
              >
                Predictions
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/community"
                className={({ isActive }) =>
                  `transition-all duration-200 ${
                    isActive ? "text-cyan-400 font-semibold" : "hover:text-cyan-300"
                  }`
                }
              >
                Community
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/leagues/39/standings"
                className={({ isActive }) =>
                  `transition-all duration-200 ${
                    isActive ? "text-cyan-400 font-semibold" : "hover:text-cyan-300"
                  }`
                }
              >
                Standings
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/leagues/39/fixtures"
                className={({ isActive }) =>
                  `transition-all duration-200 ${
                    isActive ? "text-cyan-400 font-semibold" : "hover:text-cyan-300"
                  }`
                }
              >
                Fixtures
              </NavLink>
            </li>

            {/* Show Login or Logout based on user state */}
            {user ? (
              // User is logged in - show name and logout button
              <li className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">
                  Hi, <span className="text-cyan-400 font-semibold">{user.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition"
                >
                  Logout
                </button>
              </li>
            ) : (
              // User is not logged in - show login link
              <li>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `transition-all duration-200 ${
                      isActive ? "text-cyan-400 font-semibold" : "hover:text-cyan-300"
                    }`
                  }
                >
                  Login
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {/* Routes - Match URL paths to page components */}
        {/* When user clicks a NavLink, the URL changes and Routes renders the matching component */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/players" element={<Players />} />
          <Route path="/compare" element={<PlayerComparison />} />
          <Route path="/ballon-dor" element={<BallonDor />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/community" element={<Community user={user} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* League pages with dynamic leagueId parameter */}
          <Route path="/leagues/:leagueId/standings" element={<LeagueStandings />} />
          <Route path="/leagues/:leagueId/fixtures" element={<LeagueFixtures />} />
        </Routes>

        {/* Footer */}
        <footer className="mt-8 text-gray-400 text-sm text-center">
          © 2025 StatSphere
        </footer>
      </div>
    </Router>
  );
}

export default App;
