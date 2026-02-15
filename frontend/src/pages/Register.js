// ========================================
// Register.js - User Registration Page
// ========================================
// Allows new users to create an account.
// Sends name, email, password to backend which saves to PostgreSQL.

import { useState } from "react";

// API_BASE = backend URL from .env file
const API_BASE = process.env.REACT_APP_API_URL;

export default function Register() {
  // State for form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // State for showing success/error messages
  const [msg, setMsg] = useState("");
  // State to track if message is success or error
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsSuccess(false);

    // Check password length before sending to server
    if (password.length < 8) {
      setMsg("Password must be at least 8 characters");
      return;
    }

    try {
      // Send POST request to backend register endpoint
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      // If registration failed, show error message
      if (!res.ok) {
        setMsg(data.message || "Registration failed");
        return;
      }

      // Registration successful - show success message
      // Backend already sets the cookie, so user is logged in
      setIsSuccess(true);
      setMsg("Account created! Redirecting to dashboard...");
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);

    } catch (err) {
      // Network error or backend not running
      console.error("Registration error:", err);
      setMsg("Could not connect to server. Is the backend running?");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md shadow-xl">
        
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-cyan-400 mb-6 text-center">
          Create Account
        </h1>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">

          {/* Username Input */}
          <div>
            <label className="block mb-1 text-sm">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-cyan-400 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block mb-1 text-sm">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-cyan-400 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block mb-1 text-sm">Password (min 8 characters)</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-cyan-400 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Show success or error message */}
          {msg && (
            <p className={`text-center text-sm ${isSuccess ? "text-green-400" : "text-red-400"}`}>
              {msg}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 transition p-3 rounded-lg font-semibold"
          >
            Register
          </button>
        </form>

        {/* Link to Login Page */}
        <p className="text-center text-gray-400 text-sm mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-cyan-400 hover:underline">
            Login here
          </a>
        </p>

      </div>
    </div>
  );
}
