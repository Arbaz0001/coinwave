import React, { useEffect, useState } from "react";
import { deletePack, fetchAdminPacks, updatePack } from "../services/investmentService";

export default function AdminPackList() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPacks = async () => {
    try {
      setLoading(true);
      const response = await fetchAdminPacks();
      setPacks(response?.data || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load packs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPacks();
  }, []);

  const onToggleActive = async (pack) => {
    try {
      await updatePack(pack._id, { isActive: !pack.isActive });
      loadPacks();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update pack");
    }
  };

  const onDelete = async (id) => {
    try {
      await deletePack(id);
      loadPacks();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete pack");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">All Investment Packs</h2>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Pack</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Interest %</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {packs.map((pack) => (
                <tr key={pack._id} className="border-t">
                  <td className="p-3">
                    <p className="font-medium">{pack.packName}</p>
                    <p className="text-gray-500 text-xs">{pack.description || "-"}</p>
                  </td>
                  <td className="p-3">₹{Number(pack.amount || 0).toFixed(2)}</td>
                  <td className="p-3">{Number(pack.interestPercent || 0)}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${pack.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                      {pack.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => onToggleActive(pack)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md"
                    >
                      {pack.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => onDelete(pack._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!packs.length && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">No packs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
