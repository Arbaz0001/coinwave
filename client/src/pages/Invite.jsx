import React, { useState, useEffect } from "react";
import { Copy, Share2, Users, Gift, Calendar } from "lucide-react";
import axios from "axios";

export default function Invite() {
  const referralLink = "https://cryptoexchange.com/referral/12345";

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
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/v1/referral/stats`,
          {
            headers: {
              Authorization: localStorage.getItem("accessToken"),
            },
          }
        );

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

    fetchReferralData();
  }, []);

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
    <div className="p-6 min-h-screen flex flex-col items-center bg-white text-gray-900">
      <h1 className="text-2xl font-bold mb-2">Invite & Earn 🎉</h1>
      <p className="mb-6 text-gray-600 text-center text-sm">
        Share your referral link with friends and earn rewards when they join!
      </p>

      {/* Referral box */}
      <div className="bg-gray-100 rounded-lg shadow-sm p-4 w-full max-w-md flex items-center justify-between">
        <input
          type="text"
          readOnly
          value={referralLink}
          className="border rounded p-2 flex-1 mr-2 text-sm bg-white"
        />
        <button
          onClick={copyLink}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
        >
          <Copy size={16} /> Copy
        </button>
      </div>

      {/* WhatsApp Button */}
      <button
        onClick={shareOnWhatsApp}
        className="mt-6 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition w-full max-w-md"
      >
        <Share2 size={18} /> Share on WhatsApp
      </button>

      {/* Referral Stats */}
      <div className="mt-8 w-full max-w-md grid grid-cols-2 gap-4">
        <div className="bg-gray-100 rounded-lg shadow-sm p-4 flex flex-col items-center">
          <Users className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-lg font-bold">{stats.totalReferrals}</p>
          <p className="text-sm text-gray-600">Friends Joined</p>
        </div>
        <div className="bg-gray-100 rounded-lg shadow-sm p-4 flex flex-col items-center">
          <Gift className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-lg font-bold">₹ {stats.totalRewards}</p>
          <p className="text-sm text-gray-600">Rewards Earned</p>
        </div>
      </div>

      {/* Referral History */}
      <div className="mt-10 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-3">Referral History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">
            No referrals yet. Share your link to start earning!
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50 border rounded-lg shadow-sm p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{item.friendName}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={12} /> {new Date(item.joinedAt).toDateString()}
                  </p>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  +₹ {item.reward}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
