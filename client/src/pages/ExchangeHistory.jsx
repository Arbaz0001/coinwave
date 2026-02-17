import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_CONFIG } from "../config/api.config";

export default function ExchangeHistory() {
  const [buyHistory, setBuyHistory] = useState([]);
  const [sellHistory, setSellHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("cw_user"));

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?._id) {
        setLoading(false);
        setError("User not logged in");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [buyRes, sellRes] = await Promise.all([
          axiosInstance.get(`${API_CONFIG.API_BASE}/deposit/user/${user._id}`),
          axiosInstance.get(`${API_CONFIG.API_BASE}/sell/history/me`),
        ]);

        const buyData = buyRes.data?.data || [];
        const sellData = sellRes.data?.data || [];

        setBuyHistory(buyData.filter((item) => item.method === "BUY_USDT"));
        setSellHistory(sellData);
      } catch (err) {
        console.error("Failed to fetch exchange history:", err?.response?.data || err?.message);
        setError(err?.response?.data?.message || "Failed to load exchange history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?._id]);

  const renderEmpty = (text) => (
    <p className="text-gray-500 text-sm">{text}</p>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">🔁 Exchange History</h1>

      {loading && <p className="text-gray-500">Loading...</p>}
      {!loading && error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      {!loading && !error && (
        <div className="space-y-6 md:space-y-8">
          <section>
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-900">🟢 Buy USDT History</h2>
            {buyHistory.length === 0 && renderEmpty("No buy history found.")}
            {buyHistory.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {buyHistory.map((item) => (
                  <div
                    key={item._id}
                    className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-base md:text-lg">₹ {Number(item.amount).toFixed(2)}</p>
                      <span className="text-xs uppercase px-2 py-1 rounded-full bg-gray-100 text-gray-600">{item.status}</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500">
                      Network: {item.cryptoDetails?.network?.toUpperCase() || "N/A"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-900">🔴 Sell USDT History</h2>
            {sellHistory.length === 0 && renderEmpty("No sell history found.")}
            {sellHistory.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {sellHistory.map((item) => (
                  <div
                    key={item._id}
                    className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-base md:text-lg">{Number(item.amount).toFixed(2)} USDT</p>
                      <span className="text-xs uppercase px-2 py-1 rounded-full bg-gray-100 text-gray-600">{item.status}</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500">
                      Network: {item.network}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
      </div>
    </div>
  );
}
