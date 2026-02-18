import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Star, Loader } from "lucide-react";
import * as upiAccountService from "../services/upiAccountService";

/**
 * User UPI Account Manager Component
 * Allows users to manage multiple UPI IDs
 */
const UpiManager = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    upiId: "",
    upiName: "",
    provider: "Other",
    isPrimary: false,
    notes: "",
  });

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Fetch user's UPI accounts
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await upiAccountService.getUserUpiAccounts();
      if (response.success) {
        setAccounts(response.data || []);
      } else {
        console.error("Error fetching UPI accounts:", response.message);
      }
    } catch (error) {
      console.error("Error fetching UPI accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for adding/editing
  const openModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        upiId: account.upiId,
        upiName: account.upiName,
        provider: account.provider,
        isPrimary: account.isPrimary,
        notes: account.notes || "",
      });
    } else {
      setEditingAccount(null);
      setFormData({
        upiId: "",
        upiName: "",
        provider: "Other",
        isPrimary: false,
        notes: "",
      });
    }
    setShowModal(true);
  };

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Save (add or update) account
  const handleSaveAccount = async () => {
    // Validate required fields
    if (!formData.upiId || !formData.upiName) {
      alert("Please fill in UPI ID and name");
      return;
    }

    // Validate UPI ID format (basic check)
    if (!formData.upiId.includes("@")) {
      alert("Invalid UPI ID format. Must contain @");
      return;
    }

    try {
      let response;
      if (editingAccount) {
        // Update existing account
        response = await upiAccountService.updateUpiAccount(editingAccount._id, formData);
      } else {
        // Add new account
        response = await upiAccountService.addUpiAccount(formData);
      }

      if (response.success) {
        alert(response.message);
        setShowModal(false);
        fetchAccounts();
      } else {
        alert(response.message || "Failed to save UPI account");
      }
    } catch (error) {
      console.error("Error saving UPI account:", error);
      alert(error.response?.data?.message || "Failed to save UPI account");
    }
  };

  // Delete account
  const handleDeleteAccount = async (accountId) => {
    if (!globalThis.confirm("Are you sure you want to delete this UPI account?")) return;

    try {
      const response = await upiAccountService.deleteUpiAccount(accountId);
      if (response.success) {
        alert("UPI account deleted successfully");
        fetchAccounts();
      } else {
        alert(response.message || "Failed to delete UPI account");
      }
    } catch (error) {
      console.error("Error deleting UPI account:", error);
      alert("Failed to delete UPI account");
    }
  };

  // Set primary account
  const handleSetPrimary = async (accountId) => {
    try {
      const response = await upiAccountService.setPrimaryUpi(accountId);
      if (response.success) {
        alert("Primary UPI account set successfully");
        fetchAccounts();
      } else {
        alert(response.message || "Failed to set primary UPI");
      }
    } catch (error) {
      console.error("Error setting primary UPI:", error);
      alert("Failed to set primary UPI");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">💳 My UPI Accounts</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
        >
          <Plus size={20} />
          Add UPI
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin text-purple-600" size={32} />
        </div>
      )}

      {/* UPI Accounts List */}
      {!loading && accounts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map((account) => (
            <div
              key={account._id}
              className={`p-4 border rounded-lg transition ${
                account.isPrimary
                  ? "border-purple-400 bg-purple-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{account.upiName}</h3>
                    {account.isPrimary && (
                      <Star
                        size={20}
                        className="text-yellow-500 fill-yellow-500"
                        title="Primary UPI"
                      />
                    )}
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {account.provider}
                    </span>
                  </div>
                  <p className="text-blue-600 text-sm font-mono">💳 {account.upiId}</p>
                  {account.notes && <p className="text-gray-600 text-sm mt-1">📝 {account.notes}</p>}
                  <p className="text-gray-400 text-xs mt-2">
                    Added: {new Date(account.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleSetPrimary(account._id)}
                    className={`p-2 rounded transition ${
                      account.isPrimary
                        ? "bg-gray-200 text-gray-400"
                        : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                    }`}
                    title={account.isPrimary ? "Primary UPI" : "Set as Primary"}
                    disabled={account.isPrimary}
                  >
                    <Star size={18} />
                  </button>
                  <button
                    onClick={() => openModal(account)}
                    className="p-2 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                    title="Edit UPI"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account._id)}
                    className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200 transition"
                    title="Delete UPI"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Accounts Message */}
      {!loading && accounts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-4">No UPI accounts saved yet</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            <Plus size={20} />
            Add Your First UPI
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingAccount ? "Edit UPI Account" : "Add UPI Account"}
            </h2>

            <div className="space-y-3">
              {/* UPI ID */}
              <div>
                <label htmlFor="upi-id" className="block font-semibold text-sm mb-1">
                  UPI ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="upi-id"
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleFormChange}
                  placeholder="username@paytm, 9876543210@upi"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* UPI Name */}
              <div>
                <label htmlFor="upi-name" className="block font-semibold text-sm mb-1">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="upi-name"
                  type="text"
                  name="upiName"
                  value={formData.upiName}
                  onChange={handleFormChange}
                  placeholder="Full name as per UPI account"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Provider */}
              <div>
                <label htmlFor="provider" className="block font-semibold text-sm mb-1">Provider</label>
                <select
                  id="provider"
                  name="provider"
                  value={formData.provider}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Paytm">Paytm</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="GooglePay">Google Pay</option>
                  <option value="BHIM">BHIM</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block font-semibold text-sm mb-1">
                  Notes (Optional)
                </label>
                <input
                  id="notes"
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="e.g., Personal, Business"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Set as Primary */}
              {!editingAccount && (
                <div className="flex items-center">
                  <input
                    id="is-primary"
                    type="checkbox"
                    name="isPrimary"
                    checked={formData.isPrimary}
                    onChange={handleFormChange}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="is-primary" className="ml-2 font-semibold text-sm">Set as primary UPI</label>
                </div>
              )}
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAccount}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition font-semibold"
              >
                {editingAccount ? "Update" : "Add"} UPI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpiManager;
