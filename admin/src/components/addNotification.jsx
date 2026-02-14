import React, { useState } from "react";

// Build API base correctly and use /api prefix
const API_BASE = import.meta.env.VITE_API_URL.replace(/\/$/, "") + "/api";
const API = `${API_BASE}/notification`;

const AddNotification = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isBroadcast, setIsBroadcast] = useState(true);
  const [targetUserId, setTargetUserId] = useState("");
  const [status, setStatus] = useState("");

  const getToken = () => {
    return (
      localStorage.getItem("admin_token") ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      null
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Saving...");

    try {
      const token = getToken();
      if (!token) {
        setStatus("❌ No admin token found. Please login as admin.");
        return;
      }

      const payload = {
        title: title || "Announcement",
        message,
        isBroadcast: !!isBroadcast,
      };

      if (!isBroadcast) payload.userId = targetUserId || null;

      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setStatus("✅ Notification sent successfully!");
        setTitle("");
        setMessage("");
        setTargetUserId("");
      } else {
        setStatus(`❌ Error: ${data?.message || data?.error || res.statusText}`);
      }
    } catch (err) {
      console.error("Notification send error:", err);
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-2xl text-white font-bold mb-4 text-center mt-6">
        Add Notification
      </h1>

      <div className="mx-4 p-6 bg-slate-700 text-white rounded-xl shadow-md">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Optional title (e.g., System Update)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white text-black placeholder-gray-500 border rounded-lg p-2 mb-3 focus:outline-none"
          />

          <textarea
            className="w-full bg-white text-black placeholder-gray-500 border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Enter notification message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>

          <div className="flex items-center gap-3 mb-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isBroadcast}
                onChange={() => setIsBroadcast((s) => !s)}
              />
              <span className="text-sm">Broadcast to all users</span>
            </label>
          </div>

          {!isBroadcast && (
            <div className="mb-3">
              <input
                type="text"
                placeholder="Target userId (MongoDB ObjectId)"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full bg-white text-black placeholder-gray-500 border rounded-lg p-2 focus:outline-none"
              />
              <p className="text-xs text-gray-300 mt-1">Enter user _id to send a private notification.</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Send Notification
          </button>
        </form>

        {status && <p className="mt-4 text-sm">{status}</p>}
      </div>
    </section>
  );
};

export default AddNotification;
