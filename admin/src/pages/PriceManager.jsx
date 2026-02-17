import React, { useState, useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";
import axios from "axios";
import { API_CONFIG } from "../config/api.config";

const PriceManager = () => {
  const [rates, setRates] = useState({
    binancePrice: 0,
    waziraxPrice: 0,
    platformPrice: 0,
    inrBonusPercent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const API_BASE_URL = API_CONFIG.BASE_URL;

  // Fetch rates on mount
  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/exchange-rates/rates`);
      if (response.data.success) {
        setRates({
          binancePrice: response.data.data.binancePrice,
          waziraxPrice: response.data.data.waziraxPrice,
          platformPrice: response.data.data.platformPrice || 0,
          inrBonusPercent: response.data.data.inrBonusPercent || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching rates:", error);
      setMessage({ type: "error", text: "Failed to fetch rates" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    setRates((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/exchange-rates/rates/admin/update`,
        {
          binancePrice: parseFloat(rates.binancePrice),
          waziraxPrice: parseFloat(rates.waziraxPrice),
          platformPrice: parseFloat(rates.platformPrice),
          inrBonusPercent: parseFloat(rates.inrBonusPercent),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken") || localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setMessage({ type: "success", text: "✅ Prices updated successfully!" });
        setRates({
          binancePrice: response.data.data.binancePrice,
          waziraxPrice: response.data.data.waziraxPrice,
          platformPrice: response.data.data.platformPrice || 0,
          inrBonusPercent: response.data.data.inrBonusPercent || 0,
        });
      }
    } catch (error) {
      console.error("Error saving rates:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to update prices",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading prices...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">💱 Exchange Rates & Bonus</h1>
          <button
            onClick={fetchRates}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Price Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Binance Price */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📊 Binance USDT Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={rates.binancePrice}
              onChange={(e) => handleChange("binancePrice", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter Binance price"
            />
            <p className="text-xs text-gray-500 mt-2">Binance USDT/INR exchange rate</p>
          </div>

          {/* Wazirax Price */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📈 Wazirax USDT Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={rates.waziraxPrice}
              onChange={(e) => handleChange("waziraxPrice", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Wazirax price"
            />
            <p className="text-xs text-gray-500 mt-2">Wazirax USDT/INR exchange rate</p>
          </div>

          {/* Platform Price */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              💎 Platform Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={rates.platformPrice}
              onChange={(e) => handleChange("platformPrice", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter platform price"
            />
            <p className="text-xs text-gray-500 mt-2">Admin-controlled platform rate</p>
          </div>

          {/* INR Bonus Percentage */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎁 INR Bonus (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={rates.inrBonusPercent}
              onChange={(e) => handleChange("inrBonusPercent", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter bonus percentage (0-100)"
            />
            <p className="text-xs text-gray-500 mt-2">Percentage bonus on deposits (e.g., 5 = 5%)</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-blue-900 mb-3">ℹ️ How it Works:</h2>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• <strong>Binance Price:</strong> Reference exchange rate</li>
            <li>• <strong>Wazirax Price:</strong> Alternative exchange rate</li>
            <li>• <strong>Platform Price:</strong> Admin-set price used for all transactions</li>
            <li>• <strong>INR Bonus:</strong> Percentage bonus added on deposits (e.g., 5% bonus on ₹1000 = ₹50 extra)</li>
            <li>• Bonus only applies to regular INR deposits, not USDT buy/sell</li>
          </ul>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold text-lg"
          >
            <Save size={20} /> {saving ? "Saving..." : "Save All Prices"}
          </button>
        </div>

        {/* Currently Displayed Prices */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Current Prices</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 rounded p-4">
              <p className="text-sm text-gray-600">Binance</p>
              <p className="text-2xl font-bold text-yellow-600">₹{rates.binancePrice.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 rounded p-4">
              <p className="text-sm text-gray-600">Wazirax</p>
              <p className="text-2xl font-bold text-blue-600">₹{rates.waziraxPrice.toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 rounded p-4">
              <p className="text-sm text-gray-600">Platform</p>
              <p className="text-2xl font-bold text-purple-600">₹{rates.platformPrice.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 rounded p-4">
              <p className="text-sm text-gray-600">Bonus</p>
              <p className="text-2xl font-bold text-green-600">{rates.inrBonusPercent.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceManager;
