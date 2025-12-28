import React, { useState } from "react";

// 👇 Tumhare .env me VITE_API_URL = http://localhost:5000/api hai
const API = `${import.meta.env.VITE_API_URL}/notification/add`;

const AddNotification = () => {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();
  setStatus("Saving...");

  try {
    const token =
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    console.log("DEBUG -> token from localStorage:", token);
    if (!token) {
      setStatus("❌ No admin token found. Please login as admin.");
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const res = await fetch(API, {
      method: "POST",
      headers,
      body: JSON.stringify({ message }),
    });

    const data = await res.json().catch(() => null);
    console.log("DEBUG -> response status:", res.status, "body:", data);

    if (res.ok) {
      setStatus("✅ Message saved successfully!");
      setMessage("");
    } else {
      setStatus(`❌ Error: ${data?.message || data?.error || res.statusText}`);
    }
  } catch (err) {
    console.error("DEBUG -> fetch error:", err);
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
          {/* ✅ Textarea visible black text */}
          <textarea
            className="w-full bg-white text-black placeholder-gray-500 border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Enter notification message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Save Message
          </button>
        </form>

        {status && <p className="mt-4 text-sm">{status}</p>}
      </div>
    </section>
  );
};

export default AddNotification;
