// ========================================
// App.js - Main Router & Layout
// ========================================
// Root component with React Router.
// Includes responsive navigation for all devices.

import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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
  var location = useLocation();
  var [user, setUser] = useState(null);
  // Mobile menu toggle
  var [menuOpen, setMenuOpen] = useState(false);
  // Profile dropdown toggle (desktop)
  var [profileOpen, setProfileOpen] = useState(false);
  // Community dropdown toggle (desktop) - so users can click to see the 4 rooms
  var [communityOpen, setCommunityOpen] = useState(false);
  // Ref to detect clicks outside the dropdown
  var profileRef = useRef(null);
  var communityRef = useRef(null);

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

  // Close profile dropdown when user clicks outside of it
  useEffect(function () {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (communityRef.current && !communityRef.current.contains(event.target)) {
        setCommunityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return function () {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-2 py-3 sm:px-4 sm:py-4 md:p-6">

        {/* Navigation Bar */}
        <nav className="w-full max-w-6xl bg-gray-800 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 shadow-lg">
          {/* Top row: Logo + Hamburger/User */}
          <div className="flex justify-between items-center">
            <NavLink to="/" className="text-xl sm:text-2xl font-bold text-cyan-400 flex items-center gap-2" onClick={closeMenu}>
              <span>StatSphere</span>
            </NavLink>

            {/* Desktop user info with profile dropdown (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="relative" ref={profileRef}>
                  {/* "My Profile" button that opens the dropdown */}
                  <button
                    onClick={function () { setProfileOpen(!profileOpen); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-sm"
                  >
                    {/* Small avatar circle */}
                    <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold">{user.name}</span>
                    {/* Small arrow indicator */}
                    <span className="text-gray-400 text-xs">{profileOpen ? "▲" : "▼"}</span>
                  </button>

                  {/* Profile dropdown menu */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
                      {/* User info at top */}
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <NavLink
                          to="/profile"
                          onClick={function () { setProfileOpen(false); }}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition"
                        >
                          My Profile
                        </NavLink>
                        <NavLink
                          to="/profile"
                          onClick={function () { setProfileOpen(false); }}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition"
                        >
                          Favorite Team
                        </NavLink>
                        <NavLink
                          to="/profile"
                          onClick={function () { setProfileOpen(false); }}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition"
                        >
                          Favorite League
                        </NavLink>
                        <NavLink
                          to="/profile"
                          onClick={function () { setProfileOpen(false); }}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition"
                        >
                          Favorite Players
                        </NavLink>
                      </div>

                      {/* Logout at bottom */}
                      <div className="border-t border-gray-700 py-1">
                        <button
                          onClick={function () { setProfileOpen(false); handleLogout(); }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
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

            {/* Rankings hover dropdown (desktop) */}
            {/* "group" class lets child elements use "group-hover:" */}
            <li className="relative group">
              <NavLink to="/rankings" className={function (nav) { return navClass(nav.isActive) + " flex items-center gap-1"; }}>
                Rankings <span className="text-xs text-gray-500">▼</span>
              </NavLink>
              {/* Dropdown that appears on hover */}
              <div className="absolute left-0 top-full mt-0 pt-1 hidden group-hover:block z-50">
                <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl w-48 py-1">
                  <NavLink to="/rankings?view=power" onClick={function () {}} className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition">
                    Team Power
                  </NavLink>
                  <NavLink to="/rankings?view=uefa" onClick={function () {}} className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition">
                    UEFA Club Rankings
                  </NavLink>
                  <NavLink to="/rankings?view=fifaWorld" onClick={function () {}} className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition">
                    FIFA World
                  </NavLink>
                  <NavLink to="/rankings?view=fifaAfrica" onClick={function () {}} className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition">
                    FIFA Africa
                  </NavLink>
                  <NavLink to="/rankings?view=fifaSouthAmerica" onClick={function () {}} className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition">
                    FIFA South America
                  </NavLink>
                  <NavLink to="/rankings?view=fifaAsia" onClick={function () {}} className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition">
                    FIFA Asia
                  </NavLink>
                </div>
              </div>
            </li>

            {/* Community dropdown: click OR hover to see the 4 chat rooms */}
            <li className="relative group" ref={communityRef}>
              <button
                type="button"
                onClick={function () { setCommunityOpen(!communityOpen); }}
                className={
                  "flex items-center gap-1 " +
                  (location.pathname === "/community" ? "text-cyan-400 font-semibold" : "text-white hover:text-cyan-300") +
                  " transition py-1"
                }
              >
                Community <span className="text-xs text-gray-500">▼</span>
              </button>
              <div className={
                "absolute left-0 top-full mt-0 pt-1 z-50 " +
                (communityOpen ? "block" : "hidden group-hover:block")
              }>
                <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl w-52 py-1">
                  <p className="px-3 py-1 text-xs text-gray-500 border-b border-gray-700">Chat rooms</p>
                  <NavLink to="/community?room=general" onClick={function () { setCommunityOpen(false); }} className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition">
                    General Chat
                  </NavLink>
                  <NavLink to="/community?room=ballon-dor" onClick={function () { setCommunityOpen(false); }} className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition">
                    Ballon d&apos;Or
                  </NavLink>
                  <NavLink to="/community?room=transfers" onClick={function () { setCommunityOpen(false); }} className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition">
                    Transfers
                  </NavLink>
                  <NavLink to="/community?room=goat" onClick={function () { setCommunityOpen(false); }} className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition">
                    GOAT Debate
                  </NavLink>
                </div>
              </div>
            </li>
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
                <li>
                  <p className="text-gray-500 text-xs mt-1 mb-1">Rankings</p>
                  <ul className="pl-3 space-y-1">
                    <li><NavLink to="/rankings?view=power" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>Team Power</NavLink></li>
                    <li><NavLink to="/rankings?view=uefa" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>UEFA Clubs</NavLink></li>
                    <li><NavLink to="/rankings?view=fifaWorld" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>FIFA World</NavLink></li>
                    <li><NavLink to="/rankings?view=fifaAfrica" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>FIFA Africa</NavLink></li>
                    <li><NavLink to="/rankings?view=fifaSouthAmerica" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>FIFA South America</NavLink></li>
                    <li><NavLink to="/rankings?view=fifaAsia" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>FIFA Asia</NavLink></li>
                  </ul>
                </li>
                <li>
                  <p className="text-gray-500 text-xs mt-1 mb-1">Community (chat rooms)</p>
                  <ul className="pl-3 space-y-1">
                    <li><NavLink to="/community?room=general" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>General Chat</NavLink></li>
                    <li><NavLink to="/community?room=ballon-dor" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>Ballon d&apos;Or</NavLink></li>
                    <li><NavLink to="/community?room=transfers" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>Transfers</NavLink></li>
                    <li><NavLink to="/community?room=goat" className={function (nav) { return navClass(nav.isActive); }} onClick={closeMenu}>GOAT Debate</NavLink></li>
                  </ul>
                </li>

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
  );
}

export default App;
