import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BankAccountManager from "../components/BankAccountManager";

/**
 * Bank Account Page
 * Dedicated page for managing user bank accounts
 */
export default function BankAccountPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("cw_user");
    if (!storedUser) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Bank Accounts</h1>
        </div>

        {/* Bank Account Manager Component */}
        <BankAccountManager />

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Set one account as primary - it will be auto-selected for withdrawals</li>
            <li>• You can have multiple accounts and switch between them anytime</li>
            <li>• Keep your bank details accurate for faster withdrawal processing</li>
            <li>• Delete accounts you no longer use to keep your list clean</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
