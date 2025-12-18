// ========================================
// App.js - Main Router & Layout
// ========================================
// This is the root component. It uses React Router to show different pages
// based on the URL. Router wraps the app, Routes matches the URL path to a
// component, and NavLink creates links that highlight when active.

import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Players from "./pages/Players";
import Predictions from "./pages/Predictions";
import Community from "./pages/Community";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PlayerComparison from "./pages/PlayerComparison"; 

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
        {/* Navigation Bar - Show logo and links to all pages */}
        <nav className="w-full flex justify-between items-center bg-gray-800 p-4 rounded-lg mb-6 shadow-lg">
          <h1 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
            <span>⚽</span> <span>StatSphere</span>
          </h1>
          {/* NavLink automatically detects active page using isActive prop */}
          <ul className="flex gap-6 text-lg">
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
          </ul>
        </nav>

        {/* Routes - Match URL paths to page components */}
        {/* When user clicks a NavLink, the URL changes and Routes renders the matching component */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/players" element={<Players />} />
          <Route path="/compare" element={<PlayerComparison />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/community" element={<Community />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
