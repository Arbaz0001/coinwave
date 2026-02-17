// ✅ Exchange / Platform Price Page
// Purpose: Display USDT prices from different exchanges and platform pricing
// Features: Real-time price updates from API, INR bonus display, Buy/Sell navigation

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_CONFIG } from "../config/api.config";
import hero2 from "../assets/hero2.png";

const API_BASE = API_CONFIG.API_BASE;

export default function Exchange() {
  const [platformPrice, setPlatformPrice] = useState(110.4);
  const [binancePrice, setBinancePrice] = useState(null);
  const [wazirxPrice, setWazirxPrice] = useState(null);
  const [inrBonusPercent, setInrBonusPercent] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch exchange rates from API
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/exchange-rates/rates`);
        
        if (response.data.success) {
          const { binancePrice, waziraxPrice, platformPrice, inrBonusPercent } = response.data.data;
          
          setBinancePrice(binancePrice);
          setWazirxPrice(waziraxPrice);
          setPlatformPrice(Number(platformPrice || 0));
          setInrBonusPercent(inrBonusPercent || 0);
        }
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error.message);
        // Fallback to dummy values if API fails
        setBinancePrice(0);
        setWazirxPrice(0);
        setPlatformPrice(0);
        setInrBonusPercent(0);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
    
    // Refresh prices every 30 seconds from admin-defined values
    const interval = setInterval(fetchExchangeRates, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 max-w-5xl mx-auto">
      {/* Hero Image */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <img src={hero2} alt="Hero" className="w-full object-cover h-40 sm:h-52 md:h-64 lg:h-80" />
      </div>

      {/* Platform Price */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center">
        <h2 className="text-base md:text-lg text-gray-500">Platform price</h2>
        <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600">{platformPrice.toFixed(2)}</p>
        <p className="text-xs md:text-sm text-gray-400">Admin defined platform price</p>

        <div className="mt-4 md:mt-6 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl p-3 md:p-4">
          <div className="grid grid-cols-2 gap-2 md:gap-3 text-sm font-medium text-center">
            <div className="bg-white p-2 md:p-3 rounded-lg shadow-sm">
              <p className="text-gray-500 text-xs md:text-sm">Exchange($)</p>
              <p className="text-sm md:text-base">-123.41</p>
            </div>
            <div className="bg-white p-2 md:p-3 rounded-lg shadow-sm">
              <p className="text-gray-500 text-xs md:text-sm">Price(₹)</p>
              <p className="text-blue-600 text-sm md:text-base">{platformPrice.toFixed(2)}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-blue-500 underline cursor-pointer">
            What is tiered price policy?
          </p>
        </div>
      </div>

      {/* Deposit / Withdraw / Invite */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 text-center">
        <Link to="/deposit" className="bg-gray-100 py-3 md:py-4 rounded-xl font-medium text-sm md:text-base hover:bg-gray-200 transition">
          Deposit
        </Link>
        <Link to="/withdraw" className="bg-gray-100 py-3 md:py-4 rounded-xl font-medium text-sm md:text-base hover:bg-gray-200 transition">
          Withdraw
        </Link>
        <Link to="/invite" className="bg-gray-100 py-3 md:py-4 rounded-xl font-medium text-sm md:text-base hover:bg-gray-200 transition">
          Invite
        </Link>
      </div>

      {/* Buy / Sell Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <Link
          to="/buy"
          className="flex-1 text-center bg-green-600 text-white py-3 md:py-4 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl text-base md:text-lg"
        >
          🟢 Buy USDT
        </Link>
        <Link
          to="/sell"
          className="flex-1 text-center bg-red-600 text-white py-3 md:py-4 rounded-xl font-semibold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl text-base md:text-lg"
        >
          🔴 Sell USDT
        </Link>
      </div>

      {/* INR Bonus Box */}
      {inrBonusPercent > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 md:p-6 text-center">
          <h3 className="text-lg md:text-xl font-bold text-green-800 mb-2">🎁 Bonus Program</h3>
          <p className="text-3xl md:text-4xl font-bold text-green-600 mb-2">{inrBonusPercent}%</p>
          <p className="text-sm md:text-base text-green-700">
            Earn {inrBonusPercent}% bonus on every deposit! 💰 Example: ₹1000 deposit = ₹{(1000 * inrBonusPercent / 100).toLocaleString()} bonus
          </p>
        </div>
      )}

      {/* Exchange Prices Section */}
      <div>
        <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">💱 Exchange Prices</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {/* Binance Price */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-yellow-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🔴</span>
              <h4 className="font-bold text-yellow-700 text-lg">BINANCE</h4>
            </div>
            <p className="text-green-600 text-lg md:text-xl font-semibold">
              {loading ? "Loading..." : binancePrice ? `₹ ${binancePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : "N/A"}
            </p>
            <p className="text-xs text-gray-500 mt-2">USDT Price in INR</p>
          </div>

          {/* WazirX Price */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-blue-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🔵</span>
              <h4 className="font-bold text-blue-700 text-lg">WAZIRX</h4>
            </div>
            <p className="text-green-600 text-lg md:text-xl font-semibold">
              {loading ? "Loading..." : wazirxPrice ? `₹ ${wazirxPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : "N/A"}
            </p>
            <p className="text-xs text-gray-500 mt-2">USDT Price in INR</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center mt-3">
          Prices update every 30 sec
        </p>
      </div>

      {/* Platform Advantages */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 space-y-4 md:space-y-5">
        <div>
          <h5 className="font-semibold">💬 24 / 7 Support</h5>
          <p className="text-sm text-gray-600">
            Got a problem? Just get in touch. Our customer service team is available 24/7.
          </p>
        </div>
        <div>
          <h5 className="font-semibold">💳 Transaction fees</h5>
          <p className="text-sm text-gray-600">
            Use a variety of payment methods to trade cryptocurrency free, safe and fast.
          </p>
        </div>
        <div>
          <h5 className="font-semibold">📊 Rich information</h5>
          <p className="text-sm text-gray-600">
            Gather a wealth of information, let you know the industry dynamics in first time.
          </p>
        </div>
        <div>
          <h5 className="font-semibold">🔒 Reliable security</h5>
          <p className="text-sm text-gray-600">
            Our sophisticated security measures protect your cryptocurrency from all risks.
          </p>
        </div>
      </div>
    </div>
  );
}
