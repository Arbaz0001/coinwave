import React, { useMemo, useState, useEffect } from "react";
import { Copy, Share2, Users, Gift, Calendar } from "lucide-react";
import axios from "axios";
import { API_CONFIG } from "../config/api.config";

export default function Invite() {
  const user = JSON.parse(localStorage.getItem("cw_user"));
  const accessToken = localStorage.getItem("accessToken") || localStorage.getItem("user_token");
  const referralLink = useMemo(() => {
    if (!user?.ref_id) return "";
    const origin = window.location.origin;
    return `${origin}/signup?ref=${user.ref_id}`;
  }, [user?.ref_id]);

  // Stats states
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalRewards: 0,
  });

  // Referral history
  const [history, setHistory] = useState([]);

  // Example API call for stats & history
  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const response = await axios.get(`${API_CONFIG.API_BASE}/v1/referral/stats`, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });

        if (response.data.success) {
          setStats({
            totalReferrals: response.data.data.totalReferrals,
            totalRewards: response.data.data.totalRewards,
          });
          setHistory(response.data.data.history || []);
        }
      } catch (error) {
        console.error("Error fetching referral data:", error);
      }
    };

    if (accessToken) {
      fetchReferralData();
    }
  }, [accessToken]);

  // Copy to clipboard
  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied!");
  };

  // Share on WhatsApp
  const shareOnWhatsApp = () => {
    const message = `🚀 Join me on CryptoExchange and earn rewards! Sign up using my referral link: ${referralLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl w-full">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-center">🎉 Invite & Earn</h1>
      <p className="mb-6 md:mb-8 text-gray-600 text-center text-sm md:text-base">
        Share your referral link with friends and earn rewards when they join!
      </p>

      {/* Referral box */}
      <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl shadow-md p-4 md:p-6 w-full flex flex-col sm:flex-row items-center gap-3 mb-6">
        <input
          type="text"
          readOnly
          value={referralLink || ""}
          className="border-2 border-blue-300 rounded-lg p-3 flex-1 text-sm md:text-base bg-white w-full sm:w-auto"
        />
        <button
          onClick={copyLink}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold w-full sm:w-auto justify-center"
        >
          <Copy size={18} className="md:w-5 md:h-5" /> Copy
        </button>
      </div>

      {/* WhatsApp Button */}
      <button
        onClick={shareOnWhatsApp}
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all w-full text-base md:text-lg"
      >
        <Share2 size={20} className="md:w-6 md:h-6" /> Share on WhatsApp
      </button>

      {/* Referral Stats */}
      <div className="mt-8 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 md:p-6 flex flex-col items-center text-white">
          <Users className="w-10 h-10 md:w-12 md:h-12 mb-3 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold">{stats.totalReferrals}</p>
          <p className="text-sm md:text-base text-blue-100">Friends Joined</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 md:p-6 flex flex-col items-center text-white">
          <Gift className="w-10 h-10 md:w-12 md:h-12 mb-3 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold">₹ {stats.totalRewards}</p>
          <p className="text-sm md:text-base text-green-100">Rewards Earned</p>
        </div>
      </div>

      {/* Referral History */}
      <div className="mt-8 md:mt-10 w-full">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">📜 Referral History</h2>
        {history.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center">
            <p className="text-sm md:text-base text-gray-500">
              No referrals yet. Share your link to start earning!
            </p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border rounded-xl shadow-sm p-4 md:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="font-semibold text-base md:text-lg">{item.friendName}</p>
                  <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar size={14} className="md:w-4 md:h-4" /> {new Date(item.joinedAt).toDateString()}
                  </p>
                </div>
                <span className="text-sm md:text-base font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  +₹ {item.reward}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
