import React, { useState, useEffect } from "react";
import axios from "axios";
import { Check, X } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { API_CONFIG } from "../config/api.config";

const API_BASE = API_CONFIG.API_BASE;

const Deposite = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upi");
  const { admin } = useAdminAuth();

  // ✅ Get auth header
  const getAuthHeader = () => ({
    Authorization: `Bearer ${admin.token || localStorage.getItem("admin_token")}`,
    "Content-Type": "application/json",
  });

  // ✅ Fetch all deposits
  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/deposits`, {
        headers: getAuthHeader(),
      });
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
      // 1️⃣ Update deposit status (backend auto-updates wallet)
      const res = await axios.put(
        `${API_BASE}/admin/deposits/${depositId}/approve`,
        { remarks: "Approved by admin" },
        { headers: getAuthHeader() }
      );

      if (res.data.success) {
        alert("✅ Deposit approved and wallet updated!");
        fetchDeposits();
      } else {
        alert(res.data.message || "Failed to approve deposit ❌");
      }
    } catch (err) {
      console.error("Error approving deposit:", err);
      alert(err.response?.data?.message || "Server error");
    }
  };

  // ❌ Reject deposit
  const handleReject = async (depositId) => {
    try {
      const res = await axios.put(
        `${API_BASE}/admin/deposits/${depositId}/reject`,
        { rejectionReason: "Rejected by admin" },
        { headers: getAuthHeader() }
      );

      if (res.data.success) {
        alert("✅ Deposit rejected!");
        fetchDeposits();
      } else {
        alert(res.data.message || "Failed to reject deposit ❌");
      }
    } catch (err) {
      console.error("Error rejecting deposit:", err);
      alert(err.response?.data?.message || "Server error");
    }
  };

  // 🧩 Filter deposits
  const filteredDeposits = deposits.filter(
    (d) => d.method.toLowerCase() === activeTab.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-2 sm:px-4 py-6 sm:py-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Deposit Management</h2>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
        {["upi", "crypto"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 sm:px-6 py-2 rounded-md font-medium text-sm sm:text-base ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-gray-400">Loading deposits...</p>}
      {!loading && filteredDeposits.length === 0 && (
        <p className="text-center text-gray-400">No deposits found.</p>
      )}
      {!loading && filteredDeposits.length > 0 && (
        <div className="flex flex-col gap-6 items-center">
          {filteredDeposits.map((d) => {
            let statusClass = "text-red-400";
            if (d.status === "pending") statusClass = "text-yellow-400";
            else if (d.status === "approved") statusClass = "text-green-400";

            return (
            <div
              key={d._id}
              className="bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-4xl border border-gray-700 hover:border-blue-500 transition"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-blue-400">
                    ₹{d.amount} — {d.method.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-400">
                    Status:{" "}
                    <span className={`font-medium ${statusClass}`}>{d.status.toUpperCase()}</span>
                  </p>
                </div>
                {d.status === "pending" && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() =>
                        handleApprove(d._id, d.userId?._id || d.userId, d.amount)
                      }
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(d._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="mb-4 p-3 bg-gray-700 rounded-lg text-sm">
                <p className="text-gray-300 mb-1">
                  👤 <span className="font-medium">{d.userId?.name || "Unknown"}</span> ({d.userId?.email || "N/A"})
                </p>
                <p className="text-gray-400 text-xs">
                  User ID: <span className="font-mono text-gray-300">{d.userId?._id || d.userId || "N/A"}</span>
                </p>
              </div>

              {/* UPI Details */}
              {d.method === "UPI" && d.upiDetails && (
                <div className="mb-4 p-3 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg text-sm">
                  <p className="text-green-300 font-medium mb-2">📱 UPI Details</p>
                  <p className="text-gray-300">
                    Transaction ID: <span className="font-mono text-white">{d.upiDetails.transactionId}</span>
                  </p>
                </div>
              )}

              {/* Crypto Details - MOST IMPORTANT: User's wallet address */}
              {d.method === "Crypto" && d.cryptoDetails && (
                <div className="mb-4 p-4 bg-blue-900 bg-opacity-40 border-2 border-blue-500 rounded-lg">
                  <p className="text-blue-300 font-bold mb-3">🔷 CRYPTO DETAILS - USER WALLET ADDRESS:</p>
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-200">
                      Network: <span className="font-semibold text-white">{d.cryptoDetails.network?.toUpperCase() || "N/A"}</span>
                    </p>
                    
                    {/* 🚨 USER'S RECEIVING WALLET - MOST IMPORTANT */}
                    {d.cryptoDetails.userReceivingWallet && (
                      <div className="p-2 bg-yellow-900 bg-opacity-50 border border-yellow-500 rounded">
                        <p className="text-yellow-300 font-bold text-xs mb-1">👛 USER'S WALLET (Send USDT here):</p>
                        <p className="text-white font-mono text-xs break-all">
                          {d.cryptoDetails.userReceivingWallet}
                        </p>
                      </div>
                    )}

                    {d.cryptoDetails.transactionHash && (
                      <p className="text-gray-200">
                        Transaction: <span className="font-mono text-gray-300">{d.cryptoDetails.transactionHash.substring(0, 20)}...</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Remarks */}
              {d.remarks && (
                <div className="mb-4 p-3 bg-gray-700 rounded-lg text-sm">
                  <p className="text-gray-300 mb-1">
                    💬 Remarks: <span className="text-gray-200">{d.remarks}</span>
                  </p>
                </div>
              )}

              {/* Footer Info */}
              <div className="text-xs text-gray-500 pt-3 border-t border-gray-700">
                <p>Created: {new Date(d.createdAt).toLocaleString()}</p>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Deposite;
