import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_CONFIG } from "../config/api.config";

const DepositRequests = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("pending"); // pending, approved, rejected, all
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState(null); // approve or reject
  const [remarks, setRemarks] = useState("");
  const [processing, setProcessing] = useState(false);

  const API_BASE = API_CONFIG.API_BASE;

  // ✅ Fetch all deposits
  useEffect(() => {
    fetchDeposits();
  }, [filter]);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/admin/deposits`, {
        params: { status: filter !== "all" ? filter : undefined },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (response.data?.success) {
        setDeposits(response.data.data || []);
        console.log(`✅ Loaded ${response.data.data?.length || 0} deposits`);
      } else {
        toast.error(response.data?.message || "Failed to load deposits");
      }
    } catch (error) {
      console.error("❌ Error fetching deposits:", error);
      toast.error("Failed to load deposit requests");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle approval
  const handleApprove = async () => {
    if (!selectedDeposit) return;

    setProcessing(true);
    try {
      const response = await axios.put(
        `${API_BASE}/admin/deposits/${selectedDeposit._id}/approve`,
        { remarks },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (response.data?.success) {
        toast.success("✅ Deposit approved! Wallet updated.");
        setModalOpen(false);
        setSelectedDeposit(null);
        setRemarks("");
        fetchDeposits();
      } else {
        toast.error(response.data?.message || "Failed to approve");
      }
    } catch (error) {
      console.error("❌ Error approving deposit:", error);
      toast.error("Failed to approve deposit");
    } finally {
      setProcessing(false);
    }
  };

  // ✅ Handle rejection
  const handleReject = async () => {
    if (!selectedDeposit || !remarks) {
      toast.error("❌ Please provide a rejection reason");
      return;
    }

    setProcessing(true);
    try {
      const response = await axios.put(
        `${API_BASE}/admin/deposits/${selectedDeposit._id}/reject`,
        { rejectionReason: remarks },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (response.data?.success) {
        toast.success("✅ Deposit rejected. User notification sent.");
        setModalOpen(false);
        setSelectedDeposit(null);
        setRemarks("");
        fetchDeposits();
      } else {
        toast.error(response.data?.message || "Failed to reject");
      }
    } catch (error) {
      console.error("❌ Error rejecting deposit:", error);
      toast.error("Failed to reject deposit");
    } finally {
      setProcessing(false);
    }
  };

  // ✅ Open modal
  const openModal = (deposit, actionType) => {
    setSelectedDeposit(deposit);
    setAction(actionType);
    setRemarks("");
    setModalOpen(true);
  };

  // ✅ Format currency
  const formatCurrency = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

  // ✅ Format date
  const formatDate = (date) => new Date(date).toLocaleString("en-IN");

  // ✅ Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Deposit Requests</h1>
          <p className="text-gray-600">Review and manage user deposit requests</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-3 flex-wrap">
            {["pending", "approved", "rejected", "all"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Deposits Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : deposits.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No deposits found for this filter
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {deposits.map((deposit) => (
                    <tr key={deposit._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {deposit.userId?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {deposit.userId?.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {deposit.method === "UPI" ? "💳 UPI" : "₿ Crypto"}
                        </span>
                        {deposit.method === "Crypto" && (
                          <p className="text-xs text-gray-500 mt-1">
                            {deposit.cryptoDetails?.cryptoType?.toUpperCase() || ""} (
                            {deposit.cryptoDetails?.network?.toUpperCase() || ""})
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(deposit.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                            deposit.status
                          )}`}
                        >
                          {deposit.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(deposit.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(deposit, "details")}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                          >
                            View
                          </button>
                          {deposit.status === "pending" && (
                            <>
                              <button
                                onClick={() => openModal(deposit, "approve")}
                                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openModal(deposit, "reject")}
                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            {action === "details" ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Deposit Details
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">User</p>
                    <p className="font-semibold text-gray-900">
                      {selectedDeposit.userId?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">
                      {selectedDeposit.userId?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(selectedDeposit.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Method</p>
                    <p className="font-semibold text-gray-900">
                      {selectedDeposit.method}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="mt-1">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                          selectedDeposit.status
                        )}`}
                      >
                        {selectedDeposit.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(selectedDeposit.createdAt)}
                    </p>
                  </div>

                  {selectedDeposit.method === "UPI" && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">UPI Transaction ID</p>
                      <p className="font-mono text-gray-900 break-all">
                        {selectedDeposit.upiDetails?.transactionId}
                      </p>
                    </div>
                  )}

                  {selectedDeposit.method === "Crypto" && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Crypto Type</p>
                        <p className="font-semibold text-gray-900">
                          {selectedDeposit.cryptoDetails?.cryptoType?.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Network</p>
                        <p className="font-semibold text-gray-900">
                          {selectedDeposit.cryptoDetails?.network?.toUpperCase()}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Transaction Hash</p>
                        <p className="font-mono text-gray-900 break-all">
                          {selectedDeposit.cryptoDetails?.transactionHash}
                        </p>
                      </div>
                    </>
                  )}

                  {selectedDeposit.remarks && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Remarks</p>
                      <p className="text-gray-900">{selectedDeposit.remarks}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setModalOpen(false)}
                  className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {action === "approve" ? "Approve Deposit" : "Reject Deposit"}
                </h2>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-600">
                    <strong>User:</strong> {selectedDeposit.userId?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Amount:</strong> {formatCurrency(selectedDeposit.amount)}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {action === "approve"
                      ? "Remarks (optional)"
                      : "Rejection Reason (required)"}
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder={
                      action === "approve"
                        ? "Add any notes..."
                        : "Why is this deposit being rejected?"
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="3"
                    disabled={processing}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={
                      action === "approve" ? handleApprove : handleReject
                    }
                    className={`flex-1 text-white py-2 rounded-lg font-medium transition ${
                      action === "approve"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    } disabled:opacity-50`}
                    disabled={
                      processing ||
                      (action === "reject" && !remarks)
                    }
                  >
                    {processing
                      ? "Processing..."
                      : action === "approve"
                      ? "Approve Deposit"
                      : "Reject Deposit"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositRequests;
