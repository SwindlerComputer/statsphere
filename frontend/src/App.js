// ========================================
// App.js - Main Router & Layout
// ========================================
// Root component with React Router.
// Includes responsive navigation for all devices.

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
import Profile from "./pages/Profile";
import Rankings from "./pages/Rankings";

var API_BASE = process.env.REACT_APP_API_URL;

function App() {
  var [user, setUser] = useState(null);
  // Mobile menu toggle
  var [menuOpen, setMenuOpen] = useState(false);

  // Check if user is logged in when app loads
  useEffect(function () {
    var savedToken = localStorage.getItem("token");

    fetch(API_BASE + "/auth/me", {
      credentials: "include",
      headers: savedToken ? { "Authorization": "Bearer " + savedToken } : {}
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(function () {
        console.log("Not logged in");
      });
  }, []);

  // Handle logout
  function handleLogout() {
    var savedToken = localStorage.getItem("token");

    fetch(API_BASE + "/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: savedToken ? { "Authorization": "Bearer " + savedToken } : {}
    })
      .then(function () {
        localStorage.removeItem("token");
        setUser(null);
        window.location.href = "/";
      })
      .catch(function () {
        console.log("Logout error");
      });
  }

  // Close mobile menu when a link is clicked
  function closeMenu() {
    setMenuOpen(false);
  }

  // Style for active and inactive nav links
  function navClass(isActive) {
    return "block py-1 transition-all duration-200 " +
      (isActive ? "text-cyan-400 font-semibold" : "hover:text-cyan-300");
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-2 py-3 sm:px-4 sm:py-4 md:p-6">

        {/* Navigation Bar */}
        <nav className="w-full max-w-6xl bg-gray-800 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 shadow-lg">
          {/* Top row: Logo + Hamburger/User */}
          <div className="flex justify-between items-center">
            <NavLink to="/" className="text-xl sm:text-2xl font-bold text-cyan-400 flex items-center gap-2" onClick={closeMenu}>
              <span>StatSphere</span>
            </NavLink>

            {/* Desktop user info (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <NavLink
                    to="/profile"
                    className={function (nav) { return "text-sm transition " + (nav.isActive ? "text-cyan-400 font-semibold" : "text-gray-300 hover:text-cyan-300"); }}
                  >
                    {user.name}
                  </NavLink>
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
                  className={function (nav) { return "text-sm transition " + (nav.isActive ? "text-cyan-400 font-semibold" : "hover:text-cyan-300"); }}
                >
                  Login
                </NavLink>
              )}
            </div>

            {/* Menu button (mobile only) */}
            {/* Shows "Menu" when closed, "Close" when open */}
            <button
              onClick={function () { setMenuOpen(!menuOpen); }}
              className="md:hidden px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 transition text-sm"
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>

          {/* Desktop nav links (hidden on mobile) */}
          <ul className="hidden md:flex flex-wrap gap-x-5 gap-y-2 text-sm mt-3 items-center">
            <li><NavLink to="/" end className={function (nav) { return navClass(nav.isActive); }}>Dashboard</NavLink></li>
            <li><NavLink to="/players" className={function (nav) { return navClass(nav.isActive); }}>Players</NavLink></li>
            <li><NavLink to="/compare" className={function (nav) { return navClass(nav.isActive); }}>Compare</NavLink></li>
            <li><NavLink to="/insights" className={function (nav) { return navClass(nav.isActive); }}>Insights</NavLink></li>
            <li><NavLink to="/ballon-dor" className={function (nav) { return navClass(nav.isActive); }}>Ballon d'Or</NavLink></li>
            <li><NavLink to="/predictions" className={function (nav) { return navClass(nav.isActive); }}>Predictions</NavLink></li>
            <li><NavLink to="/standings" className={function (nav) { return navClass(nav.isActive); }}>Standings</NavLink></li>
            <li><NavLink to="/fixtures" className={function (nav) { return navClass(nav.isActive); }}>Fixtures</NavLink></li>
            <li><NavLink to="/rankings" className={function (nav) { return navClass(nav.isActive); }}>Rankings</NavLink></li>
            <li><NavLink to="/community" className={function (nav) { return navClass(nav.isActive); }}>Community</NavLink></li>
          </ul>

          {/* Mobile menu (shows when hamburger is clicked) */}
          {menuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-gray-700">
              <ul className="space-y-2 text-sm">
                <li><NavLink to="/" end className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>Dashboard</NavLink></li>
                <li><NavLink to="/players" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>Players</NavLink></li>
                <li><NavLink to="/compare" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>Compare</NavLink></li>
                <li><NavLink to="/insights" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>Insights</NavLink></li>
                <li><NavLink to="/ballon-dor" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>Ballon d'Or</NavLink></li>
                <li><NavLink to="/predictions" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>Predictions</NavLink></li>
                <li><NavLink to="/standings" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>Standings</NavLink></li>
                <li><NavLink to="/fixtures" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>Fixtures</NavLink></li>
                <li><NavLink to="/rankings" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>Rankings</NavLink></li>
                <li><NavLink to="/community" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>Community</NavLink></li>

                {/* Mobile user actions */}
                <li className="pt-2 border-t border-gray-700">
                  {user ? (
                    <div className="space-y-2">
                      <NavLink to="/profile" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>
                        My Profile ({user.name})
                      </NavLink>
                      <button
                        onClick={function () { closeMenu(); handleLogout(); }}
                        className="block w-full text-left text-red-400 hover:text-red-300 py-1"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <NavLink to="/login" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>
                      Login / Register
                    </NavLink>
                  )}
                </li>
              </ul>
            </div>
          )}
        </nav>

        {/* Page Content */}
        <main className="w-full max-w-6xl flex flex-col items-center">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/players" element={<Players />} />
            <Route path="/compare" element={<PlayerComparison />} />
            <Route path="/insights" element={<PlayerInsights />} />
            <Route path="/ballon-dor" element={<BallonDor />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/community" element={<Community user={user} />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/standings" element={<LeagueStandings />} />
            <Route path="/fixtures" element={<LeagueFixtures />} />
            <Route path="/leagues/:leagueId/standings" element={<LeagueStandings />} />
            <Route path="/leagues/:leagueId/fixtures" element={<LeagueFixtures />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="mt-6 sm:mt-8 text-gray-400 text-xs sm:text-sm text-center">
          © 2026 StatSphere
        </footer>
      </div>
    </Router>
  );
}

export default App;
