import React from "react";

const methods = ["INR", "USDT", "ETH"];

const WithdrawalTabs = ({ selected, onSelect }) => {
  return (
    <div className="flex gap-3 mb-6 justify-center">
      {methods.map((method) => (
        <button
          key={method}
          onClick={() => onSelect(method)}
          className={`px-4 py-2 rounded-md shadow transition ${
            selected === method
              ? "bg-blue-600 text-white font-medium"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {method}
        </button>
      ))}
    </div>
  );
};

export default WithdrawalTabs;
