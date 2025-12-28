import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ExchangePrices() {
  const [binancePrice, setBinancePrice] = useState(null);
  const [wazirxPrice, setWazirxPrice] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      // Binance API
      axios
        .get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT")
        .then((res) => setBinancePrice(res.data.price))
        .catch((err) => console.error("Binance API Error:", err));

      // WazirX API
      axios
        .get("https://api.wazirx.com/api/v2/tickers/usdtinr")
        .then((res) => setWazirxPrice(res.data.ticker.last))
        .catch((err) => console.error("WazirX API Error:", err));
    };

    fetchData(); 
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Exchanges Price</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Binance Box */}
        <div className="border rounded-xl p-4 shadow">
          <h3 className="text-lg font-semibold">Binance</h3>
          <p className="text-gray-600">BTC/USDT</p>
          <p className="text-green-600 text-xl font-bold">
            {binancePrice ? `$${binancePrice}` : "Loading..."}
          </p>
        </div>

        {/* WazirX Box */}
        <div className="border rounded-xl p-4 shadow">
          <h3 className="text-lg font-semibold">WazirX</h3>
          <p className="text-gray-600">USDT/INR</p>
          <p className="text-blue-600 text-xl font-bold">
            {wazirxPrice ? `₹${wazirxPrice}` : "Loading..."}
          </p>
        </div>
      </div>
    </div>
  );
}
