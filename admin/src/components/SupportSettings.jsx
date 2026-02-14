import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Mail, Phone, Send } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

const SupportSettings = () => {
  const { admin } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    telegram: "",
    whatsapp: "",
    businessName: "",
    description: "",
  });

  const API_BASE = import.meta.env.VITE_API_URL.replace(/\/$/, "") + "/api";

  const getAuthHeader = () => {
    const token = admin?.token || localStorage.getItem("admin_token");
    console.log("🔍 Auth token in SupportSettings:", token ? "✅ Present" : "❌ Missing");
    
    if (!token) {
      console.error("❌ No authentication token found");
    }
    
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // ✅ Load support contact data
  useEffect(() => {
    const fetchSupportContact = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/support/contact`);
        if (res.data.success) {
          setFormData(res.data.data);
        }
      } catch (error) {
        console.error("❌ Error fetching support contact:", error);
        toast.error("Failed to load support settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSupportContact();
  }, []);

  // ✅ Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Submit form with full debugging
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🚀 SUPPORT SETTINGS UPDATE - REQUEST INITIATED");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // ✅ STEP 1: Validate required fields
    console.log("\n📋 STEP 1: VALIDATING REQUIRED FIELDS");
    console.log("────────────────────────────────────────────────");

    const requiredFields = ["email", "phone"];
    const validationErrors = [];

    requiredFields.forEach((field) => {
      const value = formData[field];
      const isDefined = value !== undefined;
      const isNotEmpty = value !== null && value !== "";

      console.log(`  ✓ ${field}:`);
      console.log(`    - Defined: ${isDefined ? "✅ Yes" : "❌ No"}`);
      console.log(`    - Value: "${value}"`);
      console.log(`    - Not Empty: ${isNotEmpty ? "✅ Yes" : "❌ No"}`);

      if (!isDefined || !isNotEmpty) {
        validationErrors.push(`${field} is required`);
        console.log(`    - Status: ❌ INVALID`);
      } else {
        console.log(`    - Status: ✅ VALID`);
      }
    });

    // ✅ STEP 2: Check for any undefined fields
    console.log("\n📊 STEP 2: CHECKING ALL FIELDS FOR UNDEFINED VALUES");
    console.log("────────────────────────────────────────────────");

    Object.entries(formData).forEach(([key, value]) => {
      if (value === undefined) {
        console.warn(`  ⚠️  ${key}: UNDEFINED - Will be sent as undefined`);
        validationErrors.push(`${key} is undefined`);
      } else if (value === null) {
        console.warn(`  ⚠️  ${key}: NULL - Will be sent as null`);
      } else if (value === "") {
        console.log(`  ℹ️  ${key}: EMPTY STRING - OK for optional field`);
      } else {
        console.log(`  ✅ ${key}: "${value}"`);
      }
    });

    // ✅ STEP 3: Handle validation errors
    if (validationErrors.length > 0) {
      console.log("\n❌ VALIDATION FAILED");
      console.log("────────────────────────────────────────────────");
      validationErrors.forEach((error, index) => {
        console.error(`  ${index + 1}. ${error}`);
      });
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

      const errorMessage = `Validation Error: ${validationErrors.join(", ")}`;
      toast.error(errorMessage);
      setSaving(false);
      return;
    }

    console.log("\n✅ ALL VALIDATION CHECKS PASSED");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    try {
      // ✅ STEP 4: Prepare headers with debugging
      console.log("\n🔐 STEP 3: PREPARING REQUEST HEADERS");
      console.log("────────────────────────────────────────────────");

      const headers = getAuthHeader();
      console.log(`  ✓ Authorization: Bearer ${headers.Authorization.substring(0, 30)}...`);
      console.log(`  ✓ Content-Type: ${headers["Content-Type"]}`);

      // ✅ STEP 5: Format and log payload
      console.log("\n📤 STEP 4: PAYLOAD PREPARED FOR TRANSMISSION");
      console.log("────────────────────────────────────────────────");

      // Only send the fields that should be updated, exclude internal fields
      const payload = {
        email: formData.email,
        phone: formData.phone,
        telegram: formData.telegram,
        whatsapp: formData.whatsapp,
        businessName: formData.businessName,
        description: formData.description,
      };
      console.log("📦 Formatted JSON Payload:");
      console.log(JSON.stringify(payload, null, 2));

      console.log("\n🌐 REQUEST DETAILS:");
      console.log(`  ✓ Method: PUT`);
      console.log(`  ✓ Endpoint: ${API_BASE}/support/contact/update`);
      console.log(`  ✓ Payload Size: ${JSON.stringify(payload).length} bytes`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // ✅ STEP 6: Send request
      console.log("\n⏳ STEP 5: SENDING REQUEST TO BACKEND...\n");

      const res = await axios.put(
        `${API_BASE}/support/contact/update`,
        payload,
        { headers }
      );

      // ✅ STEP 7: Log backend response
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ RESPONSE RECEIVED FROM BACKEND");
      console.log("────────────────────────────────────────────────");

      console.log("📊 Response Status:");
      console.log(`  ✓ Status Code: ${res.status} (${res.statusText})`);
      console.log(`  ✓ Success Flag: ${res.data.success ? "✅ Yes" : "❌ No"}`);

      console.log("\n📦 Response Data:");
      console.log(JSON.stringify(res.data, null, 2));

      if (res.data.success) {
        console.log("\n✅ UPDATE SUCCESSFUL");
        console.log("────────────────────────────────────────────────");
        console.log("  ✓ Settings updated successfully");

        if (res.data.data) {
          console.log("\n📋 Updated Data:");
          console.log(JSON.stringify(res.data.data, null, 2));
          setFormData(res.data.data);
        }

        toast.success("✅ Support settings updated successfully!");
      } else {
        console.log("\n⚠️  UPDATE INCOMPLETE");
        console.log("────────────────────────────────────────────────");
        console.error(`  Error: ${res.data.message || "Unknown error"}`);

        const errorMsg = res.data.message || "Failed to update settings";
        toast.error(errorMsg);
      }

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    } catch (error) {
      // ✅ STEP 8: Handle errors with detailed logging
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("❌ REQUEST FAILED - ERROR DETAILS");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      console.log("🔍 Error Type:");
      console.log(`  ✓ Name: ${error.name}`);
      console.log(`  ✓ Message: ${error.message}`);

      if (error.response) {
        // Backend responded with error status
        console.log("\n🔴 BACKEND ERROR (HTTP Error)");
        console.log("────────────────────────────────────────────────");

        console.log(`Status Code: ${error.response.status}`);
        console.log(`Status Text: ${error.response.statusText}`);

        console.log("\n📦 Error Response Body:");
        console.log(JSON.stringify(error.response.data, null, 2));

        if (error.response.data) {
          console.log("\n📋 Backend Error Details:");
          console.log(`  ✓ Success: ${error.response.data.success}`);
          console.log(`  ✓ Message: ${error.response.data.message || "No message"}`);
          console.log(`  ✓ Error: ${error.response.data.error || "No error details"}`);

          if (error.response.data.errors) {
            console.log("  ✓ Validation Errors:");
            Object.entries(error.response.data.errors).forEach(([key, value]) => {
              console.log(`    - ${key}: ${value}`);
            });
          }
        }

        console.log("\nRequest Headers Sent:");
        console.log(JSON.stringify(error.config.headers, null, 2));

        console.log("\nRequest Payload Sent:");
        console.log(JSON.stringify(error.config.data, null, 2));
      } else if (error.request) {
        // Request made but no response
        console.log("\n🟡 NO RESPONSE FROM BACKEND");
        console.log("────────────────────────────────────────────────");
        console.error("  ✗ Request made but no response received");
        console.error("  ✗ Possible causes:");
        console.error("    - Server is down");
        console.error("    - Network connection lost");
        console.error("    - CORS issue");
        console.log("\nRequest Details:");
        console.log(`  URL: ${error.config.url}`);
        console.log(`  Method: ${error.config.method}`);
      } else {
        // Error during request setup
        console.log("\n🟠 ERROR DURING REQUEST SETUP");
        console.log("────────────────────────────────────────────────");
        console.error("  ✗ Error during request configuration");
        console.error(`  ✗ Details: ${error.message}`);
      }

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // ✅ STEP 9: Display user-friendly error message
      const errorMessage =
        error.response?.data?.message ||
        error.response?.statusText ||
        (error.request ? "No response from server" : error.message) ||
        "Failed to save settings";

      console.log(`\n📢 DISPLAYING ERROR TO USER: "${errorMessage}"\n`);

      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4 py-8">
        <p className="text-center text-gray-400">Loading support settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📞 Support Settings</h1>
          <p className="text-gray-400">
            Manage contact information that users see in help & support section
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 rounded-xl shadow-lg p-8 space-y-6 border border-gray-700"
        >
          {/* Business Info */}
          <div className="space-y-4 pb-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-blue-400">Business Info</h2>

            <div>
              <label className="block text-sm font-medium mb-2">
                Business Name
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                placeholder="e.g., CoinWave247"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                placeholder="Brief description of your service..."
                rows="3"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 pb-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-green-400">Contact Info</h2>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Mail size={16} /> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                placeholder="support@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Phone size={16} /> Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                placeholder="+91-1234567890"
                required
              />
            </div>
          </div>

          {/* Social & Messaging */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-purple-400">
              Social & Messaging
            </h2>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Send size={16} /> Telegram Link
              </label>
              <input
                type="url"
                name="telegram"
                value={formData.telegram}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                placeholder="https://t.me/yourhandle"
              />
              <p className="text-xs text-gray-400 mt-1">
                Format: https://t.me/yourhandle
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Send size={16} /> WhatsApp Link
              </label>
              <input
                type="url"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                placeholder="https://wa.me/911234567890"
              />
              <p className="text-xs text-gray-400 mt-1">
                Format: https://wa.me/countrycodephone (without +)
              </p>
            </div>
          </div>

          {/* Preview Box */}
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <p className="text-sm font-semibold text-gray-300 mb-3">
              📱 User Preview:
            </p>
            <div className="text-sm space-y-2">
              <p>
                <span className="text-gray-400">Business:</span>{" "}
                <span className="text-white font-medium">
                  {formData.businessName}
                </span>
              </p>
              <p>
                <span className="text-gray-400">Email:</span>{" "}
                <span className="text-blue-300">{formData.email}</span>
              </p>
              <p>
                <span className="text-gray-400">Phone:</span>{" "}
                <span className="text-blue-300">{formData.phone}</span>
              </p>
              <p>
                <span className="text-gray-400">Telegram:</span>{" "}
                <span className="text-purple-300 truncate">
                  {formData.telegram}
                </span>
              </p>
              <p>
                <span className="text-gray-400">WhatsApp:</span>{" "}
                <span className="text-green-300 truncate">
                  {formData.whatsapp}
                </span>
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition"
            >
              {saving ? "Saving..." : "💾 Save Settings"}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4 text-sm text-blue-200">
          <p>
            <strong>ℹ️ Note:</strong> These settings will be visible to all
            users in the Help & Support section of the app.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportSettings;
