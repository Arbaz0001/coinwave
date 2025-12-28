import React, { useState, useEffect } from "react";
import axios from "axios";
import { Check, X } from "lucide-react";

const Deposite = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upi");

  // ✅ Fetch all deposits
  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/deposit/all`);
      if (res.data.success) {
        setDeposits(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching deposits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  // ✅ Approve deposit
  const handleApprove = async (depositId, userId, amount) => {
    try {
      // 🧩 Handle both userId types (object or string)
      const finalUserId =
        userId && typeof userId === "object" ? userId._id : userId;

      if (!finalUserId) {
        alert("❌ User ID missing in this deposit!");
        console.error("Deposit missing userId:", { depositId, userId });
        return;
      }

      console.log("🟩 Wallet Add Request:", {
        userId: finalUserId,
        amount,
      });

      // 1️⃣ Update deposit status
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/deposit/${depositId}/status`,
        { status: "approved" }
      );

      if (res.data.success) {
        // 2️⃣ Update wallet
        const walletRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/wallet/add`,
          {
            userId: finalUserId,
            amount: Number(amount),
          }
        );

        if (walletRes.data.success) {
          alert("✅ Deposit approved and wallet updated!");
          fetchDeposits();
        } else {
          alert(walletRes.data.message || "Wallet update failed ❌");
        }
      } else {
        alert("Deposit status update failed ❌");
      }
    } catch (err) {
      console.error("Error approving deposit:", err);
      alert("Server error");
    }
  };

  // ❌ Reject deposit
  const handleReject = async (depositId) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/deposit/${depositId}/status`,
        { status: "rejected" }
      );

      if (res.data.success) {
        alert("Deposit rejected ❌");
        fetchDeposits();
      } else {
        alert("Failed to reject deposit ❌");
      }
    } catch (err) {
      console.error("Error rejecting deposit:", err);
      alert("Error rejecting deposit");
    }
  };

  // 🧩 Filter deposits
  const filteredDeposits = deposits.filter(
    (d) => d.method.toLowerCase() === activeTab.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">Deposit Management</h2>

      {/* Tabs */}
      <div className="flex justify-center gap-3 mb-8">
        {["upi", "crypto"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-md font-medium ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-400">Loading deposits...</p>
      ) : filteredDeposits.length === 0 ? (
        <p className="text-center text-gray-400">No deposits found.</p>
      ) : (
        <div className="flex flex-col gap-6 items-center">
          {filteredDeposits.map((d) => (
            <div
              key={d._id}
              className="bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-3xl flex flex-col md:flex-row justify-between items-center gap-4 border border-gray-700 hover:border-blue-500 transition"
            >
              <div className="space-y-1">
                <p className="text-lg font-semibold text-blue-400">
                  ₹{d.amount} — {d.method.toUpperCase()}
                </p>
                <p className="text-sm text-gray-400">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      d.status === "pending"
                        ? "text-yellow-400"
                        : d.status === "approved"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {d.status.toUpperCase()}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  User ID:{" "}
                  <span className="text-gray-300">
                    {d.userId?._id || d.userId || "N/A"}
                  </span>
                </p>
              </div>

              <div className="flex gap-3">
                {d.status === "pending" ? (
                  <>
                    <button
                      onClick={() =>
                        handleApprove(
                          d._id,
                          d.userId?._id || d.userId,
                          d.amount
                        )
                      }
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-1 transition"
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(d._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-1 transition"
                    >
                      <X size={16} /> Reject
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-4 py-2 rounded-md font-medium ${
                      d.status === "approved"
                        ? "bg-green-700 text-white"
                        : "bg-red-700 text-white"
                    }`}
                  >
                    {d.status.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Deposite;
