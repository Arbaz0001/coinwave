// src/pages/Exchange.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import hero2 from "../assets/hero2.png";

export default function Exchange() {
  const [platformPrice, setPlatformPrice] = useState(110.4);
  const [binancePrice, setBinancePrice] = useState(null);
  const [wazirxPrice, setWazirxPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Local platform price auto fluctuation 
  useEffect(() => {
    const interval = setInterval(() => {
      setPlatformPrice((prev) => {
        const newPrice = parseFloat(prev) + (Math.random() - 0.5);
        return Number(newPrice.toFixed(2));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Fetch Binance & WazirX INR prices from backend
  useEffect(() => {
    async function fetchExchanges() {
      setLoading(true);
      try {
        const binanceRes = await api.get("/binance-price");
        setBinancePrice(binanceRes.data.priceINR);
      } catch {
        setBinancePrice("N/A");
      }

      try {
        const wazirxRes = await api.get("/wazirx-price");
        setWazirxPrice(wazirxRes.data.priceINR);
      } catch {
        setWazirxPrice("N/A");
      }

      setLoading(false);
    }

    fetchExchanges();
    const interval = setInterval(fetchExchanges, 5000); // auto refresh every 5 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hero Image */}
      <div className="bg-white rounded shadow-sm overflow-hidden">
        <img src={hero2} alt="Hero" className="w-full object-cover h-52 md:h-64" />
      </div>

      {/* Platform Price */}
      <div className="bg-white rounded-lg shadow p-4 text-center">
        <h2 className="text-lg text-gray-500">Platform price</h2>
        <p className="text-4xl font-bold text-blue-600">{platformPrice}</p>
        <p className="text-xs text-gray-400">Auto refresh after 3 sec</p>

        <div className="mt-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-2 text-sm font-medium text-center">
            <div className="bg-white p-2 rounded shadow-sm">
              <p className="text-gray-500">Exchange($)</p>
              <p>-123.41</p>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <p className="text-gray-500">Price(₹)</p>
              <p className="text-blue-600">{platformPrice}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-blue-500 underline cursor-pointer">
            What is tiered price policy?
          </p>
        </div>
      </div>

      {/* Deposit / Withdraw / Invite */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <Link to="/deposit" className="bg-gray-100 py-3 rounded font-medium">
          Deposit
        </Link>
        <Link to="/withdraw" className="bg-gray-100 py-3 rounded font-medium">
          Withdraw
        </Link>
        <Link to="/invite" className="bg-gray-100 py-3 rounded font-medium">
          Invite
        </Link>
      </div>

      {/* Buy / Sell Buttons */}
      <div className="flex gap-3">
        <Link
          to="/buy"
          className="flex-1 text-center bg-green-600 text-white py-3 rounded font-semibold"
        >
          Buy USDT
        </Link>
        <Link
          to="/sell"
          className="flex-1 text-center bg-red-600 text-white py-3 rounded font-semibold"
        >
          Sell USDT
        </Link>
      </div>

      {/* Exchanges Price */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Exchanges price</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border text-center">
            <h4 className="font-bold text-yellow-600">BINANCE</h4>
            <p className="text-green-600 text-lg font-semibold">
              {loading ? "Loading..." : binancePrice ? `avg ${binancePrice}₹` : "N/A"}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border text-center">
            <h4 className="font-bold text-blue-600">WazirX</h4>
            <p className="text-green-600 text-lg font-semibold">
              {loading ? "Loading..." : wazirxPrice ? `avg ${wazirxPrice}₹` : "N/A"}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Statistics refresh every 5 sec
        </p>
      </div>

      {/* Platform Advantages */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
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
