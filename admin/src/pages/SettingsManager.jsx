// ✅ Transaction Settings Manager
// Purpose: Admin can configure minimum/maximum amounts for deposits, withdrawals, and USDT transactions
// Features: Real-time validation, bulk update, automatic initialization with defaults
import React, { useState, useEffect } from "react";
import { Save, Loader, RefreshCw, AlertCircle } from "lucide-react";
import axios from "axios";
import { API_CONFIG } from "../config/api.config";

const SettingsManager = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editedValues, setEditedValues] = useState({});
  const [initialized, setInitialized] = useState(false);

  const API_BASE_URL = API_CONFIG.BASE_URL;

  const getAdminToken = () => {
    const candidates = [
      localStorage.getItem("admin_token"),
      localStorage.getItem("cw_admin_token"),
      localStorage.getItem("adminToken"),
      localStorage.getItem("authToken"),
      localStorage.getItem("token"),
    ];

    try {
      const rawAdminAuth = localStorage.getItem("adminAuth");
      if (rawAdminAuth) {
        const parsed = JSON.parse(rawAdminAuth);
        if (parsed?.accessToken) {
          candidates.unshift(parsed.accessToken);
        }
      }
    } catch {
      // ignore malformed adminAuth
    }

    const token = candidates.find(
      (candidate) =>
        typeof candidate === "string" &&
        candidate.trim() !== "" &&
        candidate !== "null" &&
        candidate !== "undefined"
    );

    return token || null;
  };

  const getAuthHeaders = () => {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const settingsConfig = [
    {
      key: "minDeposit",
      label: "Minimum Deposit Amount",
      description: "Minimum amount user must deposit (in INR)",
      unit: "₹",
    },
    {
      key: "maxDeposit",
      label: "Maximum Deposit Amount",
      description: "Maximum amount user can deposit (in INR)",
      unit: "₹",
    },
    {
      key: "minWithdrawl",
      label: "Minimum Withdrawal Amount",
      description: "Minimum amount user can withdraw (in INR)",
      unit: "₹",
    },
    {
      key: "maxWithdrawl",
      label: "Maximum Withdrawal Amount",
      description: "Maximum amount user can withdraw (in INR)",
      unit: "₹",
    },
    {
      key: "minBuyUSDT",
      label: "Minimum Buy USDT Amount",
      description: "Minimum USDT amount for purchase",
      unit: "USDT",
    },
    {
      key: "minSellUSDT",
      label: "Minimum Sell USDT Amount",
      description: "Minimum USDT amount for sale",
      unit: "USDT",
    },
    {
      key: "platformFeePercent",
      label: "Platform Fee Percentage",
      description: "Platform fee in percentage",
      unit: "%",
    },
  ];

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/settings/public/all`, {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setSettings(response.data.data);
        setEditedValues(response.data.data);
        setInitialized(true);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage({
        type: "error",
        text: "Failed to fetch settings. Trying to initialize...",
      });
      // Try to initialize
      initializeSettings();
    } finally {
      setLoading(false);
    }
  };

  const initializeSettings = async () => {
    try {
      const token = getAdminToken();
      if (!token) {
        setMessage({
          type: "error",
          text: "Admin authentication required. Please login again.",
        });
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/settings/admin/initialize`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "Settings initialized with default values",
        });
        fetchSettings();
      }
    } catch (error) {
      console.error("Error initializing settings:", error);
      setMessage({
        type: "error",
        text: "Failed to initialize settings",
      });
    }
  };

  const handleChange = (key, value) => {
    // Validate numeric input
    const numValue = Number.parseFloat(value);
    if (!Number.isNaN(numValue) || value === "") {
      setEditedValues({
        ...editedValues,
        [key]: value === "" ? "" : numValue,
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = getAdminToken();
      if (!token) {
        setMessage({
          type: "error",
          text: "Admin authentication required. Please login again.",
        });
        return;
      }

      // Convert to array format for bulk update
      const settingsArray = Object.entries(editedValues).map(([key, value]) => ({
        key,
        value: Number.parseFloat(value),
      }));

      const response = await axios.post(
        `${API_BASE_URL}/api/settings/admin/bulk-update`,
        { settings: settingsArray },
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.data.success) {
        setMessage({
          type: "success",
          text: `✅ ${response.data.data.length} settings updated successfully!`,
        });
        setSettings(editedValues);
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Failed to save settings",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(editedValues);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-white rounded-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">⚙️ Transaction Settings</h1>
        <button
          onClick={fetchSettings}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          title="Refresh settings"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <AlertCircle
            size={20}
            className={message.type === "success" ? "text-green-600" : "text-red-600"}
          />
          <p
            className={
              message.type === "success" ? "text-green-800" : "text-red-800"
            }
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Settings Form */}
      {!initialized ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Settings not initialized yet</p>
          <button
            onClick={initializeSettings}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Initialize Default Settings
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Deposit Settings Section */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-6 rounded">
            <h2 className="text-xl font-bold text-blue-900 mb-4">💰 Deposit Settings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {settingsConfig.slice(0, 2).map((config) => (
                <div key={config.key}>
                  <label className="block font-semibold text-gray-800 mb-2">
                    {config.label}
                  </label>
                  <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <span className="px-3 py-2 bg-gray-100 text-gray-700 font-semibold">
                      {config.unit}
                    </span>
                    <input
                      type="number"
                      value={editedValues[config.key] || ""}
                      onChange={(e) => handleChange(config.key, e.target.value)}
                      className="flex-1 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                      step="0.01"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Withdrawal Settings Section */}
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 sm:p-6 rounded">
            <h2 className="text-xl font-bold text-orange-900 mb-4">🏧 Withdrawal Settings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {settingsConfig.slice(2, 4).map((config) => (
                <div key={config.key}>
                  <label className="block font-semibold text-gray-800 mb-2">
                    {config.label}
                  </label>
                  <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <span className="px-3 py-2 bg-gray-100 text-gray-700 font-semibold">
                      {config.unit}
                    </span>
                    <input
                      type="number"
                      value={editedValues[config.key] || ""}
                      onChange={(e) => handleChange(config.key, e.target.value)}
                      className="flex-1 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                      step="0.01"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* USDT Trading Settings Section */}
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 sm:p-6 rounded">
            <h2 className="text-xl font-bold text-purple-900 mb-4">💱 USDT Trading Settings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {settingsConfig.slice(4, 6).map((config) => (
                <div key={config.key}>
                  <label className="block font-semibold text-gray-800 mb-2">
                    {config.label}
                  </label>
                  <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <span className="px-3 py-2 bg-gray-100 text-gray-700 font-semibold">
                      {config.unit}
                    </span>
                    <input
                      type="number"
                      value={editedValues[config.key] || ""}
                      onChange={(e) => handleChange(config.key, e.target.value)}
                      className="flex-1 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                      step="0.01"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Fee Section */}
          <div className="bg-green-50 border-l-4 border-green-500 p-4 sm:p-6 rounded">
            <h2 className="text-xl font-bold text-green-900 mb-4">📊 Platform Fee</h2>
            <div className="max-w-sm">
              {settingsConfig.slice(6, 7).map((config) => (
                <div key={config.key}>
                  <label className="block font-semibold text-gray-800 mb-2">
                    {config.label}
                  </label>
                  <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <span className="px-3 py-2 bg-gray-100 text-gray-700 font-semibold">
                      {config.unit}
                    </span>
                    <input
                      type="number"
                      value={editedValues[config.key] || ""}
                      onChange={(e) => handleChange(config.key, e.target.value)}
                      className="flex-1 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter percentage"
                      step="0.01"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition text-white ${
                hasChanges && !saving
                  ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed opacity-50"
              }`}
            >
              {saving ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save All Changes
                </>
              )}
            </button>

            {hasChanges && (
              <button
                onClick={() => setEditedValues(settings)}
                className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
              >
                Discard Changes
              </button>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>ℹ️ Note:</strong> These limits are enforced during deposit and withdrawal operations.
              Users cannot complete transactions outside these configured amounts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsManager;
