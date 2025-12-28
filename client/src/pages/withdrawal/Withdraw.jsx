import React, { useState } from "react";
import WithdrawalTabs from "./WithdrawalTabs";
import WithdrawalFormINR from "./WithdrawalFormINR";
import WithdrawalFormUSDT from "./WithdrawalFormUSDT";
import WithdrawalFormETH from "./WithdrawalFormETH";

const WithdrawalContainer = () => {
  const [selectedMethod, setSelectedMethod] = useState("INR");

  return (
    <div className="bg-white text-gray-900 py-6 px-4 flex justify-center min-h-screen">
      <div className="flex items-start flex-col min-h-screen w-full max-w-md">
        {/* Tabs */}
        <WithdrawalTabs selected={selectedMethod} onSelect={setSelectedMethod} />

        {/* Dynamic Form */}
        <div className="mt-6 w-full">
          {selectedMethod === "INR" && <WithdrawalFormINR />}
          {selectedMethod === "USDT" && <WithdrawalFormUSDT />}
          {selectedMethod === "ETH" && <WithdrawalFormETH />}
        </div>

        {/* Optional extra action */}
        <p className="my-6 text-center text-gray-400 text-sm underline w-full">
          Or withdraw using other options
        </p>

        <button className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md">
          Special Withdrawal
        </button>
      </div>
    </div>
  );
};

export default WithdrawalContainer;
