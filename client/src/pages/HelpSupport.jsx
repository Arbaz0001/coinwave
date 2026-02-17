// ✅ Help & Support page - Displays contact information for users to reach support
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Mail,
  Phone,
  Send,
  MessageCircle,
  Copy,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { API_CONFIG } from "../config/api.config";

const HelpSupport = () => {
  const [supportData, setSupportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  const API_BASE = API_CONFIG.API_BASE;

  // ✅ Load support contact on mount
  useEffect(() => {
    const fetchSupportContact = async () => {
      try {
        const res = await axios.get(`${API_BASE}/support/contact`);
        if (res.data.success) {
          setSupportData(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching support:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupportContact();
  }, []);

  // ✅ Copy to clipboard
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // ✅ Open link
  const openLink = (url) => {
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      window.open(url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4 py-8">
        <p className="text-center text-gray-400">Loading support information...</p>
      </div>
    );
  }

  if (!supportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4 py-8">
        <p className="text-center text-gray-400">Support information unavailable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4 md:px-6 py-6 md:py-8 lg:py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">🆘 Help & Support</h1>
          <p className="text-gray-400 text-base md:text-lg">
            {supportData.description || "We're here to help. Contact us anytime."}
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
          {/* Email Card */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-5 md:p-6 border border-blue-700 shadow-lg hover:shadow-2xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500 p-3 rounded-full">
                <Mail size={20} className="text-white md:w-6 md:h-6" />
              </div>
              <h2 className="text-lg md:text-xl font-bold">Email</h2>
            </div>
            <p className="text-blue-100 mb-4 text-sm md:text-base break-all">{supportData.email}</p>
            <button
              onClick={() => handleCopy(supportData.email, "email")}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2 md:py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-sm md:text-base duration-200"
            >
              {copied === "email" ? (
                <>
                  <CheckCircle size={18} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={18} /> Copy Email
                </>
              )}
            </button>
          </div>

          {/* Phone Card */}
          <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-5 md:p-6 border border-green-700 shadow-lg hover:shadow-2xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500 p-3 rounded-full">
                <Phone size={20} className="text-white md:w-6 md:h-6" />
              </div>
              <h2 className="text-lg md:text-xl font-bold">Phone</h2>
            </div>
            <p className="text-green-100 mb-4 text-sm md:text-base break-all">{supportData.phone}</p>
            <button
              onClick={() => handleCopy(supportData.phone, "phone")}
              className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-2 md:py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-sm md:text-base duration-200"
            >
              {copied === "phone" ? (
                <>
                  <CheckCircle size={18} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={18} /> Copy Number
                </>
              )}
            </button>
          </div>

          {/* Telegram Card */}
          {supportData.telegram && (
            <div className="bg-gradient-to-br from-cyan-900 to-cyan-800 rounded-xl p-5 md:p-6 border border-cyan-700 shadow-lg hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-cyan-500 p-3 rounded-full">
                  <Send size={20} className="text-white md:w-6 md:h-6" />
                </div>
                <h2 className="text-lg md:text-xl font-bold">Telegram</h2>
              </div>
              <p className="text-cyan-100 mb-4 break-all text-sm md:text-base">
                {supportData.telegram}
              </p>
              <button
                onClick={() => openLink(supportData.telegram)}
                className="w-full bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white py-2 md:py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-sm md:text-base duration-200"
              >
                <Send size={18} /> Chat on Telegram
              </button>
            </div>
          )}

          {/* WhatsApp Card */}
          {supportData.whatsapp && (
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-xl p-5 md:p-6 border border-emerald-700 shadow-lg hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-500 p-3 rounded-full">
                  <MessageCircle size={20} className="text-white md:w-6 md:h-6" />
                </div>
                <h2 className="text-lg md:text-xl font-bold">WhatsApp</h2>
              </div>
              <p className="text-emerald-100 mb-4 break-all text-sm md:text-base">
                {supportData.whatsapp}
              </p>
              <button
                onClick={() => openLink(supportData.whatsapp)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-2 md:py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-sm md:text-base duration-200"
              >
                <MessageCircle size={18} /> Chat on WhatsApp
              </button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-gray-800 rounded-xl p-5 md:p-6 border border-gray-700">
          <h3 className="text-lg md:text-xl font-bold mb-4 text-purple-400">
            📋 How We Can Help
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1 flex-shrink-0">✓</span>
              <span className="text-sm md:text-base">Account & Login Issues</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1 flex-shrink-0">✓</span>
              <span className="text-sm md:text-base">Deposit & Withdrawal Assistance</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1 flex-shrink-0">✓</span>
              <span className="text-sm md:text-base">Payment Verification Help</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1 flex-shrink-0">✓</span>
              <span className="text-sm md:text-base">Transaction Issues</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1 flex-shrink-0">✓</span>
              <span className="text-sm md:text-base">General Inquiries & Support</span>
            </li>
          </ul>
        </div>

        {/* Response Time Info */}
        <div className="mt-6 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4 text-xs md:text-sm text-blue-200 text-center">
          <p>
            <strong>⏱️ Response Time:</strong> We typically respond within 24-48
            hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
