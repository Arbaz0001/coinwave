import React, { useEffect, useState } from "react";
import { fetchPackHistory } from "../services/investmentService";

export default function AdminPackHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await fetchPackHistory();
      setHistory(response?.data || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch pack history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pack History</h2>
      {error && <p className="mb-3 text-red-600">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Pack</th>
                <th className="p-3 text-left">Paid</th>
                <th className="p-3 text-left">Interest</th>
                <th className="p-3 text-left">Return</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Approved At</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row._id} className="border-t">
                  <td className="p-3">{row.userId?.fullName || row.userId?.email || "Unknown"}</td>
                  <td className="p-3">{row.packId?.packName || "-"}</td>
                  <td className="p-3">₹{Number(row.amountPaid || 0).toFixed(2)}</td>
                  <td className="p-3">₹{Number(row.interestAmount || 0).toFixed(2)}</td>
                  <td className="p-3">₹{Number(row.totalReturn || 0).toFixed(2)}</td>
                  <td className="p-3">{row.status}</td>
                  <td className="p-3">{row.approvedAt ? new Date(row.approvedAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
              {!history.length && (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={7}>No history found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
