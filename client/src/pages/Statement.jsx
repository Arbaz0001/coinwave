import React from "react";

export default function Statement() {
  const transactions = [
    { id: 1, type: "Deposit", amount: 5000, date: "12 Sep 2025" },
    { id: 2, type: "Withdraw", amount: 2000, date: "14 Sep 2025" },
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Statement</h1>

      {transactions.length === 0 ? (
        <p>No transactions available.</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex justify-between items-center p-3 border rounded-lg shadow-sm"
            >
              <div>
                <p className="font-semibold">{tx.type}</p>
                <p className="text-sm text-gray-500">{tx.date}</p>
              </div>
              <p
                className={`font-bold ${
                  tx.type === "Withdraw" ? "text-red-500" : "text-green-600"
                }`}
              >
                ₹{tx.amount}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
