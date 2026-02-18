import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Star, Loader, AlertCircle } from "lucide-react";
import * as adminBankAccountService from "../services/adminBankAccountService";

const AdminBankAccountManager = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    bankName: "",
    accountType: "Savings",
    notes: "",
    isPrimary: false,
  });

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Fetch admin's bank accounts
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await adminBankAccountService.getAdminBankAccounts();
      if (response.success) {
        setAccounts(response.data || []);
      } else {
        console.error("Error fetching accounts:", response.message);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      alert("Failed to load bank accounts");
    } finally {
      setLoading(false);
    }
  };

  // Open modal for adding/editing
  const openModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        accountNumber: account.accountNumber,
        ifscCode: account.ifscCode,
        accountHolderName: account.accountHolderName,
        bankName: account.bankName,
        accountType: account.accountType,
        notes: account.notes || "",
        isPrimary: account.isPrimary,
      });
    } else {
      setEditingAccount(null);
      setFormData({
        accountNumber: "",
        ifscCode: "",
        accountHolderName: "",
        bankName: "",
        accountType: "Savings",
        notes: "",
        isPrimary: false,
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
    if (!formData.accountNumber || !formData.ifscCode || !formData.accountHolderName || !formData.bankName) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate IFSC code format
    if (formData.ifscCode.length !== 11) {
      alert("IFSC code must be 11 characters");
      return;
    }

    try {
      let response;
      if (editingAccount) {
        response = await adminBankAccountService.updateAdminBankAccount(editingAccount._id, formData);
      } else {
        response = await adminBankAccountService.addAdminBankAccount(formData);
      }

      if (response.success) {
        alert(response.message);
        setShowModal(false);
        fetchAccounts();
      } else {
        alert(response.message || "Failed to save account");
      }
    } catch (error) {
      console.error("Error saving account:", error);
      alert(error.message || "Failed to save account");
    }
  };

  // Delete account
  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;

    try {
      const response = await adminBankAccountService.deleteAdminBankAccount(accountId);
      if (response.success) {
        alert("Account deleted successfully");
        fetchAccounts();
      } else {
        alert(response.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert(error.message || "Failed to delete account");
    }
  };

  // Set account as primary
  const handleSetPrimary = async (accountId) => {
    try {
      const response = await adminBankAccountService.setAdminPrimaryBankAccount(accountId);
      if (response.success) {
        fetchAccounts();
      } else {
        alert(response.message || "Failed to set primary account");
      }
    } catch (error) {
      console.error("Error setting primary account:", error);
      alert(error.message || "Failed to set primary account");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🏦 Bank Accounts</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          <Plus size={20} />
          Add Account
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader className="animate-spin text-blue-500" size={32} />
        </div>
      )}

      {/* Accounts List */}
      {!loading && accounts.length > 0 && (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account._id}
              className={`p-4 border rounded-lg transition ${
                account.isPrimary
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{account.bankName}</h3>
                    {account.isPrimary && (
                      <Star
                        size={20}
                        className="text-yellow-500 fill-yellow-500"
                        title="Primary Account"
                      />
                    )}
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {account.accountType}
                    </span>
                  </div>
                  <p className="text-gray-600">Holder: {account.accountHolderName}</p>
                  <p className="text-gray-500 text-sm font-mono">
                    Account: {account.accountNumber.slice(-4).padStart(account.accountNumber.length, "*")}
                  </p>
                  <p className="text-gray-500 text-sm font-mono">IFSC: {account.ifscCode}</p>
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
                    title={account.isPrimary ? "Primary Account" : "Set as Primary"}
                    disabled={account.isPrimary}
                  >
                    <Star size={18} />
                  </button>
                  <button
                    onClick={() => openModal(account)}
                    className="p-2 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                    title="Edit Account"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account._id)}
                    className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200 transition"
                    title="Delete Account"
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
          <div className="flex justify-center mb-4">
            <AlertCircle size={48} className="text-gray-400" />
          </div>
          <p className="text-lg mb-4">No bank accounts saved yet</p>
          <p className="text-sm text-gray-400 mb-4">Add your bank account details for withdrawal requests</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            <Plus size={20} />
            Add Your First Account
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingAccount ? "Edit Bank Account" : "Add Bank Account"}
            </h2>

            <div className="space-y-3">
              {/* Account Number */}
              <div>
                <label htmlFor="admin-ba-account-number" className="block font-semibold text-sm mb-1">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="admin-ba-account-number"
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleFormChange}
                  placeholder="Enter 12-18 digit account number"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* IFSC Code */}
              <div>
                <label htmlFor="admin-ba-ifsc" className="block font-semibold text-sm mb-1">
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="admin-ba-ifsc"
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleFormChange}
                  placeholder="ABCD0123456"
                  maxLength="11"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              {/* Account Holder Name */}
              <div>
                <label htmlFor="admin-ba-holder" className="block font-semibold text-sm mb-1">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="admin-ba-holder"
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleFormChange}
                  placeholder="Full name as per bank records"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Bank Name */}
              <div>
                <label htmlFor="admin-ba-bank" className="block font-semibold text-sm mb-1">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="admin-ba-bank"
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleFormChange}
                  placeholder="e.g., HDFC Bank, SBI, ICICI"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Account Type */}
              <div>
                <label htmlFor="admin-ba-account-type" className="block font-semibold text-sm mb-1">Account Type</label>
                <select
                  id="admin-ba-account-type"
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

              {/* Notes */}
              <div>
                <label htmlFor="admin-ba-notes" className="block font-semibold text-sm mb-1">
                  Notes <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  id="admin-ba-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Add any notes for this account"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Set as Primary */}
              {!editingAccount && (
                <div className="flex items-center">
                  <input
                    id="admin-ba-primary"
                    type="checkbox"
                    name="isPrimary"
                    checked={formData.isPrimary}
                    onChange={handleFormChange}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="admin-ba-primary" className="ml-2 font-semibold text-sm">Set as primary account</label>
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold"
              >
                {editingAccount ? "Update" : "Add"} Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBankAccountManager;
