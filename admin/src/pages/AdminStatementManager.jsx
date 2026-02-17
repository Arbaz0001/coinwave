import React, { useMemo, useState, useEffect } from "react";
import { Edit2, Trash2, Loader2, Search, Users } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_CONFIG } from "../config/api.config";

const API_BASE = API_CONFIG.API_BASE;

export default function AdminStatementManager() {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedTx, setSelectedTx] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });

  const getAdminToken = () => {
    const candidates = [
      localStorage.getItem("admin_token"),
      localStorage.getItem("cw_admin_token"),
      localStorage.getItem("adminToken"),
      localStorage.getItem("authToken"),
      localStorage.getItem("token"),
    ];

    try {
      const rawAdminAuth = localStorage.getItem("adminAuth");
      if (rawAdminAuth) {
        const parsed = JSON.parse(rawAdminAuth);
        if (parsed?.accessToken) {
          candidates.unshift(parsed.accessToken);
        }
      }
    } catch {
    }

    const token = candidates.find(
      (candidate) =>
        typeof candidate === "string" &&
        candidate.trim() !== "" &&
        candidate !== "null" &&
        candidate !== "undefined"
    );

    return token || null;
  };

  const getAuthHeaders = () => {
    const token = getAdminToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const normalizeTransactionResponse = (responseData) => {
    const rawData = responseData?.data;
    let transactionList = [];

    if (Array.isArray(rawData)) {
      transactionList = rawData;
    } else if (Array.isArray(rawData?.transactions)) {
      transactionList = rawData.transactions;
    }

    const page = Number(rawData?.page || 1);
    const pages = Number(rawData?.pages || rawData?.totalPages || 1);
    const total = Number(rawData?.total || transactionList.length || 0);
    const limit = Number(rawData?.limit || pagination.limit || 20);

    return {
      transactions: transactionList,
      pagination: { page, pages, total, limit },
    };
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await axios.get(`${API_BASE}/admin/users`, {
        headers: getAuthHeaders(),
      });

      const rawUsers = response.data?.users || response.data?.data?.users || [];
      const sortedUsers = [...rawUsers].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      setUsers(sortedUsers);

      if (!selectedUserId && sortedUsers.length > 0) {
        setSelectedUserId(sortedUsers[0]._id);
      }
    } catch (error) {
      console.error("❌ Failed to fetch users:", error.message);
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchUserTransactions = async (page = 1, userId = selectedUserId) => {
    if (!userId) {
      setTransactions([]);
      setPagination((prev) => ({ ...prev, page: 1, pages: 1, total: 0 }));
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });

      if (filter !== "all") {
        params.append("transactionType", filter);
      }

      const response = await axios.get(`${API_BASE}/transactions/admin/user/${userId}?${params.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (response.data?.success) {
        const normalized = normalizeTransactionResponse(response.data);
        setTransactions(normalized.transactions);
        setPagination(normalized.pagination);
      } else {
        setTransactions([]);
        setPagination((prev) => ({ ...prev, page: 1, pages: 1, total: 0 }));
      }
    } catch (error) {
      console.error("❌ Failed to fetch transactions:", error.message);
      toast.error(error.response?.data?.message || "Failed to load statement history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserTransactions(1, selectedUserId);
    } else {
      setTransactions([]);
      setPagination((prev) => ({ ...prev, page: 1, pages: 1, total: 0 }));
    }
  }, [selectedUserId, filter]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) {
      return users;
    }

    const term = userSearch.trim().toLowerCase();
    return users.filter((user) => {
      const fullName = String(user.fullName || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const phone = String(user.phoneNumber || "").toLowerCase();
      const id = String(user._id || "").toLowerCase();
      return (
        fullName.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        id.includes(term)
      );
    });
  }, [users, userSearch]);

  const selectedUser = useMemo(
    () => users.find((user) => user._id === selectedUserId) || null,
    [users, selectedUserId]
  );

  const handleEditClick = (tx) => {
    setSelectedTx(tx);
    setEditData({
      amount: Number(tx.amount || 0),
      status: tx.status || "pending",
      notes: tx.notes || "",
      source: tx.source || "transaction",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTx?._id) return;

    if (!editData.amount || Number(editData.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    try {
      const payload = {
        amount: Number(editData.amount),
        status: editData.status,
        notes: editData.notes,
      };

      const response = await axios.put(
        `${API_BASE}/transactions/admin-entry/${editData.source || selectedTx.source || "transaction"}/${selectedTx._id}`,
        payload,
        { headers: getAuthHeaders() }
      );

      if (response.data?.success) {
        toast.success("✅ Statement updated successfully");
        setShowEditModal(false);
        setSelectedTx(null);
        await fetchUserTransactions(pagination.page, selectedUserId);
      }
    } catch (error) {
      console.error("Update error:", error.message);
      toast.error(error.response?.data?.message || "Failed to update statement");
    }
  };

  const handleDelete = async (txId) => {
    if (!txId) return;

    const userName = selectedUser?.fullName || "this user";
    if (!globalThis.confirm(`Delete statement item for ${userName}? This cannot be undone.`)) {
      return;
    }

    try {
      const source = selectedTx?.source || transactions.find((item) => item._id === txId)?.source || "transaction";
      const response = await axios.delete(`${API_BASE}/transactions/admin-entry/${source}/${txId}`, {
        headers: getAuthHeaders(),
      });

      if (response.data?.success) {
        toast.success("✅ Statement item deleted");
        await fetchUserTransactions(pagination.page, selectedUserId);
      }
    } catch (error) {
      console.error("Delete error:", error.message);
      toast.error(error.response?.data?.message || "Failed to delete statement item");
    }
  };

  const getStatusColor = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "success":
      case "completed":
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTxIcon = (type) => (type === "deposit" ? "📥" : "📤");

  const getStatusOptions = (source) => {
    if (source === "deposit" || source === "withdraw") {
      return [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ];
    }

    return [
      { value: "pending", label: "Pending" },
      { value: "success", label: "Success" },
      { value: "failed", label: "Failed" },
    ];
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN");
  };

  let usersContent = null;
  if (usersLoading) {
    usersContent = (
      <div className="py-10 text-center text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        Loading users...
      </div>
    );
  } else if (filteredUsers.length === 0) {
    usersContent = <div className="py-10 text-center text-gray-500 text-sm">No users found</div>;
  } else {
    usersContent = filteredUsers.map((user) => (
      <button
        key={user._id}
        onClick={() => setSelectedUserId(user._id)}
        className={`w-full text-left p-3 rounded-lg border transition ${
          selectedUserId === user._id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
        }`}
      >
        <p className="font-semibold text-gray-900 truncate">{user.fullName || "Unnamed User"}</p>
        <p className="text-xs text-gray-600 truncate">{user.email || "No email"}</p>
        <p className="text-xs text-gray-500 truncate">{user._id}</p>
      </button>
    ));
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">💳 User Statements</h1>
          <p className="text-gray-600">Select a user, then edit or delete statement history entries</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Users</h2>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-[65vh] overflow-y-auto space-y-2 pr-1">
              {usersContent}
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-md p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Selected User</p>
                <p className="font-semibold text-gray-900">
                  {selectedUser ? `${selectedUser.fullName || "Unnamed"} (${selectedUser._id})` : "Select a user from the list"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={selectedUserId === ""}
                >
                  <option value="all">All Transactions</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdraw">Withdrawals</option>
                </select>

                <p className="text-sm text-gray-600">
                  Total: <span className="font-bold text-blue-600">{pagination.total || 0}</span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {!selectedUserId ? (
                <div className="p-12 text-center text-gray-600">Please select a user to view statement history.</div>
              ) : loading ? (
                <div className="p-12 text-center text-gray-600">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                  Loading statement history...
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-12 text-center text-gray-600">No statement history found for this user.</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-[860px] w-full">
                      <thead className="bg-gray-100 border-b border-gray-300">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Method</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                          <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {transactions.map((tx) => (
                          <tr key={tx._id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4">
                              <span className="text-xl">{getTxIcon(tx.transactionType)}</span>
                              <span className="ml-2 text-sm font-medium capitalize text-gray-700">{tx.transactionType}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-lg font-bold ${
                                  tx.transactionType === "deposit" ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {tx.transactionType === "deposit" ? "+" : "-"}₹{Number(tx.amount || 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tx.status)}`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 uppercase">{tx.type || "-"}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(tx.createdAt)}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEditClick(tx)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="Edit"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(tx._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {pagination.pages > 1 && (
                    <div className="bg-gray-100 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-300">
                      <button
                        onClick={() => fetchUserTransactions(Math.max(1, pagination.page - 1), selectedUserId)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-700 font-medium order-first sm:order-none w-full sm:w-auto text-center">
                        Page {pagination.page} of {pagination.pages}
                      </span>
                      <button
                        onClick={() => fetchUserTransactions(Math.min(pagination.pages, pagination.page + 1), selectedUserId)}
                        disabled={pagination.page === pagination.pages}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditModal && selectedTx && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">✏️ Edit Statement Item</h2>

            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600">User</p>
                <p className="font-semibold text-gray-900">{selectedUser?.fullName || "Selected User"}</p>
              </div>

              <div>
                <label htmlFor="statement-amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  id="statement-amount"
                  type="number"
                  min="1"
                  value={editData.amount}
                  onChange={(e) => setEditData({ ...editData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="statement-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="statement-status"
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {getStatusOptions(editData.source || selectedTx.source || "transaction").map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="statement-notes" className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                <textarea
                  id="statement-notes"
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  placeholder="Add any notes for this statement item"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTx(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
