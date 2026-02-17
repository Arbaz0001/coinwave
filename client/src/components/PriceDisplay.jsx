import React, { useState, useEffect } from "react";
import { TrendingUp, Gift } from "lucide-react";
import * as exchangeRateService from "../services/exchangeRateService";

/**
 * Price Display Component
 * Shows Binance price, Wazirax price, and INR bonus on home page
 */
const PriceDisplay = () => {
  const [rates, setRates] = useState({
    binancePrice: 0,
    waziraxPrice: 0,
    inrBonus: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const response = await exchangeRateService.getExchangeRates();
      if (response.success) {
        setRates({
          binancePrice: response.data.binancePrice,
          waziraxPrice: response.data.waziraxPrice,
          inrBonus: response.data.inrBonus,
        });
      }
    } catch (error) {
      console.error("Error fetching rates:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📊 USDT Prices & Bonus</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Binance Price */}
        <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-yellow-800">Binance Price</span>
            <TrendingUp size={18} className="text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-700">₹{rates.binancePrice.toFixed(2)}</p>
          <p className="text-xs text-yellow-600 mt-1">Live USDT/INR Rate</p>
        </div>

        {/* Wazirax Price */}
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-blue-800">Wazirax Price</span>
            <TrendingUp size={18} className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-700">₹{rates.waziraxPrice.toFixed(2)}</p>
          <p className="text-xs text-blue-600 mt-1">Alternative Exchange Rate</p>
        </div>

        {/* INR Bonus */}
        <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-green-800">INR Bonus</span>
            <Gift size={18} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-700">₹{rates.inrBonus.toFixed(2)}</p>
          <p className="text-xs text-green-600 mt-1">Platform Reward</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> Our platform offers competitive USDT rates. Check both Binance and Wazirax prices and trade at the best rate!
        </p>
      </div>
    </div>
  );
};

export default PriceDisplay;
