import React, { useEffect, useState } from "react";
import BuyPackModal from "../components/BuyPackModal";
import { fetchActivePacks } from "../services/investmentService";

export default function Investment() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPack, setSelectedPack] = useState(null);

  const loadPacks = async () => {
    try {
      setLoading(true);
      const response = await fetchActivePacks();
      setPacks(response?.data || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch investment packs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPacks();
  }, []);

  return (
    <div className="max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-4">Investment Packs</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packs.map((pack) => {
            const expectedReturn = Number(pack.amount || 0) + (Number(pack.amount || 0) * Number(pack.interestPercent || 0)) / 100;
            return (
              <div key={pack._id} className="bg-white border rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-2">{pack.packName}</h3>
                <p className="text-sm text-gray-600 mb-1">Amount: ₹{Number(pack.amount || 0).toFixed(2)}</p>
                <p className="text-sm text-gray-600 mb-1">Interest: {Number(pack.interestPercent || 0)}%</p>
                <p className="text-sm text-gray-600 mb-3">Expected Return: ₹{Number(expectedReturn).toFixed(2)}</p>
                <button
                  onClick={() => setSelectedPack(pack)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
                >
                  Buy
                </button>
              </div>
            );
          })}
          {!packs.length && <p className="text-gray-500">No active investment packs available</p>}
        </div>
      )}

      <BuyPackModal
        open={Boolean(selectedPack)}
        pack={selectedPack}
        onClose={() => setSelectedPack(null)}
        onSuccess={() => {
          loadPacks();
        }}
      />
    </div>
  );
}
