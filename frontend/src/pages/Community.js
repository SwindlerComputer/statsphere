// ========================================
// Community.js - Real-Time Chat Page
// ========================================
// This page uses WebSockets (Socket.IO) for live chat.
// 
// HOW IT WORKS:
// 1. When page loads, we connect to the server via WebSocket
// 2. Server sends us all existing messages (chat_history)
// 3. When someone sends a message, server broadcasts it to everyone (new_message)
// 4. Only logged-in users can send messages, guests can only view
//
// SOCKET.IO EVENTS:
// - socket.emit("event", data)  = Send data TO server
// - socket.on("event", callback) = Listen for data FROM server

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Community() {
  // Store all chat messages
  const [messages, setMessages] = useState([]);
  // Store the message being typed
  const [newMessage, setNewMessage] = useState("");
  // Store the socket connection
  const [socket, setSocket] = useState(null);
  // Store current user (null if guest)
  const [user, setUser] = useState(null);
  // Store error messages
  const [error, setError] = useState("");

  // ========================================
  // STEP 1: Check if user is logged in
  // ========================================
  useEffect(() => {
    fetch("http://localhost:5000/auth/me", {
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.log("Not logged in"));
  }, []);

  // ========================================
  // STEP 2: Connect to WebSocket server
  // ========================================
  useEffect(() => {
    // Create socket connection to backend
    // withCredentials: true sends cookies (for JWT auth)
    let newSocket = io("http://localhost:5000", {
      withCredentials: true
    });

    // Save socket to state
    setSocket(newSocket);

    // ========================================
    // LISTEN: Receive chat history when we connect
    // ========================================
    newSocket.on("chat_history", (history) => {
      console.log("Received chat history:", history.length, "messages");
      setMessages(history);
    });

    // ========================================
    // LISTEN: Receive new messages in real-time
    // ========================================
    newSocket.on("new_message", (message) => {
      console.log("New message received:", message);
      // Add new message to the end of messages array
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // ========================================
    // LISTEN: Receive error messages
    // ========================================
    newSocket.on("error_message", (errorText) => {
      setError(errorText);
      // Clear error after 3 seconds
      setTimeout(() => setError(""), 3000);
    });

    // ========================================
    // CLEANUP: Disconnect when leaving page
    // ========================================
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // ========================================
  // STEP 3: Send a message
  // ========================================
  function handleSendMessage(e) {
    e.preventDefault();
    
    // Don't send empty messages
    if (newMessage.trim() === "") {
      return;
    }

    // Send message to server via WebSocket
    socket.emit("send_message", newMessage);

    // Clear the input box
    setNewMessage("");
  }

  // Format timestamp to readable time (e.g. "14:30")
  function formatTime(timestamp) {
    let date = new Date(timestamp);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    // Add leading zero if needed (e.g. 9 -> 09)
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    return hours + ":" + minutes;
  }

  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-3xl font-bold text-cyan-400 mb-2 text-center">
        💬 Community Chat
      </h1>
      {/* Show login status */}
      <div className="bg-gray-800 rounded-lg p-3 mb-4 text-center">
        {user ? (
          <p className="text-green-400">
            ✅ Logged in as <span className="font-bold">{user.name}</span>
          </p>
        ) : (
          <p className="text-gray-400">
            👁️ Viewing as Guest
          </p>
        )}
      </div>

      {/* Chat Messages Box */}
      <div className="bg-gray-800 rounded-lg p-4 h-96 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center mt-20">
            No messages yet. Be the first to say hello!
          </p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="mb-3">
              {/* Message Header: Username and Time */}
              <div className="flex justify-between items-center mb-1">
                <span className="text-cyan-400 font-semibold text-sm">
                  {msg.userName || msg.userEmail}
                </span>
                <span className="text-gray-500 text-xs">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              {/* Message Content */}
              <p className="bg-gray-700 p-3 rounded-lg text-white">
                {msg.text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-400 text-center text-sm mb-2">{error}</p>
      )}

      {/* Message Input Form */}
      {user ? (
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 rounded bg-gray-700 border border-gray-600 focus:border-cyan-400 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded font-semibold transition"
          >
            Send
          </button>
        </form>
      ) : (
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-400 mb-2">You must be logged in to send messages</p>
          <a href="/login" className="text-cyan-400 hover:underline">
            Login here
          </a>
        </div>
      )}
    </div>
  );
}
