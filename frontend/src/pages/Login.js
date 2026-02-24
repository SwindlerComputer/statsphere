// ========================================
// Login.js - User Login Page
// ========================================
// Users can log in with their EMAIL or USERNAME.
// The backend checks if the input contains "@" to
// decide whether to look up by email or username.

import { useState } from "react";

var API_BASE = process.env.REACT_APP_API_URL;

export default function Login() {
  var [loginInput, setLoginInput] = useState("");
  var [password, setPassword] = useState("");
  var [msg, setMsg] = useState("");
  var [isSuccess, setIsSuccess] = useState(false);
  var [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setMsg("");
    setIsSuccess(false);

    if (!loginInput.trim() || !password) {
      setMsg("Please enter your email/username and password");
      return;
    }

    try {
      var res = await fetch(API_BASE + "/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginInput.trim(), password: password }),
      });

      var data = await res.json();

      if (!res.ok) {
        setMsg(data.message || "Login failed");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setIsSuccess(true);
      setMsg("Login successful! Redirecting...");
      setTimeout(function () {
        window.location.href = "/";
      }, 500);
    } catch (err) {
      console.error("Login error:", err);
      setMsg("Could not connect to server. Is the backend running?");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="bg-gray-800 p-6 sm:p-8 rounded-lg w-full max-w-md shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6 text-center">
          StatSphere Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email or Username */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Email or Username</label>
            <input
              type="text"
              placeholder="Enter your email or username"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-cyan-400 focus:outline-none text-sm sm:text-base"
              value={loginInput}
              onChange={function (e) { setLoginInput(e.target.value); }}
              required
            />
            <p className="text-xs text-gray-500 mt-1">You can use your email address or username</p>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full p-3 pr-16 rounded bg-gray-700 border border-gray-600 focus:border-cyan-400 focus:outline-none text-sm sm:text-base"
                value={password}
                onChange={function (e) { setPassword(e.target.value); }}
                required
              />
              <button
                type="button"
                onClick={function () { setShowPassword(!showPassword); }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 hover:text-white px-2 py-1"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Error / Success message */}
          {msg && (
            <p className={"text-center text-sm " + (isSuccess ? "text-green-400" : "text-red-400")}>
              {msg}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 transition p-3 rounded-lg font-semibold text-sm sm:text-base"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-4">
          Don't have an account?{" "}
          <a href="/register" className="text-cyan-400 hover:underline">Create one</a>
        </p>
      </div>
    </div>
  );
}
