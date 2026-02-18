import React, { useEffect, useMemo, useState } from "react";
import { approvePurchase, fetchPurchaseRequests, rejectPurchase } from "../services/investmentService";
import { API_CONFIG } from "../config/api.config";

export default function AdminPurchaseRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await fetchPurchaseRequests();
      setRequests(response?.data || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const pendingCount = useMemo(
    () => requests.filter((item) => item.status === "pending").length,
    [requests]
  );

  const onApprove = async (purchaseId) => {
    try {
      await approvePurchase(purchaseId);
      loadRequests();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to approve request");
    }
  };

  const onReject = async (purchaseId) => {
    try {
      await rejectPurchase(purchaseId, "");
      loadRequests();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to reject request");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Pack Purchase Requests</h2>
        <p className="text-sm text-gray-500 mt-1">Pending requests: {pendingCount}</p>
      </div>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const pack = request.packId || {};
            const user = request.userId || {};
            let statusClass = "bg-yellow-100 text-yellow-700";
            if (request.status === "approved") {
              statusClass = "bg-green-100 text-green-700";
            } else if (request.status === "rejected") {
              statusClass = "bg-red-100 text-red-700";
            }
            const screenshotUrl = request.paymentScreenshot?.startsWith("http")
              ? request.paymentScreenshot
              : `${API_CONFIG.BASE_URL}${request.paymentScreenshot || ""}`;
            return (
              <div key={request._id} className="border rounded-lg p-4 bg-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="font-semibold">{pack.packName || "Pack"}</p>
                    <p className="text-sm text-gray-600">User: {user.fullName || user.email || "Unknown"}</p>
                    <p className="text-sm text-gray-600">Amount Paid: ₹{Number(request.amountPaid || 0).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Interest: {Number(pack.interestPercent || 0)}%</p>
                    <p className="text-sm text-gray-600">Expected Return: ₹{Number(request.totalReturn || 0).toFixed(2)}</p>
                    {request.paymentScreenshot && (
                      <a
                        href={screenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 text-sm underline"
                      >
                        View Screenshot
                      </a>
                    )}
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
                      {request.status}
                    </span>

                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onApprove(request._id)}
                          className="px-3 py-1 rounded-md bg-green-600 text-white"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onReject(request._id)}
                          className="px-3 py-1 rounded-md bg-red-600 text-white"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {!requests.length && <p className="text-gray-500">No purchase requests found</p>}
        </div>
      )}
    </div>
  );
}
