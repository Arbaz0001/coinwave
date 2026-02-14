import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const USDTTransactionHistory = () => {
  const [activeTab, setActiveTab] = useState("buy"); // buy | sell
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // pending | approved | rejected | all

  const PAGE_SIZE = 10;

  const getAuthHeader = () => {
    const token =
      localStorage.getItem("adminToken") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ✅ Fetch Buy USDT Requests (from Deposit model)
  const fetchBuyRequests = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = {
        page: pageNumber,
        limit: PAGE_SIZE,
        method: "BUY_USDT",
      };
      if (filterStatus !== "all") params.status = filterStatus;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/deposits/all`,
        {
          params,
          headers: getAuthHeader(),
        }
      );

      const txs = response.data?.data || [];
      const pages = response.data?.totalPages || 1;

      setTransactions(txs);
      setTotalPages(pages);
      setPage(pageNumber);
    } catch (err) {
      console.error("Fetch buy requests error:", err);
      toast.error("Failed to fetch buy requests");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Sell USDT Requests (from Withdraw model)
  const fetchSellRequests = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = {
        page: pageNumber,
        limit: PAGE_SIZE,
        method: "USDT_SELL",
      };
      if (filterStatus !== "all") params.status = filterStatus;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/withdraws/all`,
        {
          params,
          headers: getAuthHeader(),
        }
      );

      const txs = response.data?.data || [];
      const pages = response.data?.totalPages || 1;

      setTransactions(txs);
      setTotalPages(pages);
      setPage(pageNumber);
    } catch (err) {
      console.error("Fetch sell requests error:", err);
      toast.error("Failed to fetch sell requests");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Approve/Reject Buy Request
  const approveBuyRequest = async (id, action) => {
    try {
      setActionLoading(id);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/deposits/approve/${id}`,
        { status: action }, // approve | reject
        { headers: getAuthHeader() }
      );
      toast.success(`✅ Buy request ${action}ed successfully`);
      fetchBuyRequests(page);
    } catch (err) {
      console.error(`${action} error:`, err);
      toast.error(err.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Approve/Reject Sell Request
  const approveSellRequest = async (id, action) => {
    try {
      setActionLoading(id);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/withdraws/update/${id}`,
        { status: action }, // approved | rejected
        { headers: getAuthHeader() }
      );
      toast.success(`✅ Sell request ${action}ed successfully`);
      fetchSellRequests(page);
    } catch (err) {
      console.error(`${action} error:`, err);
      toast.error(err.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setActionLoading(null);
    }
  };

  // Fetch on tab change
  useEffect(() => {
    setPage(1);
    if (activeTab === "buy") {
      fetchBuyRequests(1);
    } else {
      fetchSellRequests(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Fetch on page or filter change
  useEffect(() => {
    if (activeTab === "buy") {
      fetchBuyRequests(page);
    } else {
      fetchSellRequests(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterStatus]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const renderStatusBadge = (status) => {
    const base = "px-2 py-1 rounded text-sm font-medium inline-block";
    if (status === "approved")
      return <span className={`${base} bg-green-700`}>✅ Approved</span>;
    if (status === "pending")
      return <span className={`${base} bg-yellow-600`}>⏳ Pending</span>;
    if (status === "rejected")
      return <span className={`${base} bg-red-700`}>❌ Rejected</span>;
    return <span className={`${base} bg-gray-700`}>{status}</span>;
  };

  // Render Buy Transaction
  const renderBuyTransaction = (tx, index) => {
    const isPending = tx.status === "pending";
    const userFullName = tx.userId?.fullName || "Unknown User";
    const amount = tx.amount || 0;
    const cryptoDetails = tx.cryptoDetails || {};
    const network = cryptoDetails.network || "Unknown";
    const userWallet = cryptoDetails.userReceivingWallet || "N/A";

    return (
      <div
        key={tx._id}
        className="p-4 flex flex-col gap-3 rounded bg-gray-800 shadow-lg border border-gray-700 hover:border-green-500 transition"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-xs text-gray-400">
              {new Date(tx.createdAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" • "}
              <span className="text-xs text-gray-500">ID: {tx._id.substring(0, 8)}</span>
            </p>
            <p className="font-semibold text-green-300">{userFullName}</p>
            <p className="text-sm text-gray-400">{network.toUpperCase()} Network</p>
            <p className="text-xs text-gray-500 mt-2">
              Receiving Wallet: <span className="font-mono break-all">{userWallet}</span>
            </p>
          </div>

          <div className="text-right">
            <div className="mb-2">{renderStatusBadge(tx.status)}</div>
            <div className="text-lg font-bold text-green-400">
              🟢 {amount} USDT
            </div>
            <div className="text-xs text-gray-500">Buying</div>
          </div>
        </div>

        {/* Details */}
        <div className="border-t border-gray-700 pt-2 text-xs text-gray-400 space-y-1">
          <p>
            <strong>Transaction Hash:</strong> {cryptoDetails.transactionHash || "N/A"}
          </p>
          <p>
            <strong>Message:</strong> {tx.remarks || "No message"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-2 border-t border-gray-700">
          <button
            onClick={() => navigator.clipboard.writeText(tx._id)}
            className="px-3 py-1 rounded bg-gray-700 text-xs hover:bg-gray-600"
          >
            📋 Copy ID
          </button>

          {isPending && (
            <>
              <button
                onClick={() => approveBuyRequest(tx._id, "approved")}
                disabled={actionLoading === tx._id}
                className="px-3 py-1 rounded bg-green-600 text-xs hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading === tx._id ? "Processing..." : "✅ Approve"}
              </button>
              <button
                onClick={() => approveBuyRequest(tx._id, "rejected")}
                disabled={actionLoading === tx._id}
                className="px-3 py-1 rounded bg-red-600 text-xs hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === tx._id ? "Processing..." : "❌ Reject"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Render Sell Transaction
  const renderSellTransaction = (tx, index) => {
    const isPending = tx.status === "pending";
    const userFullName = tx.userId?.fullName || "Unknown User";
    const amount = tx.amount || 0;
    const details = tx.details || {};
    const network = details.network || "Unknown";
    const txHash = details.transactionHash || "N/A";
    const upiId = details.upiId || "N/A";
    const bankName = details.bankAccount?.bankName || "N/A";
    const accountHolder = details.bankAccount?.accountHolderName || "N/A";

    return (
      <div
        key={tx._id}
        className="p-4 flex flex-col gap-3 rounded bg-gray-800 shadow-lg border border-gray-700 hover:border-red-500 transition"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-xs text-gray-400">
              {new Date(tx.createdAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" • "}
              <span className="text-xs text-gray-500">ID: {tx._id.substring(0, 8)}</span>
            </p>
            <p className="font-semibold text-red-300">{userFullName}</p>
            <p className="text-sm text-gray-400">{network.toUpperCase()} Network</p>
            <p className="text-xs text-gray-500 mt-2">
              TX Hash: <span className="font-mono break-all">{txHash}</span>
            </p>
          </div>

          <div className="text-right">
            <div className="mb-2">{renderStatusBadge(tx.status)}</div>
            <div className="text-lg font-bold text-red-400">
              🔴 {amount} USDT
            </div>
            <div className="text-xs text-gray-500">Selling</div>
          </div>
        </div>

        {/* Details */}
        <div className="border-t border-gray-700 pt-2 text-xs text-gray-400 space-y-1">
          <p>
            <strong>UPI:</strong> {upiId}
          </p>
          <p>
            <strong>Bank:</strong> {bankName}
          </p>
          <p>
            <strong>Account Holder:</strong> {accountHolder}
          </p>
          <p>
            <strong>Message:</strong> {tx.remarks || "No message"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-2 border-t border-gray-700">
          <button
            onClick={() => navigator.clipboard.writeText(tx._id)}
            className="px-3 py-1 rounded bg-gray-700 text-xs hover:bg-gray-600"
          >
            📋 Copy ID
          </button>

          {isPending && (
            <>
              <button
                onClick={() => approveSellRequest(tx._id, "approved")}
                disabled={actionLoading === tx._id}
                className="px-3 py-1 rounded bg-green-600 text-xs hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading === tx._id ? "Processing..." : "✅ Approve"}
              </button>
              <button
                onClick={() => approveSellRequest(tx._id, "rejected")}
                disabled={actionLoading === tx._id}
                className="px-3 py-1 rounded bg-red-600 text-xs hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === tx._id ? "Processing..." : "❌ Reject"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w mx-auto p-4 text-gray-300 min-h-screen min-w-full flex flex-col items-center">
      <h2 className="text-3xl font-semibold mb-6">💱 USDT Buy & Sell Requests</h2>

      {/* Tabs */}
      <div className="w-full max-w-4xl flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("buy")}
          className={`flex-1 py-3 rounded-lg font-semibold transition ${
            activeTab === "buy"
              ? "bg-green-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          🟢 Buy USDT
        </button>
        <button
          onClick={() => setActiveTab("sell")}
          className={`flex-1 py-3 rounded-lg font-semibold transition ${
            activeTab === "sell"
              ? "bg-red-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          🔴 Sell USDT
        </button>
      </div>

      {/* Filters */}
      <div className="w-full max-w-4xl flex gap-3 mb-6">
        <div>
          <label className="block text-sm mb-2 font-medium">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-700 rounded text-gray-300 text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="ml-auto flex items-end">
          <button
            onClick={() => {
              setFilterStatus("all");
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-700 rounded text-sm hover:bg-gray-600"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="text-center text-gray-400 py-10">Loading...</div>
      )}

      {!loading && transactions.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          No {activeTab === "buy" ? "buy" : "sell"} requests found
        </div>
      )}

      {!loading && transactions.length > 0 && (
        <div className="space-y-4 w-full max-w-4xl">
          {transactions.map((tx, idx) =>
            activeTab === "buy"
              ? renderBuyTransaction(tx, idx)
              : renderSellTransaction(tx, idx)
          )}
        </div>
      )}

      {/* Pagination */}
      {transactions.length > 0 && (
        <div className="flex justify-center items-center mt-8 space-x-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
            className="px-4 py-2 bg-gray-600 rounded disabled:opacity-50 hover:bg-gray-500"
          >
            ← Previous
          </button>
          <span className="text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || loading}
            className="px-4 py-2 bg-gray-600 rounded disabled:opacity-50 hover:bg-gray-500"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default USDTTransactionHistory;
