import React, { useState } from "react";
import { Gift, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { claimBonus } from "../services/bonusService";
import { useAuth } from "../context/AuthContext";

export default function BonusCard() {
  const { user } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const handleClaimBonus = async () => {
    if (!user?._id) {
      toast.error("❌ Please log in to claim bonus");
      return;
    }

    setClaiming(true);
    try {
      const response = await claimBonus(user._id);
      
      if (response.success) {
        setClaimed(true);
        toast.success(`✅ ${response.data.message}`);
        // Optional: Update user balance in context
        setTimeout(() => {
          window.location.reload(); // Refresh to show updated balance
        }, 1500);
      } else {
        toast.error(`❌ ${response.error}`);
      }
    } catch (error) {
      toast.error("❌ Failed to claim bonus");
      console.error(error);
    } finally {
      setClaiming(false);
    }
  };

  if (!user) {
    return null; // Don't show bonus card if not logged in
  }

  return (
    <div className="mt-6 mb-6">
      <div className="p-4 md:p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-300 rounded-xl shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="text-orange-600" size={28} />
              <h3 className="font-bold text-gray-800 text-lg md:text-xl">
                🎁 Claim Your Bonus!
              </h3>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Get free INR credit to start trading! Platform bonus is waiting for you.
            </p>
            <p className="text-xs text-gray-600">
              Click the button below to add bonus amount to your wallet balance.
            </p>
          </div>

          {!claimed ? (
            <button
              onClick={handleClaimBonus}
              disabled={claiming}
              className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all text-sm md:text-base whitespace-nowrap"
            >
              {claiming ? "Claiming..." : "Claim Now"}
            </button>
          ) : (
            <div className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-green-100 border-2 border-green-400 text-green-700 font-bold rounded-lg">
              <CheckCircle size={20} />
              <span className="text-sm md:text-base">Claimed!</span>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-white/60 border border-orange-200 rounded-lg">
          <p className="text-xs text-gray-700">
            <strong>💡 Tip:</strong> Bonus is added once per account. Use it to buy USDT, trade, or explore the platform features!
          </p>
        </div>
      </div>
    </div>
  );
}
