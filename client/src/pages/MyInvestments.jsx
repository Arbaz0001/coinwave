import React, { useEffect, useState } from "react";
import { fetchMyInvestments } from "../services/investmentService";

export default function MyInvestments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInvestments = async () => {
    try {
      setLoading(true);
      const response = await fetchMyInvestments();
      setInvestments(response?.data || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch investments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  return (
    <div className="max-w-6xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-4">My Investments</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Pack</th>
                <th className="p-3 text-left">Invested Amount</th>
                <th className="p-3 text-left">Interest %</th>
                <th className="p-3 text-left">Expected Return</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Approval Date</th>
                <th className="p-3 text-left">Wallet Credit Amount</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((item) => {
                const pack = item.packId || {};
                let statusClass = "bg-yellow-100 text-yellow-700";
                if (item.status === "approved") {
                  statusClass = "bg-green-100 text-green-700";
                } else if (item.status === "rejected") {
                  statusClass = "bg-red-100 text-red-700";
                }
                const walletCreditAmount = item.status === "approved"
                  ? `₹${Number(item.totalReturn || 0).toFixed(2)}`
                  : "-";
                return (
                  <tr key={item._id} className="border-t">
                    <td className="p-3">{pack.packName || "-"}</td>
                    <td className="p-3">₹{Number(item.amountPaid || 0).toFixed(2)}</td>
                    <td className="p-3">{Number(pack.interestPercent || 0)}%</td>
                    <td className="p-3">₹{Number(item.totalReturn || 0).toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3">{item.approvedAt ? new Date(item.approvedAt).toLocaleString() : "-"}</td>
                    <td className="p-3">{walletCreditAmount}</td>
                  </tr>
                );
              })}
              {!investments.length && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">No investment records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
