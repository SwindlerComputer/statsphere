import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Players from "./pages/Players";
import Predictions from "./pages/Predictions";
import Community from "./pages/Community";
import Login from "./pages/Login"; 

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
        {/* Navigation Bar */}
        <nav className="w-full flex justify-between items-center bg-gray-800 p-4 rounded-lg mb-6 shadow-lg">
          <h1 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
            <span>⚽</span> <span>StatSphere</span>
          </h1>
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

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/players" element={<Players />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/community" element={<Community />} />
          <Route path="/login" element={<Login />} />
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
