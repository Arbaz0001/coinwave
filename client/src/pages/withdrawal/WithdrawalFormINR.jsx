import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, AlertCircle, Check } from "lucide-react";
import * as bankAccountService from "../../services/bankAccountService";
import { API_CONFIG } from "../../config/api.config";

const WithdrawalFormINR = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Bank"); // "UPI" or "Bank"
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [manualEntry, setManualEntry] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    accountNumber: "",
    ifsc: "",
    upiId: "",
  });

  const user = JSON.parse(localStorage.getItem("cw_user"));
  const accessToken = localStorage.getItem("accessToken");
  const userId = user?._id || user?.id;

  // Fetch bank accounts on component mount
  useEffect(() => {
    fetchBankAccounts();
  }, []);

  // Update form data when account is selected
  useEffect(() => {
    if (selectedAccount && !manualEntry) {
      setFormData((prev) => ({
        ...prev,
        accountNumber: selectedAccount.accountNumber || "",
        ifsc: selectedAccount.ifscCode || "",
        firstName: selectedAccount.accountHolderName?.split(" ")[0] || "",
        lastName: selectedAccount.accountHolderName?.split(" ").slice(1).join(" ") || "",
      }));
    }
  }, [selectedAccount, manualEntry]);

  const fetchBankAccounts = async () => {
    setLoading(true);
    try {
      const response = await bankAccountService.getUserBankAccounts();
      if (response.success && response.data && response.data.length > 0) {
        setAccounts(response.data);
        // Auto-select primary account or first account
        const primaryAccount = response.data.find((acc) => acc.isPrimary);
        const accountToSelect = primaryAccount || response.data[0];
        setSelectedAccount(accountToSelect);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAccountSelect = (e) => {
    const accountId = e.target.value;
    const account = accounts.find((acc) => acc._id === accountId);
    setSelectedAccount(account);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount) {
      setPopupMessage("❌ Please enter withdrawal amount");
      setShowPopup(true);
      return;
    }

    // Validate based on payment method
    if (paymentMethod === "Bank") {
      if (!selectedAccount && !manualEntry) {
        setPopupMessage("❌ Please select or add a bank account");
        setShowPopup(true);
        return;
      }
    } else if (paymentMethod === "UPI") {
      if (!formData.upiId || !formData.upiId.includes("@")) {
        setPopupMessage("❌ Please enter a valid UPI ID (e.g., yourname@paytm)");
        setShowPopup(true);
        return;
      }
    }

    setSubmitting(true);
    try {
      const apiBase = API_CONFIG.API_BASE;
      
      // Prepare request data based on payment method
      const requestData = {
        userId,
        amount: formData.amount,
        method: "NRI",
        paymentMethod: paymentMethod,
        details: formData,
        remarks: `Withdrawal request for INR via ${paymentMethod}`,
      };

      // Add account IDs based on payment method
      if (paymentMethod === "Bank") {
        requestData.bankAccountId = selectedAccount?._id || null;
      } else if (paymentMethod === "UPI") {
        requestData.upiId = formData.upiId;
      }

      await axios.post(
        `${apiBase}/withdraws/create`,
        requestData,
        {
          headers: {
            Authorization: accessToken,
          },
          withCredentials: true,
        }
      );

      setPopupMessage("✅ Your INR withdrawal request has been submitted successfully!");
      setShowPopup(true);

      // Reset form
      setFormData({
        amount: "",
        email: "",
        phone: "",
        firstName: "",
        lastName: "",
        accountNumber: "",
        ifsc: "",
      });
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      setPopupMessage("❌ Error submitting withdrawal. Please try again.");
      setShowPopup(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white text-gray-900 py-6 px-4 flex justify-center min-h-screen">
      <div className="flex items-start flex-col min-h-screen w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Withdraw INR</h2>

        {/* Payment Method Selection */}
        <div className="w-full mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <label className="block mb-3 font-semibold text-gray-800">
            💰 Select Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("Bank")}
              className={`p-3 rounded-lg font-medium transition-all ${
                paymentMethod === "Bank"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              🏦 Bank Transfer
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("UPI")}
              className={`p-3 rounded-lg font-medium transition-all ${
                paymentMethod === "UPI"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              💳 UPI
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {paymentMethod === "UPI" 
              ? "✅ Payment will be sent to your UPI ID" 
              : "✅ Payment will be transferred to your bank account"}
          </p>
        </div>

        {/* Account Selection Section */}
        {loading ? (
          <div className="w-full bg-gray-100 rounded-lg p-4 text-center">
            <p className="text-gray-600">Loading your accounts...</p>
          </div>
        ) : paymentMethod === "Bank" ? (
          // Bank Account Selection
          accounts.length > 0 && !manualEntry ? (
            <div className="w-full mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block mb-3 font-semibold text-gray-800">
                🏦 Select Bank Account
              </label>
              <select
                value={selectedAccount?._id || ""}
                onChange={handleAccountSelect}
                className="w-full bg-white border border-gray-300 px-4 py-2 rounded-md text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Account --</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.accountHolderName} ({account.accountNumber.slice(-4)}) {account.isPrimary ? "⭐ Primary" : ""}
                  </option>
                ))}
              </select>

              {selectedAccount && (
                <div className="mt-3 bg-white rounded p-3 border-l-4 border-green-500">
                  <p className="text-sm text-gray-600">
                    <strong>Account:</strong> {selectedAccount.accountNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Bank:</strong> {selectedAccount.bankName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Type:</strong> {selectedAccount.accountType}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setManualEntry(!manualEntry)}
                className="mt-3 w-full text-blue-600 hover:text-blue-700 text-sm font-semibold underline"
              >
                {manualEntry ? "Use Saved Account" : "Or Enter Manually"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/bank-account")}
                className="mt-2 w-full flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded-md text-sm font-semibold"
              >
                <Plus size={16} /> Add New Bank Account
              </button>
            </div>
          ) : (
            <div className="w-full mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-1 text-amber-600" size={18} />
                <div>
                  <p className="text-amber-900 font-semibold mb-2">No Bank Accounts Found</p>
                  <p className="text-sm text-amber-800 mb-3">
                    Add a bank account before making a withdrawal. You can manage multiple accounts and set a primary one.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/bank-account")}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded font-semibold text-sm"
                  >
                    <Plus size={16} /> Add Bank Account
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          // UPI ID Input
          <div className="w-full mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <label className="block mb-3 font-semibold text-gray-800">
              💳 Enter UPI ID
            </label>
            <input
              type="text"
              name="upiId"
              value={formData.upiId}
              onChange={handleChange}
              placeholder="e.g., yourname@paytm or 9876543210@upi"
              className="w-full bg-white border border-gray-300 px-4 py-2 rounded-md text-gray-800 outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-600 mt-2">
              ℹ️ Enter your UPI ID. We'll send payment directly to this account.
            </p>
          </div>
        )}

        {/* Withdrawal Form */}
        {(!loading && accounts.length === 0) || manualEntry ? (
          <>
            <div className="w-full bg-gray-100 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-600">ℹ️ Fill in your bank account details to complete the withdrawal</p>
            </div>
          </>
        ) : null}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Withdrawal Amount (INR)
            </label>
            <input
              type="number"
              name="amount"
              placeholder="Enter amount"
              className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.amount}
              onChange={handleChange}
              min={100}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-800">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-800">Phone</label>
            <input
              type="text"
              name="phone"
              placeholder="Enter phone number"
              className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {(manualEntry || accounts.length === 0) && (
            <>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block mb-2 font-semibold text-gray-800">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-2 font-semibold text-gray-800">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-800">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  placeholder="Enter bank account number"
                  className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  required={manualEntry || accounts.length === 0}
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-800">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifsc"
                  placeholder="Enter IFSC Code"
                  className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.ifsc}
                  onChange={handleChange}
                  required={manualEntry || accounts.length === 0}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-md font-semibold"
          >
            {submitting ? "Processing..." : "Submit Withdrawal"}
          </button>
        </form>
      </div>

      {/* Popup Message */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white text-black rounded-md shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">{popupMessage.includes("✅") ? "Success" : "Notice"}</h2>
            <p>{popupMessage}</p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalFormINR;
