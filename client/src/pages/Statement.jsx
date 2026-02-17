import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_CONFIG } from "../config/api.config";
import { getSocket, initSocket } from "../hooks/useSocket";
import { toast } from "react-toastify";
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpCircle,
  ArrowDownCircle
} from "lucide-react";

export default function Statement() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    netBalance: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, deposit, withdraw

  useEffect(() => {
    fetchStatement();
  }, []);

  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("user_token") ||
      localStorage.getItem("token") ||
      null;

    const socket = getSocket() || initSocket(token);
    if (!socket) return;

    const handleStatementUpdated = (payload) => {
      fetchStatement();
      if (payload?.action === "deleted") {
        toast.info("Statement updated: one transaction was removed");
      } else {
        toast.info("Statement updated: changes synced from admin");
      }
    };

    socket.on("statementUpdated", handleStatementUpdated);

    return () => {
      socket.off("statementUpdated", handleStatementUpdated);
    };
  }, []);

  const fetchStatement = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await axiosInstance.get(`${API_CONFIG.API_BASE}/users/statement`);
      
      if (response.data?.success) {
        setTransactions(response.data.data.transactions || []);
        setSummary(response.data.data.summary || {
          totalDeposits: 0,
          totalWithdrawals: 0,
          netBalance: 0,
          totalTransactions: 0,
        });
      }
    } catch (err) {
      console.error("Error fetching statement:", err);
      setError(err.response?.data?.message || "Failed to load statement");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "rejected":
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "rejected":
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === "all") return true;
    return tx.type === filter;
  });

  if (loading) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-gray-600">Loading statement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-screen bg-gray-50 pb-20 sm:pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">
          📊 Transaction Statement
        </h1>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Total Deposits */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <ArrowDownCircle className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 opacity-60" />
            </div>
            <p className="text-green-100 text-xs sm:text-sm mb-1">Total Deposits</p>
            <p className="text-2xl sm:text-3xl font-bold">₹{summary.totalDeposits.toLocaleString()}</p>
          </div>

          {/* Total Withdrawals */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <ArrowUpCircle className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 opacity-60" />
            </div>
            <p className="text-red-100 text-xs sm:text-sm mb-1">Total Withdrawals</p>
            <p className="text-2xl sm:text-3xl font-bold">₹{summary.totalWithdrawals.toLocaleString()}</p>
          </div>

          {/* Net Balance */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 text-white sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
            </div>
            <p className="text-blue-100 text-xs sm:text-sm mb-1">Net Balance</p>
            <p className="text-2xl sm:text-3xl font-bold">₹{summary.netBalance.toLocaleString()}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md mb-3 sm:mb-4 p-1 flex gap-1">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-lg font-medium transition text-xs sm:text-sm ${
              filter === "all"
                ? "bg-blue-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setFilter("deposit")}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-lg font-medium transition text-xs sm:text-sm ${
              filter === "deposit"
                ? "bg-green-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Deposits
          </button>
          <button
            onClick={() => setFilter("withdraw")}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-lg font-medium transition text-xs sm:text-sm ${
              filter === "withdraw"
                ? "bg-red-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Withdrawals
          </button>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-8 sm:p-12 text-center">
            <Wallet className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-600 text-base sm:text-lg font-medium mb-2">
              No transactions found
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">
              {filter === "all" 
                ? "Your transaction history will appear here"
                : `No ${filter} transactions yet`
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md overflow-hidden">
            <div className="divide-y divide-gray-100">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 sm:p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between gap-2 sm:gap-4">
                    {/* Left: Icon & Details */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          tx.type === "deposit"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {tx.type === "deposit" ? (
                          <ArrowDownCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                        ) : (
                          <ArrowUpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <p className="font-semibold text-sm sm:text-base text-gray-900 capitalize truncate">
                            {tx.type}
                          </p>
                          <span
                            className={`flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(
                              tx.status
                            )}`}
                          >
                            {getStatusIcon(tx.status)}
                            <span className="hidden sm:inline">{tx.status}</span>
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            {formatDate(tx.date)}
                          </span>
                          <span className="text-xs truncate">
                            {tx.method}
                          </span>
                        </div>
                        {tx.reference && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            Ref: {tx.reference}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Amount */}
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`text-base sm:text-lg md:text-xl font-bold ${
                          tx.type === "deposit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.type === "deposit" ? "+" : "-"}₹
                        {tx.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Footer */}
        {filteredTransactions.length > 0 && (
          <div className="mt-3 sm:mt-4 bg-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-gray-600 text-center">
            Showing {filteredTransactions.length} of {summary.totalTransactions} transactions
          </div>
        )}
      </div>
    </div>
  );
}
