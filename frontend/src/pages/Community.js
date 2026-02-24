// ========================================
// Community.js - Real-Time Chat Page
// ========================================
// Uses WebSockets (Socket.IO) for live chat.
// Includes a report modal for reporting messages.

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

var API_BASE = process.env.REACT_APP_API_URL;

export default function Community({ user }) {
  var [messages, setMessages] = useState([]);
  var [newMessage, setNewMessage] = useState("");
  var [socket, setSocket] = useState(null);
  var [error, setError] = useState("");
  var [success, setSuccess] = useState("");
  var [loading, setLoading] = useState(true);

  // Report modal state
  var [showReportModal, setShowReportModal] = useState(false);
  var [reportMessage, setReportMessage] = useState(null);
  var [reportReason, setReportReason] = useState("");
  var [reportCategory, setReportCategory] = useState("inappropriate");
  var [reportLoading, setReportLoading] = useState(false);

  // Ref for auto-scrolling to bottom
  var chatEndRef = useRef(null);

  // Auto-scroll when new messages arrive
  function scrollToBottom() {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Connect to WebSocket server
  useEffect(function () {
    var savedToken = localStorage.getItem("token");
    var newSocket = io(API_BASE, {
      withCredentials: true,
      auth: savedToken ? { token: savedToken } : {}
    });

    setSocket(newSocket);

    newSocket.on("chat_history", function (history) {
      setMessages(history);
      setLoading(false);
    });

    newSocket.on("new_message", function (message) {
      setMessages(function (prev) { return [...prev, message]; });
    });

    newSocket.on("error_message", function (errorText) {
      setError(errorText);
      setTimeout(function () { setError(""); }, 3000);
    });

    return function () {
      newSocket.disconnect();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(function () {
    scrollToBottom();
  }, [messages]);

  // Send a message
  function handleSendMessage(e) {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    socket.emit("send_message", newMessage);
    setNewMessage("");
  }

  // Format timestamp
  function formatTime(timestamp) {
    var date = new Date(timestamp);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    if (minutes < 10) minutes = "0" + minutes;
    return hours + ":" + minutes;
  }

  // Open the report modal
  function openReportModal(msg) {
    setReportMessage(msg);
    setReportReason("");
    setReportCategory("inappropriate");
    setShowReportModal(true);
  }

  // Close the report modal
  function closeReportModal() {
    setShowReportModal(false);
    setReportMessage(null);
    setReportReason("");
    setReportLoading(false);
  }

  // Submit the report
  function submitReport() {
    if (!reportReason.trim()) {
      setError("Please enter a reason for the report");
      setTimeout(function () { setError(""); }, 3000);
      return;
    }

    setReportLoading(true);

    var fullReason = "[" + reportCategory.toUpperCase() + "] " + reportReason.trim();

    var savedToken = localStorage.getItem("token");
    fetch(API_BASE + "/api/mod/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(savedToken ? { "Authorization": "Bearer " + savedToken } : {})
      },
      credentials: "include",
      body: JSON.stringify({
        messageId: reportMessage.id,
        messageText: reportMessage.text,
        reason: fullReason
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          setSuccess("Report submitted! Our team will review it.");
          setTimeout(function () { setSuccess(""); }, 4000);
          closeReportModal();
        } else {
          setError(data.error || "Failed to submit report");
          setTimeout(function () { setError(""); }, 3000);
          setReportLoading(false);
        }
      })
      .catch(function () {
        setError("Failed to submit report. Please try again.");
        setTimeout(function () { setError(""); }, 3000);
        setReportLoading(false);
      });
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-2">
      <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-2 text-center">
        Community Chat
      </h1>

      {/* Login status */}
      <div className="bg-gray-800 rounded-lg p-3 mb-4 text-center">
        {user ? (
          <p className="text-green-400 text-sm sm:text-base">
            Logged in as <span className="font-bold">{user.name}</span>
          </p>
        ) : (
          <p className="text-gray-400 text-sm sm:text-base">
            Viewing as Guest - <a href="/login" className="text-cyan-400 hover:underline">Login</a> to chat
          </p>
        )}
      </div>

      {/* Chat Messages */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4 h-80 sm:h-96 overflow-y-auto mb-4">
        {loading ? (
          <p className="text-gray-400 text-center mt-20">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500 text-center mt-20">
            No messages yet. Be the first to say hello!
          </p>
        ) : (
          messages.map(function (msg) {
            return (
              <div key={msg.id} className="mb-3">
                {/* Message Header */}
                <div className="flex justify-between items-center mb-1">
                  <span className="text-cyan-400 font-semibold text-xs sm:text-sm">
                    {msg.userName || msg.userEmail}
                  </span>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-gray-500 text-xs">
                      {formatTime(msg.timestamp)}
                    </span>
                    {user && (
                      <button
                        onClick={function () { openReportModal(msg); }}
                        className="text-xs text-red-400 hover:text-red-300 px-1 sm:px-2 py-1 rounded hover:bg-gray-700"
                        title="Report this message"
                      >
                        Report
                      </button>
                    )}
                  </div>
                </div>
                {/* Message Content */}
                <p className="bg-gray-700 p-2 sm:p-3 rounded-lg text-white text-sm sm:text-base break-words">
                  {msg.text}
                </p>
              </div>
            );
          })
        )}
        <div ref={chatEndRef}></div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 border border-red-600 text-red-100 px-3 py-2 rounded-lg mb-2">
          <p className="text-center text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-900 border border-green-700 text-green-200 px-3 py-2 rounded-lg mb-2">
          <p className="text-center text-sm">{success}</p>
        </div>
      )}

      {/* Message Input */}
      {user ? (
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={function (e) { setNewMessage(e.target.value); }}
            placeholder="Type your message..."
            maxLength={200}
            className="flex-1 p-2 sm:p-3 rounded bg-gray-700 border border-gray-600 focus:border-cyan-400 focus:outline-none text-sm sm:text-base"
          />
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-600 px-4 sm:px-6 py-2 sm:py-3 rounded font-semibold transition text-sm sm:text-base"
          >
            Send
          </button>
        </form>
      ) : (
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-400 mb-2 text-sm">You must be logged in to send messages</p>
          <a href="/login" className="text-cyan-400 hover:underline">Login here</a>
        </div>
      )}

      {/* ========================================
          REPORT MODAL
          ======================================== */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-lg sm:text-xl font-bold text-red-400 mb-4">Report Message</h2>

            {/* Show the message being reported */}
            <div className="bg-gray-700 p-3 rounded mb-4">
              <p className="text-xs text-gray-400 mb-1">Message from {reportMessage.userName}:</p>
              <p className="text-sm text-white break-words">"{reportMessage.text}"</p>
            </div>

            {/* Category dropdown */}
            <label className="block text-sm text-gray-300 mb-1">Category:</label>
            <select
              value={reportCategory}
              onChange={function (e) { setReportCategory(e.target.value); }}
              className="w-full p-2 sm:p-3 rounded bg-gray-700 border border-gray-600 text-white mb-4 text-sm sm:text-base"
            >
              <option value="inappropriate">Inappropriate Content</option>
              <option value="harassment">Harassment / Bullying</option>
              <option value="hate-speech">Hate Speech</option>
              <option value="spam">Spam</option>
              <option value="other">Other</option>
            </select>

            {/* Reason text input */}
            <label className="block text-sm text-gray-300 mb-1">Why are you reporting this?</label>
            <textarea
              value={reportReason}
              onChange={function (e) { setReportReason(e.target.value); }}
              placeholder="Describe why this message should be reviewed..."
              rows="3"
              maxLength={300}
              className="w-full p-2 sm:p-3 rounded bg-gray-700 border border-gray-600 text-white mb-4 resize-none text-sm sm:text-base"
            />

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeReportModal}
                className="flex-1 p-2 sm:p-3 rounded bg-gray-600 hover:bg-gray-500 transition text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                disabled={reportLoading}
                className={
                  "flex-1 p-2 sm:p-3 rounded font-semibold transition text-sm sm:text-base " +
                  (reportLoading
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white")
                }
              >
                {reportLoading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
