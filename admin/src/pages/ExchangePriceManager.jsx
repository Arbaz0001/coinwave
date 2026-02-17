// ✅ Exchange Price Manager
// Purpose: Admin can set and manage USDT prices for Binance, Wazirx, and INR bonus percentage
// Features: Real-time update, validation, separate pricing per exchange, percentage-based bonus

import React, { useState, useEffect } from "react";
import { Save, Loader, RefreshCw, AlertCircle, TrendingUp } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_CONFIG } from "../config/api.config";

const API_BASE = API_CONFIG.API_BASE;

export default function ExchangePriceManager() {
  const [prices, setPrices] = useState({
    binancePrice: 0,
    waziraxPrice: 0,
    platformPrice: 0,
    inrBonusPercent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editValues, setEditValues] = useState({...prices});
  const [lastUpdated, setLastUpdated] = useState(null);

  // 🔹 Get admin token from multiple possible keys
  const getToken = () => {
    const token = 
      localStorage.getItem("cw_admin_token") || 
      localStorage.getItem("admin_token") ||
      localStorage.getItem("adminToken") || 
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      (function() {
        try {
          const auth = JSON.parse(localStorage.getItem("adminAuth") || "{}");
          return auth?.accessToken || null;
        } catch {
          return null;
        }
      })();
    
    console.log("🔑 Token retrieved:", token ? "✅ Found" : "❌ Not found");
    return token;
  };

  const token = getToken();

  // 🔹 Fetch current prices
  const fetchPrices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/exchange-rates/rates`);

      if (response.data.success) {
        setPrices(response.data.data);
        setEditValues(response.data.data);
        setLastUpdated(response.data.data.lastUpdated);
      }
    } catch (error) {
      console.error("❌ Failed to fetch prices:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  // 🔹 Handle input changes
  const handleChange = (field, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) || value === "") {
      setEditValues({
        ...editValues,
        [field]: value === "" ? "" : numValue,
      });
    }
  };

  // 🔹 Save prices to backend
  const handleSave = async () => {
    if (!token) {
      toast.error("❌ Admin authentication required. Please login again.");
      return;
    }

    // Validate all fields are filled
    if (
      editValues.binancePrice === "" ||
      editValues.binancePrice == null ||
      editValues.waziraxPrice === "" ||
      editValues.waziraxPrice == null ||
      editValues.platformPrice === "" ||
      editValues.platformPrice == null ||
      editValues.inrBonusPercent === "" ||
      editValues.inrBonusPercent == null
    ) {
      toast.warning("⚠️ Please fill all fields");
      return;
    }

    // Validate prices are positive
    if (editValues.binancePrice <= 0 || editValues.waziraxPrice <= 0 || editValues.platformPrice <= 0) {
      toast.warning("⚠️ Prices must be greater than 0");
      return;
    }

    // Validate bonus percent is between 0-100
    if (editValues.inrBonusPercent < 0 || editValues.inrBonusPercent > 100) {
      toast.warning("⚠️ Bonus percentage must be between 0 and 100");
      return;
    }

    setSaving(true);
    try {
      console.log("📤 Sending exchange rates update...");
      console.log("Token exists:", !!token);
      console.log("Request data:", {
        binancePrice: parseFloat(editValues.binancePrice),
        waziraxPrice: parseFloat(editValues.waziraxPrice),
        platformPrice: parseFloat(editValues.platformPrice),
        inrBonusPercent: parseFloat(editValues.inrBonusPercent),
      });

      const response = await axios.put(
        `${API_BASE}/exchange-rates/rates/admin/update`,
        {
          binancePrice: parseFloat(editValues.binancePrice),
          waziraxPrice: parseFloat(editValues.waziraxPrice),
          platformPrice: parseFloat(editValues.platformPrice),
          inrBonusPercent: parseFloat(editValues.inrBonusPercent),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setPrices(response.data.data);
        setEditValues(response.data.data);
        setLastUpdated(response.data.data.lastUpdated);
        toast.success("✅ Exchange prices updated successfully!");
      }
    } catch (error) {
      console.error("❌ Error saving prices:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.details || error.response?.data?.error || "Failed to save prices";
      console.error("Detailed error:", errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Reset to last saved values
  const handleReset = () => {
    setEditValues({ ...prices });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading exchange prices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">💱 Exchange Prices & Bonus</h1>
          <p className="text-gray-600">Manage USDT prices for different exchanges and INR bonus</p>
        </div>

        {/* Last Updated Info */}
        {lastUpdated && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="text-blue-600" />
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Last updated:</span> {new Date(lastUpdated).toLocaleString()}
            </p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 space-y-8">
          
          {/* Binance Price Section */}
          <div className="border-b pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <TrendingUp size={24} className="text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Binance USDT Price</h2>
                <p className="text-sm text-gray-600">Set the USDT price for Binance exchange</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price (in INR) *</label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-yellow-600">₹</span>
                <input
                  type="number"
                  value={editValues.binancePrice}
                  onChange={(e) => handleChange("binancePrice", e.target.value)}
                  placeholder="e.g., 87450.50"
                  step="0.01"
                  min="0"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-lg font-medium"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">Current: ₹ {prices.binancePrice?.toLocaleString()}</p>
            </div>
          </div>

          {/* Wazirx Price Section */}
          <div className="border-b pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">WazirX USDT Price</h2>
                <p className="text-sm text-gray-600">Set the USDT price for WazirX exchange</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price (in INR) *</label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-blue-600">₹</span>
                <input
                  type="number"
                  value={editValues.waziraxPrice}
                  onChange={(e) => handleChange("waziraxPrice", e.target.value)}
                  placeholder="e.g., 88920.00"
                  step="0.01"
                  min="0"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">Current: ₹ {prices.waziraxPrice?.toLocaleString()}</p>
            </div>
          </div>

          {/* INR Bonus Percentage Section */}
          <div className="border-b pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">INR Bonus Percentage</h2>
                <p className="text-sm text-gray-600">Percentage bonus on each deposit/buy (e.g., 5% = ₹50 on ₹1000)</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bonus Percentage (%) *</label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-green-600">%</span>
                <input
                  type="number"
                  value={editValues.inrBonusPercent}
                  onChange={(e) => handleChange("inrBonusPercent", e.target.value)}
                  placeholder="e.g., 5"
                  step="0.01"
                  min="0"
                  max="100"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg font-medium"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">Current: {prices.inrBonusPercent}%</p>
              <p className="mt-3 text-sm bg-green-50 border border-green-200 rounded-lg p-2 text-green-800">
                💡 Example: If set to 5%, user depositing ₹1000 gets ₹50 bonus added to wallet
              </p>
            </div>
          </div>

          {/* Platform Price Section */}
          <div className="border-b pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp size={24} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Platform USDT Price</h2>
                <p className="text-sm text-gray-600">Set fixed platform price shown to users (manual admin control)</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Platform Price (in INR) *</label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-purple-600">₹</span>
                <input
                  type="number"
                  value={editValues.platformPrice}
                  onChange={(e) => handleChange("platformPrice", e.target.value)}
                  placeholder="e.g., 88.40"
                  step="0.01"
                  min="0"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-medium"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">Current: ₹ {prices.platformPrice?.toLocaleString()}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              onClick={handleReset}
              disabled={saving || loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
            >
              <RefreshCw size={18} />
              Reset
            </button>
            <button
              onClick={fetchPrices}
              disabled={saving || loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
            >
              <RefreshCw size={18} />
              Reload
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 shadow-lg"
            >
              {saving ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6">
          <h3 className="font-semibold text-blue-900 mb-3">ℹ️ How it works</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ Set separate USDT prices for Binance and WazirX exchanges</li>
            <li>✓ Set fixed platform USDT price manually (no auto-calculation)</li>
            <li>✓ INR bonus is a percentage added to user wallets on deposits/purchases</li>
            <li>✓ Example: 5% bonus on ₹1000 deposit = ₹50 added to wallet</li>
            <li>✓ All prices visible to users on the Exchange page</li>
            <li>✓ Buy/Sell flows use admin-defined price settings</li>
            <li>✓ Bonus calculated dynamically: deposit_amount × (bonus_percent / 100)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
