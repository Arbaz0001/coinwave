import React, { useEffect, useMemo, useState } from "react";
import { Edit2, Trash2, Search, Loader2, Users, Star } from "lucide-react";
import axios from "axios";
import { API_CONFIG } from "../config/api.config";

const API_BASE = API_CONFIG.API_BASE;

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

export default function BankAccountsManager() {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const [formData, setFormData] = useState({
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    bankName: "",
    accountType: "Savings",
    verified: false,
    isPrimary: false,
    notes: "",
  });

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await axios.get(`${API_BASE}/admin/users`, {
        headers: getAuthHeaders(),
      });

      const list = response.data?.users || [];
      const sortedUsers = [...list].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setUsers(sortedUsers);

      if (!selectedUserId && sortedUsers.length > 0) {
        setSelectedUserId(sortedUsers[0]._id);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      globalThis.alert(error.response?.data?.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchUserAccounts = async (userId = selectedUserId) => {
    if (!userId) {
      setAccounts([]);
      return;
    }

    try {
      setAccountsLoading(true);
      const response = await axios.get(`${API_BASE}/bank-accounts/admin/user/${userId}`, {
        headers: getAuthHeaders(),
      });

      if (response.data?.success) {
        setAccounts(response.data.data || []);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error("Error fetching user accounts:", error);
      globalThis.alert(error.response?.data?.message || "Failed to load bank accounts");
    } finally {
      setAccountsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchUserAccounts(selectedUserId);
  }, [selectedUserId]);

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) => {
      const fullName = String(user.fullName || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const phone = String(user.phoneNumber || "").toLowerCase();
      const id = String(user._id || "").toLowerCase();
      return fullName.includes(term) || email.includes(term) || phone.includes(term) || id.includes(term);
    });
  }, [users, userSearch]);

  const selectedUser = useMemo(
    () => users.find((user) => user._id === selectedUserId) || null,
    [users, selectedUserId]
  );

  const openEditModal = (account) => {
    setEditingAccount(account);
    setFormData({
      accountNumber: account.accountNumber || "",
      ifscCode: account.ifscCode || "",
      accountHolderName: account.accountHolderName || "",
      bankName: account.bankName || "",
      accountType: account.accountType || "Savings",
      verified: Boolean(account.verified),
      isPrimary: Boolean(account.isPrimary),
      notes: account.notes || "",
    });
    setShowModal(true);
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingAccount?._id) return;

    if (!formData.accountNumber || !formData.ifscCode || !formData.accountHolderName || !formData.bankName) {
      globalThis.alert("Please fill all required fields");
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE}/bank-accounts/admin/${editingAccount._id}`,
        formData,
        { headers: getAuthHeaders() }
      );

      if (response.data?.success) {
        setShowModal(false);
        setEditingAccount(null);
        fetchUserAccounts(selectedUserId);
      }
    } catch (error) {
      console.error("Error updating account:", error);
      globalThis.alert(error.response?.data?.message || "Failed to update account");
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!globalThis.confirm("Delete this bank account? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE}/bank-accounts/admin/${accountId}`, {
        headers: getAuthHeaders(),
      });

      if (response.data?.success) {
        fetchUserAccounts(selectedUserId);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      globalThis.alert(error.response?.data?.message || "Failed to delete account");
    }
  };

  const handleSetPrimary = async (account) => {
    try {
      const response = await axios.put(
        `${API_BASE}/bank-accounts/admin/${account._id}`,
        { isPrimary: true },
        { headers: getAuthHeaders() }
      );

      if (response.data?.success) {
        fetchUserAccounts(selectedUserId);
      }
    } catch (error) {
      console.error("Error setting primary:", error);
      globalThis.alert(error.response?.data?.message || "Failed to set primary account");
    }
  };

  const maskAccount = (accountNumber) => {
    const value = String(accountNumber || "");
    if (value.length <= 4) return value;
    return value.slice(-4).padStart(value.length, "*");
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
    <div className="p-3 sm:p-4 md:p-6 bg-white rounded-lg">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">🏦 Bank Accounts</h1>
        <p className="text-gray-600">Select user and manage bank account details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Users</h2>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="Search user"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="max-h-[65vh] overflow-y-auto space-y-2 pr-1">{usersContent}</div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4">
            <p className="text-sm text-gray-500">Selected User</p>
            <p className="font-semibold text-gray-900">
              {selectedUser ? `${selectedUser.fullName || "Unnamed"} (${selectedUser._id})` : "Select a user from list"}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {!selectedUserId ? (
              <div className="p-12 text-center text-gray-600">Please select a user.</div>
            ) : accountsLoading ? (
              <div className="p-12 text-center text-gray-600">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                Loading bank accounts...
              </div>
            ) : accounts.length === 0 ? (
              <div className="p-12 text-center text-gray-600">No bank accounts found for this user.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[920px] w-full">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Account</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">IFSC</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Holder</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bank</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Primary</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {accounts.map((account) => (
                      <tr key={account._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm font-mono text-gray-700">{maskAccount(account.accountNumber)}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-700 uppercase">{account.ifscCode}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{account.accountHolderName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{account.bankName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{account.accountType}</td>
                        <td className="px-4 py-3 text-center">
                          {account.isPrimary ? (
                            <span className="inline-flex items-center gap-1 text-green-600 font-semibold text-xs">
                              <Star className="w-3 h-3 fill-green-500" /> Primary
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetPrimary(account)}
                              className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            >
                              Set Primary
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => openEditModal(account)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteAccount(account._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
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
      </div>

      {showModal && editingAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Bank Account</h2>

            <div className="space-y-3">
              <div>
                <label htmlFor="ba-account" className="block font-semibold text-sm mb-1">Account Number</label>
                <input
                  id="ba-account"
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="ba-ifsc" className="block font-semibold text-sm mb-1">IFSC Code</label>
                <input
                  id="ba-ifsc"
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              <div>
                <label htmlFor="ba-holder" className="block font-semibold text-sm mb-1">Account Holder Name</label>
                <input
                  id="ba-holder"
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="ba-bank" className="block font-semibold text-sm mb-1">Bank Name</label>
                <input
                  id="ba-bank"
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="ba-type" className="block font-semibold text-sm mb-1">Account Type</label>
                <select
                  id="ba-type"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="ba-primary"
                  type="checkbox"
                  name="isPrimary"
                  checked={formData.isPrimary}
                  onChange={handleFormChange}
                  className="w-4 h-4"
                />
                <label htmlFor="ba-primary" className="text-sm font-semibold">Set as primary</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="ba-verified"
                  type="checkbox"
                  name="verified"
                  checked={formData.verified}
                  onChange={handleFormChange}
                  className="w-4 h-4"
                />
                <label htmlFor="ba-verified" className="text-sm font-semibold">Verified</label>
              </div>

              <div>
                <label htmlFor="ba-notes" className="block font-semibold text-sm mb-1">Notes</label>
                <textarea
                  id="ba-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingAccount(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
