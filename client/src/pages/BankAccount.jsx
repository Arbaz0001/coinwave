import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { API_CONFIG } from "../config/api.config";
import { Loader2, CreditCard, Building2, Hash, User, Plus } from "lucide-react";

export default function BankAccount() {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await axiosInstance.get(`${API_CONFIG.API_BASE}/users/bank-details`);
      
      if (response.data?.success && response.data?.data) {
        setAccount(response.data.data);
      } else {
        setAccount(null);
      }
    } catch (err) {
      console.error("Error fetching bank details:", err);
      setError(err.response?.data?.message || "Failed to load bank details");
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-gray-600">Loading bank details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <didiv className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            💳 Payment Methods
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/bank-account-manager")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            <Plus size={20} />
            Add Bank Account
          </button>
        </div Bank Account Details
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {account ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-white" />
                <div>
                  <p className="text-blue-100 text-sm">Saved Bank Account</p>
                  <p className="text-white font-semibold text-lg">
                    {account.bankName || "Bank Account"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Account Holder */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Account Holder Name</p>
                  <p className="text-gray-900 font-semibold text-lg">
                    {account.accountHolderName || "N/A"}
                  </p>
                </div>
              </div>

              {/* Account Number */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Hash className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Account Number</p>
                  <p className="text-gray-900 font-semibold text-lg tracking-wider">
                    {account.accountNumber || "N/A"}
                  </p>
                </div>
              </div>

              {/* IFSC Code */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">IFSC Code</p>
                  <p className="text-gray-900 font-semibold text-lg tracking-wide">
                    {account.ifscCode || "N/A"}
                  </p>
                </div>
              </div>

              {/* Bank Name */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Bank Name</p>
                  <p className="text-gray-900 font-semibold text-lg">
                    {account.bankName || "N/A"}
                  </p>
                </div>
              </div>

              {/* UPI ID */}
              {account.upiId && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">UPI ID</p>
                    <p className="text-blue-600 font-semibold text-lg font-mono">
                      {account.upiId}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                ℹ️ These details were saved from your last withdrawal request
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg font-medium mb-2">
              No Bank Account Linked
            </p>
            <p className="text-gray-500 text-sm">
              Your bank details will be saved when you make your first withdrawal
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
