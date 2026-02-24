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
import PlayerInsights from "./pages/PlayerInsights";

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
  // It asks the server "who am I?" using cookie or saved token.
  useEffect(function() {
    // Get token from localStorage (backup when cookies are blocked)
    var savedToken = localStorage.getItem("token");

    fetch(`${API_BASE}/auth/me`, {
      credentials: "include",
      headers: savedToken ? { "Authorization": "Bearer " + savedToken } : {}
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
    var savedToken = localStorage.getItem("token");

    fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: savedToken ? { "Authorization": "Bearer " + savedToken } : {}
    })
      .then(function() {
        // Clear token from localStorage
        localStorage.removeItem("token");
        setUser(null);           // Clear user from state
        window.location.href = "/";  // Redirect to home page
      })
      .catch(function(err) {
        console.log("Logout error");
      });
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-3 py-4 sm:p-6">
        {/* Navigation Bar - Logo, links, and login/logout */}
        <nav className="w-full bg-gray-800 p-4 rounded-lg mb-6 shadow-lg">
          {/* Top row: Logo + User status */}
          <div className="flex justify-between items-center flex-wrap gap-3 mb-3">
            <h1 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
              <span>⚽</span> <span>StatSphere</span>
            </h1>

            {/* Show logged-in info OR login link */}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-300 text-sm">
                  Logged in as: <span className="text-cyan-400 font-semibold">{user.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `text-sm transition-all duration-200 ${
                    isActive ? "text-cyan-400 font-semibold" : "hover:text-cyan-300"
                  }`
                }
              >
                Login
              </NavLink>
            )}
          </div>

          {/* Bottom row: Page links (wraps on small screens) */}
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-base items-center">
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
                to="/insights"
                className={({ isActive }) =>
                  `transition-all duration-200 ${
                    isActive ? "text-cyan-400 font-semibold" : "hover:text-cyan-300"
                  }`
                }
              >
                Insights
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
                to="/standings"
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
                to="/fixtures"
                className={({ isActive }) =>
                  `transition-all duration-200 ${
                    isActive ? "text-cyan-400 font-semibold" : "hover:text-cyan-300"
                  }`
                }
              >
                Fixtures
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Routes - Match URL paths to page components */}
        {/* When user clicks a NavLink, the URL changes and Routes renders the matching component */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/players" element={<Players />} />
          <Route path="/compare" element={<PlayerComparison />} />
          <Route path="/insights" element={<PlayerInsights />} />
          <Route path="/ballon-dor" element={<BallonDor />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/community" element={<Community user={user} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* League / Competition pages */}
          <Route path="/standings" element={<LeagueStandings />} />
          <Route path="/fixtures" element={<LeagueFixtures />} />
          {/* Keep old routes for backwards compatibility */}
          <Route path="/leagues/:leagueId/standings" element={<LeagueStandings />} />
          <Route path="/leagues/:leagueId/fixtures" element={<LeagueFixtures />} />
        </Routes>

        {/* Footer */}
        <footer className="mt-8 text-gray-400 text-sm text-center">
          © 2026 StatSphere
        </footer>
      </div>
    </Router>
  );
}

export default App;
