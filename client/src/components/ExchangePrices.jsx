import React, { useState } from "react";

export default function ExchangePrices() {
  const [binancePrice] = useState("45,230.50");
  const [wazirxPrice] = useState("88,450.00");

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Exchanges Price</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Binance Box */}
        <div className="border rounded-xl p-4 shadow">
          <h3 className="text-lg font-semibold">Binance</h3>
          <p className="text-gray-600">BTC/USDT</p>
          <p className="text-green-600 text-xl font-bold">
            ${binancePrice}
          </p>
        </div>

        {/* WazirX Box */}
        <div className="border rounded-xl p-4 shadow">
          <h3 className="text-lg font-semibold">WazirX</h3>
          <p className="text-gray-600">USDT/INR</p>
          <p className="text-blue-600 text-xl font-bold">
            ₹{wazirxPrice}
          </p>
        </div>
      </div>
    </div>
  );
}
