// ========================================
// Register.js - User Registration Page
// ========================================
// Users create an account with username, email, and password.
// Includes validation: valid email, strong password.

import { useState } from "react";

var API_BASE = process.env.REACT_APP_API_URL;

export default function Register() {
  var [name, setName] = useState("");
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [confirmPassword, setConfirmPassword] = useState("");
  var [msg, setMsg] = useState("");
  var [isSuccess, setIsSuccess] = useState(false);
  var [showPassword, setShowPassword] = useState(false);

  // Check password strength and return a label + color
  function getPasswordStrength() {
    if (password.length === 0) return { label: "", color: "", percent: 0 };
    var score = 0;
    if (password.length >= 8) score = score + 1;
    if (/[A-Z]/.test(password)) score = score + 1;
    if (/[0-9]/.test(password)) score = score + 1;
    if (/[^a-zA-Z0-9]/.test(password)) score = score + 1;

    if (score <= 1) return { label: "Weak", color: "bg-red-500", percent: 25 };
    if (score === 2) return { label: "Fair", color: "bg-yellow-500", percent: 50 };
    if (score === 3) return { label: "Good", color: "bg-blue-500", percent: 75 };
    return { label: "Strong", color: "bg-green-500", percent: 100 };
  }

  // Validate email format
  function isValidEmail(emailStr) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  }

  // Handle form submission
  async function handleRegister(e) {
    e.preventDefault();
    setMsg("");
    setIsSuccess(false);

    // Client-side validation
    if (name.trim().length < 3) {
      setMsg("Username must be at least 3 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(name.trim())) {
      setMsg("Username can only contain letters, numbers, and underscores");
      return;
    }
    if (!isValidEmail(email)) {
      setMsg("Please enter a valid email address (e.g. user@example.com)");
      return;
    }
    if (password.length < 8) {
      setMsg("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setMsg("Password must contain at least one uppercase letter (A-Z)");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setMsg("Password must contain at least one number (0-9)");
      return;
    }
    if (password !== confirmPassword) {
      setMsg("Passwords do not match");
      return;
    }

    try {
      var res = await fetch(API_BASE + "/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password: password }),
      });

      var data = await res.json();

      if (!res.ok) {
        setMsg(data.message || "Registration failed");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setIsSuccess(true);
      setMsg("Account created! Redirecting...");

      setTimeout(function () {
        window.location.href = "/";
      }, 1000);
    } catch (err) {
      console.error("Registration error:", err);
      setMsg("Could not connect to server. Is the backend running?");
    }
  }

  var strength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="bg-gray-800 p-6 sm:p-8 rounded-lg w-full max-w-md shadow-xl">

        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6 text-center">
          Create Account
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">

          {/* Username */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Username</label>
            <input
              type="text"
              placeholder="e.g. john_doe"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-cyan-400 focus:outline-none text-sm sm:text-base"
              value={name}
              onChange={function (e) { setName(e.target.value); }}
              required
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">3-20 characters, letters, numbers, underscores</p>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Email</label>
            <input
              type="email"
              placeholder="e.g. john@example.com"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-cyan-400 focus:outline-none text-sm sm:text-base"
              value={email}
              onChange={function (e) { setEmail(e.target.value); }}
              required
            />
            {email.length > 0 && !isValidEmail(email) && (
              <p className="text-xs text-red-400 mt-1">Please enter a valid email</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
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

            {/* Password strength bar */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className={"h-2 rounded-full transition-all " + strength.color}
                    style={{ width: strength.percent + "%" }}
                  ></div>
                </div>
                <p className={"text-xs mt-1 " + (strength.percent <= 25 ? "text-red-400" : strength.percent <= 50 ? "text-yellow-400" : strength.percent <= 75 ? "text-blue-400" : "text-green-400")}>
                  Strength: {strength.label}
                </p>
              </div>
            )}

            {/* Password requirements checklist */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className={"text-xs " + (password.length >= 8 ? "text-green-400" : "text-gray-500")}>
                  {password.length >= 8 ? "+" : "-"} At least 8 characters
                </p>
                <p className={"text-xs " + (/[A-Z]/.test(password) ? "text-green-400" : "text-gray-500")}>
                  {/[A-Z]/.test(password) ? "+" : "-"} One uppercase letter (A-Z)
                </p>
                <p className={"text-xs " + (/[0-9]/.test(password) ? "text-green-400" : "text-gray-500")}>
                  {/[0-9]/.test(password) ? "+" : "-"} One number (0-9)
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter your password"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-cyan-400 focus:outline-none text-sm sm:text-base"
              value={confirmPassword}
              onChange={function (e) { setConfirmPassword(e.target.value); }}
              required
            />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
            )}
            {confirmPassword.length > 0 && password === confirmPassword && (
              <p className="text-xs text-green-400 mt-1">Passwords match</p>
            )}
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
            Register
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-cyan-400 hover:underline">Login here</a>
        </p>
      </div>
    </div>
  );
}
