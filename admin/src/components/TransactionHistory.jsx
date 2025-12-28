import React, { useEffect, useState } from "react";
import axios from "axios";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // id of tx being processed
  const [error, setError] = useState(null);

  const [filterTxType, setFilterTxType] = useState("all"); // deposit | withdraw | all
  const [filterStatus, setFilterStatus] = useState("all"); // pending | success | failed | all

  const PAGE_SIZE = 10; // change as needed

  const getAuthHeader = () => {
    const token = localStorage.getItem("adminToken"); // change key if different
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchTransactions = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pageNumber,
        limit: PAGE_SIZE,
      };
      if (filterTxType !== "all") params.transactionType = filterTxType;
      if (filterStatus !== "all") params.status = filterStatus;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/transactions`,
        {
          params,
          headers: {
            ...getAuthHeader(),
          },
        }
      );

      const payload = response.data?.data || {};
      const txs = payload.transactions || [];
      const pages = payload.totalPages || 1;

      setTransactions(txs);
      setTotalPages(pages);
      setPage(pageNumber);
    } catch (err) {
      console.error("Fetch transactions error:", err);
      const serverMsg = err.response?.data?.message || err.message;
      setError("Failed to fetch transaction history. " + serverMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1); // reset to first page when filters change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTxType, filterStatus]);

  useEffect(() => {
    fetchTransactions(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchTransactions(newPage);
    }
  };

  const performAction = async (id, action) => {
    // action = 'approve' or 'deny'
    try {
      setActionLoading(id);
      setError(null);
      const url = `${import.meta.env.VITE_API_URL}/transactions/${id}/${action}`;
      await axios.put(url, {}, { headers: { ...getAuthHeader() } });
      // refresh current page
      fetchTransactions(page);
    } catch (err) {
      console.error(`${action} error:`, err);
      const serverMsg = err.response?.data?.message || err.message;
      setError(serverMsg || `Failed to ${action} transaction.`);
    } finally {
      setActionLoading(null);
    }
  };

  const renderStatusBadge = (status) => {
    const base = "px-2 py-1 rounded text-sm font-medium inline-block";
    if (!status) return <span className={`${base} bg-gray-700`}>Unknown</span>;
    if (status === "success") return <span className={`${base} bg-green-700`}>Success</span>;
    if (status === "pending") return <span className={`${base} bg-yellow-600`}>Pending</span>;
    if (status === "failed") return <span className={`${base} bg-red-700`}>Failed</span>;
    return <span className={`${base} bg-gray-700`}>{status}</span>;
  };

  return (
    <div className="max-w mx-auto p-4 text-gray-300 min-h-screen min-w-full flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-4">Transaction History (Deposits & Withdrawals)</h2>

      {/* Filters */}
      <div className="w-full max-w-3xl flex gap-3 mb-4">
        <div>
          <label className="block text-sm mb-1">Type</label>
          <select
            value={filterTxType}
            onChange={(e) => setFilterTxType(e.target.value)}
            className="px-3 py-2 bg-gray-800 rounded"
          >
            <option value="all">All</option>
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-gray-800 rounded"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="ml-auto flex items-end">
          <button
            onClick={() => {
              setFilterTxType("all");
              setFilterStatus("all");
            }}
            className="px-3 py-2 bg-gray-700 rounded"
          >
            Reset
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-400 mb-2">{error}</p>}

      {!loading && transactions.length === 0 && <p>No transactions found.</p>}

      {!loading && transactions.length > 0 && (
        <div className="space-y-4 w-full max-w-3xl">
          {transactions.map((tx) => {
            const id = tx._id ?? tx.id;
            const isPending = tx.status === "pending";
            const userName = tx.userId?.name ?? tx.userName ?? "User";
            return (
              <div
                key={id}
                className="p-4 flex flex-col gap-2 rounded bg-transparent shadow shadow-gray-800"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-400">
                      {new Date(tx.createdAt ?? tx.date).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" • "}
                      <span className="text-xs text-gray-400">ID: {id ?? "-"}</span>
                    </p>
                    <p className="font-semibold">{userName}</p>
                    <p className="text-sm text-gray-400">{tx.details?.utr ?? tx.details?.txHash ?? tx.note ?? ""}</p>
                  </div>

                  <div className="text-right">
                    <div className="mb-1">{renderStatusBadge(tx.status)}</div>

                    <div
                      className={`font-bold ${
                        tx.transactionType === "deposit" ? "text-green-300" : "text-red-300"
                      }`}
                    >
                      {tx.transactionType ? tx.transactionType.charAt(0).toUpperCase() + tx.transactionType.slice(1) : "Tx"}
                      {" • "}₹{Number(tx.amount ?? 0).toLocaleString("en-IN")}
                    </div>

                    <div className="text-xs text-gray-400">
                      Mode: {tx.type ?? "-"} {/* upi | crypto */}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(id);
                    }}
                    className="px-3 py-1 rounded bg-gray-700 text-sm"
                    title="Copy ID"
                  >
                    Copy ID
                  </button>

                  {/* Approve / Deny only for pending */}
                  {isPending && (
                    <>
                      <button
                        onClick={() => performAction(id, "approve")}
                        disabled={actionLoading === id}
                        className="px-3 py-1 rounded bg-green-600 text-sm disabled:opacity-50"
                      >
                        {actionLoading === id ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={() => performAction(id, "deny")}
                        disabled={actionLoading === id}
                        className="px-3 py-1 rounded bg-red-600 text-sm disabled:opacity-50"
                      >
                        {actionLoading === id ? "Processing..." : "Deny"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 space-x-4">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1 || loading}
          className="px-4 py-2 bg-gray-600 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages || loading}
          className="px-4 py-2 bg-gray-600 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TransactionHistory;
